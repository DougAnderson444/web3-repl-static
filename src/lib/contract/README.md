# The Arweave Web3 REPL Token Code

## Intro 

An Arweave blockchain ("SmartWeave") smart contract that manages the Web3 REPL Token.

## Details

A simple smart contract the covers:

- Token Transfers
- Holder Balances
- Evolution (Evolve)

## To Deploy

Paste a copy of your [arweave-keyfile.json](https://docs.arweave.org/info/wallets/arweave-web-extension-wallet#new-users-generating-your-wallet) up one directory (../arweave-keyfile.json -- so it doesn't accidentally get commited to git!).

Then run:

```
npm run create
```

which will run this command out of package.json:

```
// package.json
    "scripts": {
        "create": "npx smartweave create ./token-pst.js initial-state.json --key-file ../arweave-keyfile.json"
    }
```

Which is taken from the reference: [https://github.com/ArweaveTeam/SmartWeave#cli-usage](https://github.com/ArweaveTeam/SmartWeave#cli-usage)

```
smartweave create [SRC LOCATION] [INITIAL STATE FILE] --key-file [YOUR KEYFILE]
```