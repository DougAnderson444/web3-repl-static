<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import splash from '$lib/splash.svg';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>
		<div class="welcome">
			Welcome to<br />Web3 BUILDR Repl<br /><img src={splash} alt="WEB3BUILDR" /> <picture />
		</div>
		<br />Start <strong><a sveltekit:prefetch href="/repl">BUILDING</a></strong>!!
	</h1>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		width: 100%;
		height: auto;
	}

	.welcome img {
		width: 60%;
		max-width: 800px;
		margin: 0.5em;
		height: auto;
		display: inline-block;
	}
</style>
