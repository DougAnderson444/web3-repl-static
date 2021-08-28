<script lang="ts">
	import Tabs from './Tabs.svelte';
	import type { Component } from '../types';
	import { components } from '../js/store.js';
	import { getContext } from 'svelte';
	import IPFSSaver from './IPFSSaver.svelte';
	import Arweave from './Arweave.svelte';

	// import Status from "./Status.svelte";

	// export let saveStatus;
	// export let rootCID;
	export let serializedSource: string;
	// export let diagnostics;

	const MAX_ID = 123456789;

	const { handle_select, editor_focus } = getContext('REPL');

	function get_max(_components: Component[]): number {
		const ids = _components.map(({ id }) => id);
		return Math.max(...ids);
	}

	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}

	function new_component() {
		// const id = get_max($components) + 1;
		const newID = Math.floor(Math.random() * MAX_ID);

		$components = $components.concat({
			id: newID,
			name: `Component${newID}`,
			type: 'svelte',
			source: `Component ${newID}`
		});

		handle_select(newID);
		editor_focus();
	}
	function selectComponent({ detail }) {
		handle_select(detail);
	}
</script>

<Tabs on:select={selectComponent} on:new={new_component} />
<IPFSSaver {serializedSource} />
<Arweave {serializedSource} />

<!-- <Status {diagnostics} /> -->
