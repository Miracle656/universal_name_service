import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ethers } from "ethers";

admin.initializeApp();

const CONTRACT_ADDRESS = "0x6032e825069f5c057afde606b8bca9de84742c3d";
const RPC_URL = "https://evm.rpc-testnet-donut-node1.push.org/";

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string[]",
        name: "names",
        type: "string[]",
      },
    ],
    name: "addPremiumNames",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "register",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "removePremiumName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "renew",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        internalType: "string",
        name: "value",
        type: "string",
      },
    ],
    name: "setCustomMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "avatar",
        type: "string",
      },
      {
        internalType: "string",
        name: "email",
        type: "string",
      },
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "twitter",
        type: "string",
      },
      {
        internalType: "string",
        name: "github",
        type: "string",
      },
      {
        internalType: "string",
        name: "discord",
        type: "string",
      },
      {
        internalType: "string",
        name: "telegram",
        type: "string",
      },
    ],
    name: "setMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setOperatorApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newMultiplier",
        type: "uint256",
      },
    ],
    name: "setPremiumMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "setPrimaryName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "primaryAddress",
        type: "address",
      },
    ],
    name: "setPrimaryResolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "setRegistrationFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newTreasury",
        type: "address",
      },
    ],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasury",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "chainId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "addressBytes",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "address",
        name: "evmAddress",
        type: "address",
      },
    ],
    name: "ChainAddressSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "chainHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "chainId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "displayName",
        type: "string",
      },
    ],
    name: "ChainConfigured",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        internalType: "string",
        name: "chainId",
        type: "string",
      },
      {
        internalType: "string",
        name: "displayName",
        type: "string",
      },
    ],
    name: "configureChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
    ],
    name: "MetadataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "originChainNamespace",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "originChainId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPremium",
        type: "bool",
      },
    ],
    name: "NameRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newExpiresAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "renewedBy",
        type: "address",
      },
    ],
    name: "NameRenewed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "NameTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "OperatorApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newMultiplier",
        type: "uint256",
      },
    ],
    name: "PremiumMultiplierUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "PremiumNameAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "PremiumNameRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newPrimaryAddress",
        type: "address",
      },
    ],
    name: "PrimaryAddressSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "PrimaryNameSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "RegistrationFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newTreasury",
        type: "address",
      },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "approvedOperators",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseRegistrationFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
    ],
    name: "calculateRegistrationFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "chainRegistrationCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getAllChainAddresses",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "bytes",
            name: "addressBytes",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "evmAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isSet",
            type: "bool",
          },
        ],
        internalType: "struct PushNameService.ChainAddress[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllKnownChains",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "registrationCount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "string",
            name: "displayName",
            type: "string",
          },
          {
            internalType: "bytes32",
            name: "chainHash",
            type: "bytes32",
          },
        ],
        internalType: "struct PushNameService.ChainStats[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        internalType: "string",
        name: "chainId",
        type: "string",
      },
    ],
    name: "getChainStats",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "registrationCount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "string",
            name: "displayName",
            type: "string",
          },
          {
            internalType: "bytes32",
            name: "chainHash",
            type: "bytes32",
          },
        ],
        internalType: "struct PushNameService.ChainStats",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "key",
        type: "string",
      },
    ],
    name: "getCustomMetadata",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getMetadata",
    outputs: [
      {
        internalType: "string",
        name: "avatar",
        type: "string",
      },
      {
        internalType: "string",
        name: "email",
        type: "string",
      },
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "twitter",
        type: "string",
      },
      {
        internalType: "string",
        name: "github",
        type: "string",
      },
      {
        internalType: "string",
        name: "discord",
        type: "string",
      },
      {
        internalType: "string",
        name: "telegram",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyOrigin",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "bytes",
            name: "owner",
            type: "bytes",
          },
        ],
        internalType: "struct UniversalAccountId",
        name: "originAccount",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "isUEA",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getNameHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getNameRecord",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "registeredAt",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isPremium",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "string",
                name: "chainNamespace",
                type: "string",
              },
              {
                internalType: "string",
                name: "chainId",
                type: "string",
              },
              {
                internalType: "bytes",
                name: "owner",
                type: "bytes",
              },
            ],
            internalType: "struct UniversalAccountId",
            name: "originAccount",
            type: "tuple",
          },
        ],
        internalType: "struct PushNameService.NameRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getOriginChain",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "bytes",
            name: "owner",
            type: "bytes",
          },
        ],
        internalType: "struct UniversalAccountId",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "isNameAvailable",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "knownChainHashes",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "knownChains",
    outputs: [
      {
        internalType: "uint256",
        name: "registrationCount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        internalType: "string",
        name: "chainId",
        type: "string",
      },
      {
        internalType: "string",
        name: "displayName",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "chainHash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_NAME_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_NAME_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nameRecords",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "registeredAt",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isPremium",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "bytes",
            name: "owner",
            type: "bytes",
          },
        ],
        internalType: "struct UniversalAccountId",
        name: "originAccount",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "premiumMultiplier",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "premiumNames",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "primaryResolution",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REGISTRATION_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "resolve",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "chainNamespace",
        type: "string",
      },
      {
        internalType: "string",
        name: "chainId",
        type: "string",
      },
    ],
    name: "resolveChain",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "chainNamespace",
            type: "string",
          },
          {
            internalType: "string",
            name: "chainId",
            type: "string",
          },
          {
            internalType: "bytes",
            name: "addressBytes",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "evmAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isSet",
            type: "bool",
          },
        ],
        internalType: "struct PushNameService.ChainAddress",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "reverseRecords",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalNamesRegistered",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UEA_FACTORY",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Sync names every hour
