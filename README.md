## Overview

This sveltekit app allows us to build web3 app pages (SPA) in the browser through the browser REPL.

The REPL accepts:

- [x] Markdown (MD)
- [x] Markdown Svex (MDSVEX)
- [x] Javascript (JS)
- [x] Svelte 

...then compiles into a single page app.

- [ ] TODO: Save sub-components to Permaweb

That can be saved/deployed to IPFS, pinned on the Arweave permaweb, and tokenized to Solana.

- [x] IPFS
- [x] Arweave
- [ ] Tokenize to Arweave 
- [ ] Hypercore 
- [ ] Linked as a [DID service](https://www.w3.org/TR/did-core/#dfn-service) 😉


## Tokenization 

Tokenization allows us to control ownership and access to assets. If you hold the token, you can be proven as the owner of something. If you hold the token, you can have the rights to access some asset.

This REPL experiments with tokenizing single page app to Solana.

Essentially, in a picture, the REPL enables this:

<img src='https://raw.githubusercontent.com/DougAnderson444/Tokenizer-Web-Repl/master/Tokenizer-process.png'>

Where access to the SPA is the "asset."

## REPL is based on REPLicant from  Svelte Summit 2020

[https://github.com/pngwn/REPLicant](https://github.com/pngwn/REPLicant)

## Questions

If you have questions or feedback then feel to file an issue here, bug me on twitter ([@douganderson444](https://twitter.com/douganderson444)), or you can grab me on discord (@douganderson444).
