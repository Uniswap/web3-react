/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack5: true,
  env: {
    infuraKey: '84842078b09946638c03157f83405213',
    alchemyKey: '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
  },
  esmExternals: 'loose',
}

module.exports = nextConfig