export const syncNames = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 7200); // Last ~2 hours

      const eventTopic = ethers.id(
        "NameRegistered(bytes32,string,address,uint256,string,string,bool)"
      );

      // Fetch recent registrations
      const logs = await provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [eventTopic],
        fromBlock: startBlock,
        toBlock: currentBlock,
      });

      const db = admin.firestore();
      const batch = db.batch();
      let syncCount = 0;

      for (const log of logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          const name = parsedLog.args.name;
          const owner = parsedLog.args.owner;
          const expiresAt = new Date(Number(parsedLog.args.expiresAt) * 1000);
          const isPremium = parsedLog.args.isPremium;

          // Check if already exists
          const nameRef = db.collection("names").doc(name.toLowerCase());
          const nameDoc = await nameRef.get();

          if (!nameDoc.exists) {
            // Fetch full metadata
            let metadata = {};
            try {
              const meta = await contract.getMetadata(name);
              metadata = {
                avatar: meta.avatar || "",
                email: meta.email || "",
                url: meta.url || "",
                description: meta.description || "",
                twitter: meta.twitter || "",
                github: meta.github || "",
                discord: meta.discord || "",
                telegram: meta.telegram || "",
              };
            } catch (err) {
              console.warn(`Failed to fetch metadata for ${name}`);
            }

            const nameHash = await contract.getNameHash(name);

            batch.set(nameRef, {
              name: name.toLowerCase(),
              owner: owner.toLowerCase(),
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              isPremium,
              nameHash,
              registeredAt: admin.firestore.Timestamp.fromDate(new Date()),
              transactionHash: log.transactionHash || "",
              chainId: "push-chain",
              metadata,
              updatedAt: admin.firestore.Timestamp.now(),
            });

            syncCount++;
          }
        } catch (err) {
          console.error("Error processing log:", err);
        }
      }

      if (syncCount > 0) {
        await batch.commit();
        console.log(`✅ Synced ${syncCount} new names`);
      } else {
        console.log("✅ No new names to sync");
      }

      return { success: true, synced: syncCount };
    } catch (error) {
      console.error("Background sync error:", error);
      return { success: false, error: String(error) };
    }
  });

// Webhook for real-time sync (optional)
export const webhookSync = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const { name, owner, expiresAt, isPremium, nameHash, transactionHash } =
      req.body;

    if (!name || !owner) {
      res.status(400).send("Missing required fields");
      return;
    }

    const db = admin.firestore();
    const nameRef = db.collection("names").doc(name.toLowerCase());

    await nameRef.set({
      name: name.toLowerCase(),
      owner: owner.toLowerCase(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(expiresAt)),
      isPremium: isPremium || false,
      nameHash: nameHash || "",
      registeredAt: admin.firestore.Timestamp.now(),
      transactionHash: transactionHash || "",
      chainId: "push-chain",
      metadata: {},
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
});
