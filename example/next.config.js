require('dotenv').config()
const path = require('path')

module.exports = {
  env: {
    RPC_URL_4: process.env.RPC_URL_4,
    RPC_URL_1: process.env.RPC_URL_1,
    FORTMATIC_API_KEY: process.env.FORTMATIC_API_KEY,
    PORTIS_DAPP_ID: process.env.PORTIS_DAPP_ID,
    SQUARELINK_CLIENT_ID: process.env.SQUARELINK_CLIENT_ID
  },
  webpack(config) {
    config.resolve.alias['@web3-react'] = path.join(__dirname, '..', 'packages')
    return config
  }
}
