<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import CodeMirror from './CodeMirror.svelte';

	const { register_module_editor, handle_edit } = getContext('REPL');

	let editor;
	onMount(() => {
		register_module_editor(editor);
	});
</script>

<div class="editor-wrapper">
	<div class="editor notranslate">
		<CodeMirror bind:this={editor} lineNumbers={true} on:change={handle_edit} />
	</div>
</div>

<style>
	.editor {
		border: 0px solid lightblue;
		border-radius: 3px;
		margin-bottom: 1em;
		height: inherit;
		/* height: calc(100vh - 7%); */
	}

	:global(.columns) .editor-wrapper {
		/* make it easier to interact with scrollbar */
		padding-right: 8px;
		height: auto;
		/* height: 100%; */
	}
</style>
