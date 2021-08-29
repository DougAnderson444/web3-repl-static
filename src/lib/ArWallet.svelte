<script>
	import { onMount } from 'svelte';

	let connected;

	onMount(() => {
		if (window.arweaveWallet) connected = true;
	});
</script>

{#if connected}<div><p>✔️Connected to ArConnect</p></div>
{:else}
	❌ No <a href="https://arconnect.io/" target="_blank">wallet</a> installed
{/if}

<style>
	div {
		margin-right: 0em;
		position: fixed;
		top: 1px;
		right: 1px;
		margin-right: 0.5em;
	}
</style>
