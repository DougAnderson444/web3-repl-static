import sveltePreprocess  from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';
import staticAdapter from '@sveltejs/adapter-static';
import ipfsAdapter from 'sveltejs-adapter-ipfs'
import { mdsvex } from 'mdsvex';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import rollupCommonjs from '@rollup/plugin-commonjs'
import { string as moduleToString } from "rollup-plugin-string";

import globals from 'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'

// const pkg = require('./package.json')
import { resolve } from 'path';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

const dev = process.env.NODE_ENV === 'development';

function fixExternal() {
  return {
    name: 'fix-external',
    setup(build) {
      const { external } = build.initialOptions;
      build.onResolve(
        { filter: /^[\w@][^:]/ },
        async ({ path: id, importer, kind, resolveDir }) => {
          if (external && external.includes(id)) {
            return {
              path: id,
              external: true
            }
          }
        })
    }
  }
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	extensions: ['.svelte', '.svx', '.md', '.svelte.md'],
	preprocess: [
		mdsvex({ 
			extensions: ['.svx', '.md', '.svelte.md' ],
			layout: {
				article: "./src/layouts/article.svelte", 
				}
			}),
		sveltePreprocess()
	],
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		// specifying a different adapter
		// adapter: ipfsAdapter(),
		// adapter: vercel(),
		adapter: staticAdapter{
            pages: "docs",
            assets: "docs"
        }),
		paths: {
            // change below to your repo name
            base: dev ? '' : '/web3-repl-static',
        },
		vite: {
			plugins: [
				viteCommonjs(), 
				webWorkerLoader({
					targetPlatform: 'auto',
					sourcemap: false
				}),
				moduleToString({
					// Required to be specified
					include: "**/token-pst.js",
				}),
				// rollupCommonjs(), // doesnt seem to work well
				globals(),
				builtins()
			],
			build: {
				rollupOptions: {}
			},
			// optimizeDeps: {
			// 	exclude: [
			// 		// '@DougAnderson444/inline-source',
			// 	],
			// 	esbuildOptions: {
			// 		plugins: [
			// 			// fixExternal()
			// 		],
			// 	}
			// }
		}
	}
};

export default config;
