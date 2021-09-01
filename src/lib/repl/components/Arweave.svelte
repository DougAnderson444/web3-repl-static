<script lang="ts">
	import { onMount } from 'svelte';
	import Arweave from 'arweave';
	import ArWallet from '$lib/ArWallet.svelte';
	import { prepOrder, sendOrder } from '$lib/utils/index';

	// import Notify from './Notify.svelte';
	// import { inlineSource } from 'inline-source';
	import { inlineSource } from '@DougAnderson444/inline-source';
	import { CONTRACT_ID, APP_WALLET } from '$lib/utils/constants';
	import type { Transactions } from '$lib/utils';

	export let serializedSource;
	export let ar_price; // from load module up above
	export let rootCID;

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
	let afterPost;
	let afterMine;
	let uploadProgress = '';
	// let current = 'loading...';
	// let mounted = false;
	let dataTransaction;
	let orderTransactions: Transactions;
	let sourceData;
	let cost;
	let cost_in_ar;
	let costPerGByte;
	let dataSize;
	let connected;
	let published = false;
	let keyfile;
	let initialized;

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

	let contractID = !dev && CONTRACT_ID; // default to production?
	let appWallet = !dev && APP_WALLET; // default to production

	onMount(async () => {
		await init();
		initialized = true;
		// console.log('window.arweaveWallet', window.arweaveWallet);
	});

	async function init() {
		let endpointResponsePromise = fetch(coinEndpoint);

		arweave = Arweave.init(arConfig);

		try {
			let networkInfo = await arweave.network.getInfo();
			if (networkInfo) connected = networkInfo.network; // https://github.com/ArweaveTeam/arweave-js/issues/49
		} catch (error) {
			console.error('Not connected to arweave');
		}

		if (dev) {
			// init TestWeaveSDK on the top of arweave
			const TestWeaveSDK = await import('testweave-sdk');
			testWeave = await TestWeaveSDK.default.init(arweave);
			keyfile = testWeave.rootJWK;
			appWallet = await arweave.wallets.getAddress(keyfile);

			const { deploy } = await import('$lib/contract/deploy.js');
			contractID = await deploy({ client: arweave, wallet: keyfile, address: appWallet }); // generate a testWeave contractID
			console.log('contractID created', { contractID });

			const after = await arweave.transactions.getStatus(contractID);
			console.log(after.status); // this will return 202

			if (after.status !== 202) new Error('error, contract not deployed'); // TODO: handle better

			try {
				console.log('Mining...');
				await testWeave.mine(); // mine the contract
				console.log('Mined!');
			} catch (error) {
				console.error(error);
			}
		} else {
			keyfile = 'use_wallet';
		}

		let endpointResponse = await endpointResponsePromise;
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

		orderTransactions = await prepOrder({
			client: arweave,
			keyfile,
			data: inlinedSource,
			contractID,
			appWallet,
			ipfsCID: rootCID
		});

		dataTransaction = orderTransactions.txs.dataTx;
		cost = orderTransactions.ar;
		cost_in_ar = arweave.ar.winstonToAr(dataTransaction.reward);
		dataSize = dataTransaction.data_size;
		costPerGByte = (cost_in_ar / dataTransaction.data_size) * 1073741824;
		// console.log({ costPerGByte: costPerGByte.toFixed(2) });
	};

	async function mine() {
		await sendOrder({ client: arweave, keyfile, txs: orderTransactions.txs });

		published = true;

		// sendOrder does this using post()
		// await arweave.transactions.sign(dataTransaction, keyfile);

		// let uploader = await arweave.transactions.getUploader(dataTransaction);

		// while (!uploader.isComplete) {
		// 	await uploader.uploadChunk();
		// 	uploadProgress += `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}\n`;
		// 	console.log(uploadProgress);
		// }

		if (dev) {
			// in dev mine it right away
			try {
				await testWeave.mine();
			} catch (error) {
				console.error(error);
			}
			Object.values(orderTransactions.txs).forEach(async (tx) => {
				const afterMine = await arweave.transactions.getStatus(tx.id);
				console.log(afterMine.status, tx.id); // this will return 200
				console.log(`http://localhost/tx/${tx.id}/status`); //
			});
			sourceData = await arweave.transactions.getData(dataTransaction.id, {
				decode: true,
				string: true
			});
		} else {
			// wait for a couple of blocks?
		}
	}

	$: serializedSource && keyfile && initialized && handleCreateTx();
</script>

<svelte:head>
	<!-- Originally, the npm instal arweave wasnt working for web, so i had to do this: -->
	<!-- <script src="https://unpkg.com/arweave/bundles/web.bundle.js"></script> -->
</svelte:head>

<ArWallet />

{#if !published}
	{#if !costPerGByte}
		Preparing preview...
	{:else}
		<div class="estimate">
			PermaPublish for a mere {parseFloat(cost).toFixed(7)}<a
				href="https://www.coingecko.com/en/coins/arweave"
				target="_blank">AR</a
			>
			(about {Number(cost * ar_price).toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 4
			})} @ ${ar_price}/AR paid once, then
			<a href="https://www.arweave.org/" target="_blank"> use forever</a>)
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
