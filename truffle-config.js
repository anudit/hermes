const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require('fs');
let mnemonic;

try {
  mnemonic = fs.readFileSync(".secret").toString().trim();
}
catch(err) {
  console.warn("Make sure that a '.secret' file in the root directory contains your mnemonic.");
  console.warn(err.message+'\n');
  mnemonic = '';
}

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    mumbai: {
      provider: () => new HDWalletProvider(mnemonic, 'https://rpc-mumbai.matic.today'),
      network_id: 80001,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 8 * 1000000,
      gasPrice: '1000000000' // 1 gwei
    }
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.7.5",
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "istanbul"
      }
    }
  }
}
