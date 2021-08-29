<script lang="ts">
	import { onMount } from 'svelte';
	// import Repl from '$lib/repl/Repl.svelte';
	let mounted;
	let Repl;

	onMount(async () => {
		const _r = await import('$lib/repl/Repl.svelte');
		Repl = _r.default;
		mounted = true;
	});
</script>

<svelte:head>
	<title>Web3 Tokenizer REPL</title>
</svelte:head>
{#if mounted}
	<svelte:component this={Repl} />
{:else}
	Loading...
{/if}
