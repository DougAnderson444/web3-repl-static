// build adapters
import adapter from '@sveltejs/adapter-auto';
import staticAdapter from '@sveltejs/adapter-static';
// import staticAdapter from 'sveltejs-adapter-ipfs';

import sveltePreprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

// automate web worker build here:
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import { string as moduleToString } from 'rollup-plugin-string';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	extensions: ['.svelte', '.svx', '.md', '.svelte.md'],
	preprocess: [
		mdsvex({
			extensions: ['.svx', '.md', '.svelte.md'],
			layout: {
				article: './src/layouts/article.svelte'
			}
		}),
		sveltePreprocess()
	],
	kit: {
		adapter: staticAdapter({
			pages: 'docs',
			assets: 'docs'
		}),
		paths: {
			// change below to your repo name
			base: dev ? '' : '/web3-repl-static'
		},
		vite: {
			build: {
				rollupOptions: {
					// https://rollupjs.org/guide/en/#big-list-of-options
					output: {
						minifyInternalExports: false,
						compact: false
					},
					plugins: []
				},
				minify: false,
				sourcemap: true,
				optimization: {
					minimize: false
				}
			},
			plugins: [
				// viteCommonjs(),
				moduleToString({
					// Required to be specified
					include: '**/token-pst.js'
				})
				// globals(),
				// builtins()
			],
			build: {
				rollupOptions: {}
			}
		}
	}
};

export default config;
