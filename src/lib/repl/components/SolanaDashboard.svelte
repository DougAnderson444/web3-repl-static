<script>
	import { onMount, getContext } from "svelte";

	import {
		Navbar,
		Nav,
		NavItem,
		NavLink,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem,
		Button,
	} from "sveltestrap";

	import * as solanaWeb3 from "@solana/web3.js";
	import {
		AccountLayout,
		u64,
		Token,
		TOKEN_PROGRAM_ID,
	} from "@solana/spl-token";
	import { currentID, components } from "../js/store.js";

	import frontmatter from "@github-docs/frontmatter";

	export let endpoint = "devnet"; //defaul devnet

	const { handle_select } = getContext("REPL");

	let selectedToken;

	let connection;
	let tokenInfo;

	let account = "2kNoPZhth7i9nRBQikdHUUYP9vx9FqPQP66zaQFDEtoU";
	let accounts = [account]; // you'd get these from wallet

	onMount(async () => {
		init(endpoint);
	});

	$: if (selectedToken) updateSelected(selectedToken);

	function updateSelected(selectedToken) {
		// parse current frontmatter
		const component = $components.find((component) => component.id === 0);
		const { data, content, errors } = frontmatter(component.source);

		// set the tokenKey to selectedToken
		data.tokenKey = selectedToken;

		// merge back together with content
		let newmatter = `---
`;

		for (let [key, val] of Object.entries(data)) {
			newmatter += `${key}: ${val}
`;
		}

		newmatter += `
---
`;

		$components[0].source = newmatter + content;
		$components = $components; // refresh the codemirror
		handle_select($currentID);
	}

	async function init(endpoint) {
		const ENDPOINTS = [
			{
				name: "mainnet-beta",
				endpoint: "https://solana-api.projectserum.com/",
			},
			{
				name: "testnet",
				endpoint: solanaWeb3.clusterApiUrl("testnet"),
			},
			{
				name: "devnet",
				endpoint: solanaWeb3.clusterApiUrl("devnet"),
			},
			{
				name: "localnet",
				endpoint: "http://127.0.0.1:8899",
			},
		];
		const chain =
			ENDPOINTS.find((end) => end.name === endpoint) || ENDPOINTS[0];

		connection = new solanaWeb3.Connection(chain.endpoint, "singleGossip");

		tokenInfo = await getUserTokens([account]);
	}

	function getPublicKey(publicKey) {
		return typeof publicKey === "string"
			? new solanaWeb3.PublicKey(publicKey)
			: publicKey;
	}

	function parseTokenAccountInfo(info) {
		const data = Buffer.from(info);
		const accountInfo = AccountLayout.decode(data);

		accountInfo.mint = new solanaWeb3.PublicKey(accountInfo.mint);
		accountInfo.owner = new solanaWeb3.PublicKey(accountInfo.owner);
		accountInfo.amount = u64.fromBuffer(accountInfo.amount);

		return accountInfo;
	}

	async function getTokenAccounts(publicKey) {
		const pubkey = getPublicKey(publicKey);
		return await connection.getTokenAccountsByOwner(pubkey, {
			programId: TOKEN_PROGRAM_ID,
		});
	}

	async function getUserTokens(accounts) {
		const tokenInfo = [];
		// get all Token Accounts for this user
		await Promise.all(
			accounts.map(async (account) => {
				const tokenAccounts = await getTokenAccounts(account);
				// get all MintInfo for each Token Account
				if (
					tokenAccounts &&
					tokenAccounts.value &&
					tokenAccounts.value.length
				) {
					tokenAccounts.value.forEach((token) => {
						const data = parseTokenAccountInfo(token.account.data);
						tokenInfo.push(data);
					});
				}
			})
		);
		// console.log({ tokenInfo });
		return tokenInfo;
	}

	function mintNew() {} // TODO
</script>

<Navbar color="light" light expand="sm" class="d-flex justify-content-around">
	<Nav
		class="ms-auto align-items-baseline d-flex justify-content-around m-2"
		navbar
	>
		<!-- <NavItem>
			<Dropdown class="d-flex justify-content-around">
				<DropdownToggle caret>{account}</DropdownToggle>
				<DropdownMenu end>
					{#each accounts as account}
						<DropdownItem>{account}</DropdownItem>
					{/each}
				</DropdownMenu>
			</Dropdown>
		</NavItem> -->
		<NavItem inNavbar>
			<Button class="button m-2" color="gold" on:click={""}>Mint new ✨</Button>
		</NavItem>
		{#if tokenInfo}
			<NavItem nav inNavbar>
				<Dropdown light class="d-flex justify-content-around">
					<DropdownToggle caret
						>{selectedToken
							? selectedToken
							: "Tokens------------"}</DropdownToggle
					>
					<DropdownMenu end>
						{#each tokenInfo as token}
							<DropdownItem
								on:click={() => {
									selectedToken = token.mint.toString();
								}}
								>{token.mint.toString()} [{token.amount.toString()}]</DropdownItem
							>
						{/each}
					</DropdownMenu>
				</Dropdown>
			</NavItem>
		{/if}
	</Nav>
</Navbar>
