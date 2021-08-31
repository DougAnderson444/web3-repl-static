const Arweave = require("arweave");
const { createContract } = require("smartweave");
const fs = require("fs");

import * as src from "./token-pst.js"
import state from "./initial-state.json"

export const deploy = async ({ 
  client, wallet, address, 
  initBalance = 9999999 // optional init balance, else random owner amt
}) => {
  state.owner = address
  state.balances = {}
  state.balances[address] = initBalance 
  const source = src.default
  const id = await createContract(client, wallet, source, JSON.stringify(state));
  return id
}
