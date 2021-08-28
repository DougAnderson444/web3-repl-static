let tokenKey = "5ipVLB12JskMNdVc7nUTzgBc2KSa6hRUnoWAVoUkWsKq"

export const getAppSvxCode = ({token}) =>{
  tokenKey = token
  return code_1
}


export const code_1 = `---
title: Doug's Tokenization REPL
author: Doug
date: 27 August 2021
endpoint: devnet
tokenKey: BFVp8duWGJTyEDzaDX9sVzJCDnikXp3LLpyuJ29pZLhv

---

<script>
import Solana from './Solana.svelte';
import Layout from './Layout.svelte';
import Asset from './Asset.svelte';

let account = "2kNoPZhth7i9nRBQikdHUUYP9vx9FqPQP66zaQFDEtoU"; // example

</script>

<Layout {title} {author} {date} >
	<Solana {account} {tokenKey} {endpoint} >
		<Asset />
	</Solana>

	### Make your own NFT or zkap gateway:

	**This REPL:** 

	1. Wraps your asset in an Arweave display app which checks for the presence of the token in the requesting account. No free rides!
	
	2. The display app is saved in Arweave, thus the asset lives forever! The token is Solana SPL, so access lives forever!

	2. Just hold the token type in order to access the asset!
	
	3. Don't hold the token? You don't have access or ownership!

	**TODO:**

	1. Connect wallets
	2. Include a signed d-rand in the location.search params, check signature against the token account
	3. "Click-to-mint" the access token on the fly (currently hard coded)
	4. Encrypt the asset instead of just burying it in embeded javascript
	5. Click-to-acquire token (Serum integration)
	6. Add nicknames to tokens
	7. Publish to mainnets (Solana and Arweave)

</Layout>


`

export const code_2 = `<script>
  import { onMount } from "svelte"

  export let endpoint = "devnet"
  export let account
  export let tokenKey

	let hasAccess = false
  let ready
  let connection
  let attempts = 0
  onMount(async () => {
    setTimeout(fireWhenReady, 100)
  })

  // wait for solanaWeb3 to have loaded
  const fireWhenReady = () => {
    if (typeof solanaWeb3 != "undefined") {
      ready = true
      // console.log({ solanaWeb3 })
      init()
    } else {
      // console.log("else, try again soon")
      setTimeout(fireWhenReady, 500)
    }
  }

  function init() {
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
    ]
    const chain = ENDPOINTS.find((end) => end.name === endpoint) || ENDPOINTS[0]

    connection = new solanaWeb3.Connection(chain.endpoint, "singleGossip")
  }

  // $: if (ready) console.log({ solanaWeb3 }); // because we imported it in svelte:head

  const checkHasAccess = async () => {
		let params = new URLSearchParams(document.location.search);
		account = document.location.origin === "null" ? account : params.get("account"); 
	 	console.log("checking acccount", {account})
    try {
      let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new solanaWeb3.PublicKey(account),
        {
          mint: new solanaWeb3.PublicKey(tokenKey),
        }
      )
      if (tokenAccounts.value.length > 0) {
        tokenAccounts.value.forEach((account) => {
          if (account.account.data.parsed.info.tokenAmount.uiAmount > 0) {
            hasAccess = true
          } else {
            // setClaimTokenAccount(account.account.pubkey)
          }
        })
      }
    } catch (e) {
      console.log("error: ", e)
      return
    }
  }

  $: if (connection) checkHasAccess()
</script>

<svelte:head>
  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js">
  </script>
</svelte:head>


{#if connection}
<h1>Connected to Solana {endpoint}</h1>
{/if}
Requires this token to have access: <br />
{tokenKey}
<br />
{#if hasAccess}
  <slot />
{:else}
  Sorry, you don't hold the access token in your Solana account. 
{/if}

<style>
  h1 {
    color: #815ad0;
  }
</style>
`
export const code_3 = `<script>
  export let title;
  export let author;
  export let date;
</script>
 
<style>
  h1 {
    color: #102081;
  }
	
	section {
		background-color: beige;
		padding: 1rem;
	}
</style>

<section>


  <h1>{ title }</h1>

  <slot />

  <p class="date">on: { date }</p>
  <p class="date">by: { author }</p>

</section>

`

export const code_4 = `
<div class="container">
  <div class="autograph">
    Here is my autograph 🚗 📈
  </div>
</div>

<style>
  .container {
      display: flex;
      justify-content: center;
  }

  .autograph {
      font-family: "Brush Script MT";
      font-size: 1.75rem;
      background-color: #f7f7f7;
      padding: 1rem;
      border-radius: 1rem;
      margin: 0 auto;
  }
</style>
`
