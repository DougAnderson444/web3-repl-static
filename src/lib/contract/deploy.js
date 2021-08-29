const Arweave = require("arweave");
const { createContract } = require("smartweave");
const fs = require("fs");

import { default as src } from "./token-pst.js"
import state from "./initial-state.json"

export const deploy = async ({ client, wallet, address }) => {
  state.owner = address
  state.balances = {}
  state.balances[address] = 100111222
  console.log({client, wallet, address, state, src})
  const id = await createContract(client, wallet, src, JSON.stringify(state));
  return id
}
