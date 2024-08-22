import { getContract } from "viem";
import { publicClient } from "./viem.js";

const MOXIE_ADDRESS =
  "0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527" as const;

const MOXIE_BONDING_CURVE_ADDRESS =
  "0x373065e66B32a1C428aa14698dFa99BA7199B55E" as const;

const MOXIE_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;


const MOXIE_BONDING_CURVE_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_subject",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_depositAmount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_onBehalfOf",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_minReturnAmountAfterFee",
          "type": "uint256"
        }
      ],
      "name": "buySharesFor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "shares_",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;


  export const moxieSmartContractConfig = {
    address: MOXIE_ADDRESS,
    abi: MOXIE_ABI,
  };
  
  export const moxieSmartContract = getContract({
    address: moxieSmartContractConfig.address,
    abi: moxieSmartContractConfig.abi,
    client: publicClient,
  });

  export const moxieBondingCurveSmartContractConfig = {
    address: MOXIE_BONDING_CURVE_ADDRESS,
    abi: MOXIE_BONDING_CURVE_ABI,
  };
  
  export const moxieBondingCurveSmartContract = getContract({
    address: moxieBondingCurveSmartContractConfig.address,
    abi: moxieBondingCurveSmartContractConfig.abi,
    client: publicClient,
  });