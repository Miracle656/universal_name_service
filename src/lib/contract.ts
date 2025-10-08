export const CONTRACT_ADDRESS = "0x6032E825069f5C057aFDE606B8BCA9de84742C3D";

export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string[]", "name": "names", "type": "string[]"}],
    "name": "addPremiumNames",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "register",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "renew",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "avatar", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "url", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "twitter", "type": "string"},
      {"internalType": "string", "name": "github", "type": "string"},
      {"internalType": "string", "name": "discord", "type": "string"},
      {"internalType": "string", "name": "telegram", "type": "string"}
    ],
    "name": "setMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "transfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "baseRegistrationFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "nameHash", "type": "bytes32"}],
    "name": "calculateRegistrationFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "getMetadata",
    "outputs": [
      {"internalType": "string", "name": "avatar", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "url", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "twitter", "type": "string"},
      {"internalType": "string", "name": "github", "type": "string"},
      {"internalType": "string", "name": "discord", "type": "string"},
      {"internalType": "string", "name": "telegram", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "getNameHash",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "getNameRecord",
    "outputs": [{
      "components": [
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "uint256", "name": "expiresAt", "type": "uint256"},
        {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
        {"internalType": "bool", "name": "isPremium", "type": "bool"},
        {
          "components": [
            {"internalType": "string", "name": "chainNamespace", "type": "string"},
            {"internalType": "string", "name": "chainId", "type": "string"},
            {"internalType": "bytes", "name": "owner", "type": "bytes"}
          ],
          "internalType": "struct UniversalAccountId",
          "name": "originAccount",
          "type": "tuple"
        }
      ],
      "internalType": "struct PushNameService.NameRecord",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "isNameAvailable",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "resolve",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyOrigin",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "chainNamespace", "type": "string"},
          {"internalType": "string", "name": "chainId", "type": "string"},
          {"internalType": "bytes", "name": "owner", "type": "bytes"}
        ],
        "internalType": "struct UniversalAccountId",
        "name": "originAccount",
        "type": "tuple"
      },
      {"internalType": "bool", "name": "isUEA", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
