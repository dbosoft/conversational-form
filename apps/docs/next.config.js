const withMarkdoc = require('@markdoc/next.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'ts', 'tsx', 'md'],
  experimental: {
    scrollRestoration: true,
  },
}

module.exports = withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig)
