// inspired by https://github.com/useverto/lib/blob/master/src/lib/trade.ts

// import axios from "axios";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
// import { getConfig } from "./get_config";
// import { getContract } from "cacheweave";
import {
  createTokenHolderTx,
  createUsageFeeTx,
  createDataTx,
  getTxFee,
} from "./fees";
import { APP_WALLET, TOKEN_FACTOR, USAGE_FACTOR } from "./constants";
export type Transactions = "ar" | Promise | 
  {
    ar: number,
    txs: { 
      dataTx: Transaction, 
      usageFeeTx: Transaction, 
      tokenHolderPortionTx: Transaction
  }}

export const prepOrder = async({
    client, //: Arweave,
    keyfile, //: JWKInterface | "use_wallet" | undefined,
    data, //: string
    contractID,
    appWallet,
    ipfsCID = false
  }) /* : Promise<{ txs: Transaction[]; ar: number; pst: number } | string> */ => {

  const addr = await client.wallets.jwkToAddress(keyfile);
  const arBalance = parseFloat(
    client.ar.winstonToAr(await client.wallets.getBalance(addr))
  );

  // Create Tx to save the Data to Arweave
  const dataTx = await createDataTx({client, keyfile, data, ipfsCID})

  const tokenHolderFee = parseFloat(client.ar.winstonToAr((dataTx.reward * ( TOKEN_FACTOR || 1 ))))
  const tokenHolderPortionTxPromise = createTokenHolderTx({
    client,
    keyfile,
    quantity: tokenHolderFee,
    contractID
  });

  const usageFee = parseFloat(client.ar.winstonToAr(dataTx.reward * ( USAGE_FACTOR || 1 )))
  const usageFeeTxPromise = createUsageFeeTx({
    client,
    keyfile,
    quantity: usageFee,
    appWallet,
    contractID
  });

  const [ tokenHolderPortionTx, usageFeeTx ] = await Promise.all([ tokenHolderPortionTxPromise, usageFeeTxPromise ]) 

  let txf1 = getTxFee(client, dataTx);
  let txf2 = getTxFee(client, usageFeeTx);
  let txf3 = getTxFee(client, tokenHolderPortionTx);

  [txf1, txf2, txf3] = (await Promise.all([txf1, txf2, txf3])) // this is faster, btw

  const txFees = txf1 + txf2 + txf3

  const arAmnt = 
    txFees // to save the data & all 3 transactions
    + usageFee // to pay for the app
    + tokenHolderFee; // to pay for the supporters

  console.log({ txFees, usageFee, tokenHolderFee }, {dataReward: parseFloat(client.ar.winstonToAr(dataTx.reward))})

  if (arBalance < arAmnt) return "ar"; // not enough Arweave

  return {
    txs: { dataTx, usageFeeTx, tokenHolderPortionTx },
    ar: arAmnt
  };
}

export const sendOrder = async ({ 
  client, //: Arweave, 
  keyfile, //: JWKInterface | "use_wallet" | undefined, 
  txs, //: Transactions 
  }) /* : Promise<void> */ => {
  const promises = Object.values(txs).map(async tx => {
    await client.transactions.sign(tx, keyfile);
    return client.transactions.post(tx)
  })
  await Promise.all(promises)
}
