import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import { APP_NAME } from "./constants";
// import { selectWeightedHolder } from "./arweave";
import { readContract, selectWeightedPstHolder } from 'smartweave'

export const createDataTx = async ({
  client, //: Arweave,
  keyfile, //: JWKInterface | "use_wallet" | undefined,
  data, //: string
}) /*: Promise<Transaction> */ => {
  
    let dataTransaction = await client.createTransaction(
			{	data }, keyfile
		);

		dataTransaction.addTag('Content-Type', 'text/html');

    return dataTransaction
}

export const createUsageFeeTx = async ({
  client, //: Arweave,
  keyfile, //: JWKInterface | "use_wallet" | undefined,
  quantity, //: number,
  appWallet, //: string
  contractID
}) /*: Promise<Transaction> */ => {
  const tags = {
    App: APP_NAME,
    Type: "Usage-Fee",
    ContractID: contractID
  };

  const tx = await client.createTransaction(
    {
      target: appWallet,
      quantity: client.ar.arToWinston(quantity.toString()),
    },
    keyfile
  );

  for (const [key, value] of Object.entries(tags)) {
    tx.addTag(key, value);
  }

  return tx;
};

export const createTokenHolderTx = async ({
  client, //: Arweave,
  keyfile, //: JWKInterface | "use_wallet" | undefined,
  quantity, //: number,
  contractID, //: string
  }) /* : Promise<Transaction> */ => {

  console.log({contractID})

  const contractState = await readContract(client, contractID)
  console.log({contractState})
  const tipReceiver = selectWeightedPstHolder(contractState.balances)

  const tags = {
    "App": APP_NAME,
    Type: "W3R-Token-Holder-Payment",
    "App-Name": APP_NAME,
    "App-Version": "0.0.1",
    Contract: contractID,
    Input: JSON.stringify({
      function: "transfer", // TODO: loyalty points transfer via read other contract trigger
      target: tipReceiver,
      qty: quantity, 
    }),
  };

  // Pay the holder some AR
  const tx = await client.createTransaction(
    {
      target: tipReceiver,
      quantity: client.ar.arToWinston(quantity.toString()),
      // data: Math.random().toString().slice(-4), // no need to data in wallet-transfers
    },
    keyfile
  );

  for (const [key, value] of Object.entries(tags)) {
    tx.addTag(key, value);
  }

  return tx;
};

export const getTxFee = async (
  client: Arweave,
  tx: Transaction
): Promise<number> => {
  const fee: string = await client.transactions.getPrice(
    parseFloat(tx.data_size),
    tx.target
  );

  return parseFloat(client.ar.winstonToAr(fee));
};