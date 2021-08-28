import type { Component } from "./types"; // eslint-disable-line

import * as rollup from "rollup/dist/es/rollup.browser.js";
import json from 'rollup-plugin-json'

// TODO: Future feature, Add option of access logic as assembly script
// import * as asc from "assemblyscript/cli/asc"
// const { binary, text, stdout, stderr } = asc.compileString(`...`, { optimize: 2 });

import { minify } from "terser";

// you could use unpkg like the official repl, i thought i'd try out jsdelivr
const CDN_URL = "https://cdn.jsdelivr.net/npm";
importScripts(`${CDN_URL}/svelte/compiler.js`); // @3.35.0 importScripts method of the WorkerGlobalScope interface synchronously imports one or more scripts into the worker's scope

// import the mdsvex worker
importScripts(`${CDN_URL}/mdsvex/dist/browser-umd.js`)

// importScripts(`/mdsvex.js`)

const mode = 'dom'
const warnings = []
const diagnostics: Map<string, string>  = new Map();
const cache: Map<string, any>  = new Map();

const component_lookup: Map<string, Component> = new Map();

async function fetch_package(url: string): Promise<string> {
	return (await fetch(url)).text();
}

function generate_lookup(components: Component[]): void {
	components.forEach((component) => {
		component_lookup.set(`./${component.name}.${component.type}`, component);
	});
}

function compare_to_version(major, minor, patch) {
	const v = svelte.VERSION.match(/^(\d+)\.(\d+)\.(\d+)/);
	return v[1] - major || v[2] - minor || v[3] - patch;
}

function has_loopGuardTimeout_feature() {
	return compare_to_version(3, 14, 0) >= 0;
}

async function assertModule(url: string): bool {
	// first, get the url using fetch
	// then, scan the text for the words module.export
	// if it has module.export, then it's cjs not es module
	const mod = await fetch_package(url) 
	const cjs = mod.includes("module.export") || mod.includes("require(")
	return !cjs
}

self.addEventListener(
	"message",
	async (event: MessageEvent<Component[]>): Promise<void> => {
		generate_lookup(event.data);

		// 1. First we bundle, then we 
		// 2. generate actual source code
		const bundle = await rollup.rollup({
			input: "./App.svx",
			plugins: [
				{
					name: "repl-plugin",
					async resolveId(importee: string, importer: string) {
						// handle imports from 'svelte'

						// import x from 'svelte'
						if (importee === "svelte") return `${CDN_URL}/svelte/index.mjs`;

						// import x from 'svelte/somewhere'
						if (importee.startsWith("svelte/")) {
							// .svelte i 7 characters long
							return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
						}

						// import x from './file.js' (via a 'svelte' or 'svelte/x' package)
						if (importer && importer.startsWith(`${CDN_URL}/svelte`)) {
							const resolved = new URL(importee, importer).href;
							if (resolved.endsWith(".mjs")) return resolved;
							return `${resolved}/index.mjs`;
						}

						// local repl components
						// check that this file is in that component look up
						if (component_lookup.has(importee)) return importee;

						// importing from a URL
						if (importee.startsWith('http:') || importee.startsWith('https:')) { return importee }

						// importing from a URL
						if (importee.startsWith('C:') || importee.startsWith('file:')) { return importee }

						// relative imports from a remote package
						if (importee.startsWith("."))
							return new URL(importee, importer).href;

						// skypack relative imports from a remote package
						if (importee.startsWith("/")) {
							const url = new URL(importee, importer).href;
							return url
						}
						// bare named module imports (importing an npm package)

						// get the package.json and load it into memory
						const pkg_url = `${CDN_URL}/${importee}/package.json`;
						let pkg
						let err
						
						const fetched = await fetch_package(pkg_url)

						console.log({fetched})

						if (fetched.includes("Couldn't find the requested file")) return null

						try {
							pkg = JSON.parse(fetched);
						} catch (error) {
							err = true
							pkg = null
						}
						
						// use the aobove url minus `/package.json` to resolve the URL
						const url = pkg_url.replace(/\/package\.json$/, "");
						
						// get an entry point from the pkg.json - first try svelte, then modules, then main
						if (pkg && (pkg.svelte || pkg.browser || pkg.module || pkg.main)) {

							let browerString
							if(pkg.browser) {
								browerString = pkg.browser
								// browser entry might be an object
								if ( typeof pkg.browser === "object" ) browerString = Object.values(pkg.browser)[0]
							}

							const href = new URL(pkg.svelte || browerString || pkg.module || pkg.main, `${url}/`)
								.href;
							
							if(browerString) console.log({ href })
							
							return href
						}else{
							const retUrl = assertModule(`${url}/index.js`) ? `${url}/index.mjs` : `${url}/index.js`
							if(err) console.log(new URL(retUrl).href)
							return new URL(retUrl).href;
						}

						// we probably missed stuff, pass it along as is
						return importee;

					},
					// id is the filepath
					async load(id: string) {
						// local repl components are stored in memory
						// this is our virtual filesystem
						if (component_lookup.has(id))
							return component_lookup.get(id).source;

						// everything else comes from a cdn
						return await fetch_package(id);
					},
					// transform allows us to compile our non-js code
					// id is the filepath
					async transform(code: string, id: string) {

						// our only transforms are to compile svelte components and svx files
						// svelte is avilable to us because we did importScripts at the top
						if (!/\.svelte$|\.svx$/.test(id)) return null

						const name = id
							.split('/')
							.pop()
							.split('.')[0]

						let preprocessPromise

						if (cache && cache.has(id) && cache.get(id).code === code) {
							// console.log(`return cache of ${id}`, cache.get(id))
							return cache.get(id).result.js
						} else if (/\.svx$/.test(id)) {
							preprocessPromise = self.mdsvex
							.mdsvex()
							.markup({ content: code, filename: id })
						} else {
							preprocessPromise = Promise.resolve({ code })
						}

						//@ts-ignore
						return preprocessPromise.then(({ code: v }) => {
							const result = svelte.compile(
								v,
								Object.assign(
									{
										generate: mode,
										format: 'esm',
										dev: false,
										name,
										filename: name + '.svelte'
									},
									has_loopGuardTimeout_feature() && {
										loopGuardTimeout: 100
									}
								)
							)

							cache.set(id, { code: v, result });
							// console.log(`after set: ${id}`, cache.get(id));

							(result.warnings || result.stats.warnings).forEach(warning => {
								// TODO remove stats post-launch
								warnings.push({
									message: warning.message,
									filename: warning.filename,
									start: warning.start,
									end: warning.end
								})
							})

							return result.js
						})
					},
				},
				json()
			],
		});

		// a touch longwinded but output contains an array of chunks
		// we are not code-splitting, so we only have a single chunk
		let output: string = (await bundle.generate({ format: "esm" })).output[0]
			.code;

		output = (await minify(output)).code; //, { sourceMap: true }

		self.postMessage({ output, warnings, diagnostics });
	}
);
