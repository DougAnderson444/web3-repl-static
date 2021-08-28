<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	import('buffer').then((Buffer) => {
		global.Buffer = Buffer.Buffer;
	});
</script>

<svelte:head>
	<script>
		global = globalThis; // for solana web3 repo
	</script>
</svelte:head>
<Header />

<main>
	<slot />
</main>

<footer>
	<p>visit <a href="https://peerpiper.io">PeerPiper.io</a> to learn more about PeerPiper</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		height: 100vh;
		max-width: 1824px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 8px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 8px 0;
		}
	}
</style>
