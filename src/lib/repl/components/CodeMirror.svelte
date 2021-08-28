<script>
	import { onMount, createEventDispatcher } from "svelte";
	import { components, currentIndex, currentID } from "../js/store.js";

	const dispatch = createEventDispatcher();

	export let flex = false;
	export let lineNumbers = true;
	export let readonly = false;
	export let tab = true;

	let destroyed = false;
	let updating_externally = false;
	let first = true;
	let code = "";

	let textarea;
	let w;
	let h;
	let editor;
	let CodeMirror;
	let mode; // code mode

	const modes = {
		js: {
			name: "javascript",
			json: false,
		},
		json: {
			name: "javascript",
			json: true,
		},
		svelte: {
			name: "handlebars",
			base: "text/html",
		},
		svx: {
			name: "gfm",
		},
	};

	onMount(() => {
		import("../codemirror/codemirror.js").then((mod) => {
			CodeMirror = mod.default;
			createEditor(mode || "svelte");
		});

		return () => {
			destroyed = true;
			if (editor) editor.toTextArea();
		};
	});

	async function createEditor(mode) {
		if (destroyed || !CodeMirror) return;

		if (editor) editor.toTextArea();

		const opts = {
			lineNumbers,
			lineWrapping: true,
			indentWithTabs: true,
			indentUnit: 2,
			smartIndent: false,
			tabSize: 2,
			value: "",
			mode: modes[mode] || {
				name: mode,
			},
			readOnly: readonly,
			autoCloseBrackets: true,
			autoCloseTags: true,
		};

		if (!tab)
			opts.extraKeys = {
				Tab: tab,
				"Shift-Tab": tab,
			};

		// Creating a text editor is a lot of work, so we yield
		// the main thread for a moment. This helps reduce jank
		if (first) await sleep(50);

		if (destroyed) return;

		editor = CodeMirror.fromTextArea(textarea, opts);

		editor.on("change", (instance) => {
			if (!updating_externally) {
				const value = instance.getValue();
				dispatch("change", { value });
			}
		});

		if (first) await sleep(50);
		editor.refresh();

		first = false;
	}

	function sleep(ms) {
		return new Promise((fulfil) => setTimeout(fulfil, ms));
	}

	// We have to expose set and update methods, rather
	// than making this state-driven through props,
	// because it's difficult to update an editor
	// without resetting scroll otherwise
	export async function set(new_code, new_mode) {
		if (new_mode !== mode) {
			await createEditor((mode = new_mode));
		}

		code = new_code;
		updating_externally = true;
		if (editor) editor.setValue(code);
		updating_externally = false;
	}

	export function update(new_code) {
		code = new_code;
		if (editor) {
			const { left, top } = editor.getScrollInfo();
			editor.setValue(code);
			editor.scrollTo(left, top);
		}
	}

	export function resize() {
		editor.refresh();
	}

	export function focus() {
		editor.focus();
	}
	$: if (editor && w && h) {
		editor.refresh();
	}

	$: if ($components)
		$currentIndex = $components.findIndex(({ id }) => id === $currentID);
</script>

<div
	class="codemirror-container"
	class:flex
	bind:offsetWidth={w}
	bind:offsetHeight={h}
>
	<textarea
		bind:value={$components[$currentIndex].source}
		bind:this={textarea}
	/>
</div>

<style>
	.codemirror-container {
		position: relative;
		width: 100%;
		height: 100%;
		/* calc(100vh - 80px); */
		border: none;
		line-height: 1.5;
		overflow: hidden;
	}

	.codemirror-container :global(.CodeMirror) {
		height: 100%;
		/* background: transparent; */
		background-color: #f3f3f3;
		font: 400 14px/1.7 var(--font-mono);
		padding: 24px 2px;
	}

	.codemirror-container.flex :global(.CodeMirror) {
		height: auto;
	}

	.codemirror-container.flex :global(.CodeMirror-lines) {
		padding: 0;
	}

	.codemirror-container :global(.CodeMirror-gutters) {
		padding: 0 16px 0 8px;
		border: none;
	}

	.codemirror-container :global(.error-loc) {
		position: relative;
		border-bottom: 2px solid #da106e;
	}

	.codemirror-container :global(.error-line) {
		background-color: rgba(200, 0, 0, 0.05);
	}

	textarea {
		visibility: hidden;
	}

	pre {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		border: none;
		padding: 4px 4px 4px 60px;
		resize: none;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.7;
		user-select: none;
		pointer-events: none;
		color: #ccc;
		tab-size: 2;
		-moz-tab-size: 2;
	}

	.flex pre {
		padding: 0 0 0 4px;
		height: auto;
	}
</style>
