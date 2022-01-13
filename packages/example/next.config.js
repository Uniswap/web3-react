/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: process.env.INFURA_KEY,
    alchemyKey: process.env.ALCHEMY_KEY,
    magicKey: process.env.MAGIC_KEY,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      events: require.resolve('events/'),
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      bufferutil: false,
      'utf-8-validate': false,
    }
    return config
  },
}

module.exports = nextConfig
