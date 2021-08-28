<script lang="ts">
	import { onMount } from 'svelte';
	import Repl from '$lib/repl/Repl.svelte';
	let mounted;

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Web3 Tokenizer REPL</title>
</svelte:head>
{#if mounted}
	<svelte:component this={Repl} />
{/if}
