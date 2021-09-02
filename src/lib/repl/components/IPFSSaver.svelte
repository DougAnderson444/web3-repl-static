<script>
	import { onMount } from 'svelte';
	import Saver from '../js/ipfs-saver.js';
	import { components } from '../js/store.js';

	import Message from './Message.svelte';
	import { fade } from 'svelte/transition';
	import { is_browser } from '../js/env.js';

	export let serializedSource;

	export let path;

	let saver;
	export let rootCID;
	let saveSrc;

	onMount(() => {
		// init IPFS saver
		saver = is_browser && new Saver();
		saveSrc = async () => {
			// console.log('serializedSource changed');
			const result = await saver.add({
				path: path || 'index.html',
				content: serializedSource
			});
			rootCID = result.cid.toString();
		};
	});

	$: serializedSource && saveSrc && saveSrc();
</script>

<div class="inner">
	{#if rootCID}
		{#await rootCID}
			<!-- promise is pending -->
			<p transition:fade>waiting for the promise to resolve...</p>
		{:then rootCID}
			<!-- promise was fulfilled -->
			<p transition:fade>
				✔️ Preview <a href="https://cloudflare-ipfs.com/ipfs/{rootCID}" target="_blank">
					{$components[0]?.name}.{$components[0]?.type}</a
				>
				on IPFS:
				<!-- <a href="https://dweb.link/api/v0/dag/get?arg={rootCID}"
						target="_blank" >
						{rootCID}</a> -->
				<a href="https://cloudflare-ipfs.com/ipfs/{rootCID}" target="_blank">
					{rootCID}
				</a>
			</p>
		{:catch error}
			<!-- promise was rejected -->
			<p transition:fade>Something went wrong: {error.message}</p>
		{/await}
	{/if}
</div>

<style>
	/* .outter {
		border: none;
		width: 100%;
		padding: 20px 30px;
	} */

	/* .inner {
		min-height: fit-content;
	} */
</style>
