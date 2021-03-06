module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6385876,
      gasPrice: 20000000000
    },
    develop: {
      port: 8545
    }
  },
  compilers: {
    solc: {
      version: "^0.4.18", // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
};
