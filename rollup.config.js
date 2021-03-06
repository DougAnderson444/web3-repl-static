import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import globals from 'rollup-plugin-node-globals'; // process.browser

export default [
	{
		input: 'src/lib/repl/worker.ts',
		output: {
			sourcemap: true,
			format: 'esm',
			file: 'static/worker.js'
		},
		plugins: [
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			globals(), // need to add for mdsvex !(process ).browser
			typescript()
		]
	}
];
