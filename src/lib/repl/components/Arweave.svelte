<script>
	import { onMount } from 'svelte';
	import TestWeaveSDK from 'testweave-sdk';
	import Arweave from 'arweave';
	import ArWallet from '$lib/ArWallet.svelte';

	// import Notify from './Notify.svelte';
	// import { inlineSource } from 'inline-source';
	import { inlineSource } from '@DougAnderson444/inline-source';

	export let serializedSource;
	// export let details;
	// export let preview = true;
	// export let publish;

	let account = '2kNoPZhth7i9nRBQikdHUUYP9vx9FqPQP66zaQFDEtoU'; // example

	let coinEndpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=USD';
	// {"arweave":{"usd":16.22}}

	// const WINSTON_PER_AR = 1000000000000;
	// let visible = true;

	let ready;
	// let color = 'primary';
	let arweave;
	let testWeave;
	let statusBeforePost;
	let statusAfterPost;
	let statusAfterMine;
	let uploadProgress = '';
	// let current = 'loading...';
	// let mounted = false;
	let dataTransaction;
	let sourceData;
	let cost;
	let cost_in_ar;
	let ar_price;
	let costPerByte;
	let dataSize;
	let connected;
	let published = false;

	const testConfig = {
		host: 'localhost',
		port: 1984,
		protocol: 'http',
		timeout: 20000,
		logging: false
	};
	const liveConfig = {
		host: 'arweave.net'
	};

	let dev = import.meta.env.DEV || false;
	let arConfig = dev ? testConfig : liveConfig;

	onMount(() => {
		init();
		// console.log('window.arweaveWallet', window.arweaveWallet);
	});

	async function init() {
		arweave = Arweave.init(arConfig);

		console.log({ arweave });

		try {
			let networkInfo = await arweave.network.getInfo();
			if (networkInfo) connected = networkInfo.network; // https://github.com/ArweaveTeam/arweave-js/issues/49
		} catch (error) {
			console.error('Not connected to arweave');
		}

		if (dev) {
			// init TestWeaveSDK on the top of arweave
			testWeave = await TestWeaveSDK.init(arweave);
			// testWeave.rootJWK
			const generatedAddr = await arweave.wallets.getAddress(await testWeave.rootJWK);
			// await testWeave.drop(generatedAddr, '10000');
			const generatedAddressBalance = await arweave.wallets.getBalance(generatedAddr);
		}

		let endpointResponse = await fetch(coinEndpoint);
		let responseJson = await endpointResponse.json();
		ar_price = responseJson.arweave.usd;
	}

	const handleCreateTx = async () => {
		published = false;
		let inlinedSource;
		if (serializedSource)
			try {
				inlinedSource = await inlineSource(serializedSource);
			} catch (error) {
				console.error('Inline source failed');
				inlinedSource = serializedSource;
			}

		dataTransaction = await arweave.createTransaction(
			{
				data: inlinedSource
			},
			testWeave.rootJWK
		);

		dataTransaction.addTag('Content-Type', 'text/html');

		cost = dataTransaction.reward;
		cost_in_ar = arweave.ar.winstonToAr(cost);
		dataSize = dataTransaction.data_size;
		costPerByte = cost_in_ar / dataTransaction.data_size;
	};

	const mine = async () => {
		published = true;

		await arweave.transactions.sign(dataTransaction, testWeave.rootJWK);

		let uploader = await arweave.transactions.getUploader(dataTransaction);

		while (!uploader.isComplete) {
			await uploader.uploadChunk();
			uploadProgress += `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}\n`;
			console.log(uploadProgress);
		}

		if (dev) {
			// in dev mine it right away
			try {
				await testWeave.mine();
			} catch (error) {
				console.error(error);
			}
			statusAfterMine = await arweave.transactions.getStatus(dataTransaction.id);
			console.log({ statusAfterMine }); // this will return 200
			sourceData = await arweave.transactions.getData(dataTransaction.id, {
				decode: true,
				string: true
			});
		} else {
			// wait for a couple of blocks?
		}
	};

	$: serializedSource && testWeave && handleCreateTx();
</script>

<svelte:head>
	<!-- Originally, the npm instal arweave wasnt working for web, so i had to do this: -->
	<!-- <script src="https://unpkg.com/arweave/bundles/web.bundle.js"></script> -->
</svelte:head>

<ArWallet />

{#if !published}
	{#if !costPerByte}
		Preparing preview...
	{:else}
		<div class="estimate">
			Publish for a mere {parseFloat(cost_in_ar).toFixed(7)}AR (about {Number(
				cost_in_ar * ar_price * 100
			).toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD'
			})} once, then use forever)
		</div>
		<button on:click={mine}>Publish 🚀</button>
	{/if}
{:else if sourceData}
	✔️ Published to <a
		href="http://localhost:1984/{dataTransaction.id}/?account={account}"
		target="_blank">Arweave Permaweb</a
	>
{:else}
	Uploading... {uploadProgress}
{/if}
{#if dataTransaction?.id}
	<!-- <br />Tx.id: {dataTransaction.id} -->
{/if}
{#if arweave && connected}
	<span class="connected">Connected to {connected}</span>
{:else}
	<span class="not-connected">Not connected to Arweave</span>
{/if}

<style>
	span {
		padding: 0.5em 0em;
		font-size: x-small;
	}
	.connected {
		color: green;
		display: block;
	}
	.not-connected {
		color: rgb(214, 93, 93);
	}
	div.estimate {
		margin-top: 0.5em;
	}
	button {
		color: #1f1f1f;
		letter-spacing: 0.05em;
		font-weight: 600;
		background-color: var(--accent-color);
		border: 1px solid rgba(85, 85, 85, 0.521);
		border-radius: 4px;
		padding: 0.5em 1em;
	}
</style>
