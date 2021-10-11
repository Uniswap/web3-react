/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: '84842078b09946638c03157f83405213',
    alchemyKey: '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
  },
  esmExternals: true,
  webpack: (config) => {
    config.resolve.fallback = { events: require.resolve('events/'), process: require.resolve('process/browser') }
    return config
  },
}

module.exports = nextConfig
