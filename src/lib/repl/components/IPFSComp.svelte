<script>
	import { onMount } from 'svelte';

	export let enabled = true;

	let ipfsNode;
	let mounted;
	$: state = mounted && enabled && !ipfsNode ? 'enabling...' : `enabled`;

	onMount(() => {
		mounted = true;
	});

	$: mounted && enabled && loadIpfs();

	function loadIpfs() {
		// @ts-ignore
		if (typeof ipfs !== 'undefined') {
			// @ts-ignore
			ipfsNode = ipfs;
			console.log('Loading existing ipfs');
		} else {
			console.log('no ipfs yet, create it');

			import('ipfs-browser-global').then(async (module) => {
				await module.default();
				// ipfs now avilable as a global variable
				// @ts-ignore
				console.info('ipfs now a global: \n', { ipfs });
				// @ts-ignore
				ipfsNode = ipfs; // bind the prop to the global
			});
		}
	}
</script>

<main>
	<small>
		<div class="form-check form-switch">
			<input
				class="form-check-input"
				type="checkbox"
				id="flexSwitchCheckDefault"
				bind:checked={enabled}
				disabled={enabled}
			/>
			<label class="form-check-label" for="flexSwitchCheckDefault"
				>IPFS
				{#if enabled}
					<span class="green">
						{state}
					</span>
				{:else}
					disabled
				{/if}
			</label>
		</div>
		{#if ipfsNode}
			{#await ipfsNode.id()}
				Awaiting ipfsNode
			{:then identity}
				<small>
					{#if identity && identity.id}
						{identity.id}
					{/if}
				</small>
			{:catch ipfsNode}Something went wrong with {ipfsNode}{/await}
		{/if}</small
	>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.green {
		color: green;
		font-weight: bolder;
	}
</style>
