<script>
	export let diagnostics;

	$: diagnostics && console.log({ diagnostics });
</script>

<div class="status">
	{#if diagnostics}
		{#each [...diagnostics] as [k, v]}
			{#if v !== "true"}
				<div class="diagnostics">
					❌{k}
					<textarea readonly> {v}</textarea>
				</div>
			{:else}
				✔️{k}<br />
			{/if}
		{/each}
	{/if}
</div>

<style>
	.status {
		margin: 8px;
		padding: 4px;
	}
	textarea {
		margin: 0;
		font-family: monospace;
		border: 1px solid rgba(238, 158, 158, 0.521);
		overflow: auto;
		width: 95vw;
	}

	.diagnostics textarea {
		color: #ff3e00;
		margin: 1px;
	}
</style>
