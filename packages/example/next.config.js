/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: { esmExternals: true },
  env: {
    infuraKey: '84842078b09946638c03157f83405213',
    alchemyKey: '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      events: require.resolve('events'),
    }
    return config
  },
}

module.exports = nextConfig
