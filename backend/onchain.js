import "dotenv/config";
import * as starknet from "starknet";
import erc20Json from "./erc20_abi.json" assert { type: "json" };

function getEnvVariable(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  if (value === undefined) {
    throw new Error(`${name} environment variable is not defined`);
  }
  return value;
}

const ethTokenAddress = getEnvVariable("TOKEN_ADDRESS");
const address = getEnvVariable("STARKNET_ACCOUNT_ADDRESS");
const kakarotAddress = getEnvVariable("KAKAROT_ADDRESS");
const rpcUrl = getEnvVariable("RPC_URL");
const privateKey = getEnvVariable("PRIVATE_KEY");
console.log("Faucet token address:", ethTokenAddress);
console.log("Kakarot address:", kakarotAddress);

const provider = new starknet.RpcProvider({
  nodeUrl: rpcUrl,
});

const account = new starknet.Account(provider, address, privateKey);

const contract = new starknet.Contract(erc20Json, ethTokenAddress, provider);

export async function getStarknetEoaAddress(ethAddress) {
  console.log("call kakarot.compute_starknet_address - ", ethAddress);
  const callResponse = await provider.callContract({
    contractAddress: kakarotAddress,
    entrypoint: "compute_starknet_address",
    calldata: [ethAddress],
  });

  return callResponse.result[0];
}

export async function transfer(to) {
  console.log("Transfer to - ", to);
  let result = contract.populate("transfer", {
    recipient: to,
    amount: {
      low: process.env.AMOUNT_TRANSFERED,
      high: "0",
    },
  });

  console.log("Call detail - ", result);
  const nonce = await provider.getNonceForAddress(address);
  console.log("Nonce - ", nonce);
  const version = "0x1";
  const maxFee = "0x11111111111";
  let hash = await account.execute(result, undefined, {
    nonce,
    maxFee,
    version,
  });

  console.log(hash);
  return hash;
}

export async function balanceOf(of) {
  console.log("Getting balance of: " + of);
  const balance = await contract.balanceOf(of);
  console.log(
    "Balance -" + starknet.uint256.uint256ToBN(balance.balance).toString()
  );
  return starknet.uint256.uint256ToBN(balance.balance).toString();
}
