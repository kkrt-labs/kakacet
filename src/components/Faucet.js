import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as starknet from "starknet";
import styled from "styled-components";
import kakarot_logo from "../assets/kakarot_logo.svg";

const notifyError = function (text) {
  toast.error(text);
};

const provider = new starknet.RpcProvider({
  nodeUrl: process.env.REACT_APP_RPC_URL,
});

async function getStarknetAddress(ethAddress) {
  const callResponse = await provider.callContract({
    contractAddress: process.env.REACT_APP_KAKAROT_ADDRESS,
    entrypoint: "compute_starknet_address",
    calldata: [ethAddress],
  });

  return callResponse.result[0];
}

async function addressAlreadyDeployed(address) {
  try {
    await provider.getClassHashAt(address, "latest");
    return true;
  } catch (error) {
    console.log("error", error);
    return false;
  }
}

async function makeTransfer(toAddress) {
  try {
    const response = await fetch("/faucet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: toAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    toast.error(`Error in makeTransfer: ${error.message}`);
  }
}

async function getBalanceOf(ofAddress) {
  try {
    const starknetAddress = await getStarknetAddress(ofAddress);
    const response = await fetch("/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ of: starknetAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.balance;
  } catch (error) {
    toast.error(`Error in getBalanceOf: ${error.message}`);
  }
}

async function deployKakarotAccount(ofAddress) {
  try {
    const response = await fetch("/deploy-kakarot-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ of: ofAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    toast.info("EOA ready 🚀");
    return data.balance;
  } catch (error) {
    toast.error(`Error in deployKakarotAccount: ${error.message}`);
  }
}

function Faucet() {
  const [addressInput, setAddressInput] = useState("");

  function assertAddressInputFormat() {
    // Regular expression to match hexadecimal strings (both uppercase and lowercase).
    const hexRegex = /^0x[0-9A-Fa-f]+$/;

    if (!hexRegex.test(addressInput)) {
      notifyError("Invalid address!");
      return;
    }
    if (addressInput.length > 66) {
      notifyError("Wrong address length!");
      return;
    }
  }

  async function sendToken() {
    assertAddressInputFormat();
    const starknetAddress = await getStarknetAddress(addressInput);
    const data = await makeTransfer(starknetAddress);
    toast.info("Transaction hash: " + data.hash.transaction_hash);
    const accountExists = await addressAlreadyDeployed(starknetAddress);
    if (!accountExists) {
      await deployKakarotAccount(addressInput);
    }
  }

  async function getBalance() {
    assertAddressInputFormat();
    const balance = await getBalanceOf(addressInput);
    if (balance !== undefined) {
      toast.info("Balance: " + balance);
    } else {
      toast.error("Something went wrong when trying to get balance");
    }
  }

  return (
    <FaucetContainer>
      <Col style={{ width: "100%" }}>
        <Image src={kakarot_logo} alt="Avatar" />
        <TextField
          style={{ width: "100%" }}
          label="Enter Your Wallet Address (0x...)"
          variant="outlined"
          onChange={(e) => setAddressInput(e.target.value)}
        />
      </Col>
      <Col>
        <Button
          style={{ minWidth: "120px" }}
          color="primary"
          variant="contained"
          onClick={() => {
            sendToken();
          }}
        >
          Get Tokens
        </Button>
      </Col>
      <Col>
        <Button
          style={{ minWidth: "120px" }}
          color="primary"
          variant="contained"
          onClick={() => {
            getBalance();
          }}
        >
          Get Balance
        </Button>
      </Col>
    </FaucetContainer>
  );
}

const Image = styled.img`
  width: 50px;
  height: 50px;
`;

const FaucetContainer = styled.div`
  display: flex;
  width: 95%;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 1000px) {
    flex-direction: column;
  }
`;

const Col = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: 1000px) {
    justify-content: center;
  }
`;
export default Faucet;
