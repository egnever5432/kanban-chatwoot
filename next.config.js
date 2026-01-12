/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CHATWOOT_API_URL: process.env.CHATWOOT_API_URL,
    CHATWOOT_ACCOUNT_ID: process.env.CHATWOOT_ACCOUNT_ID,
    CHATWOOT_API_TOKEN: process.env.CHATWOOT_API_TOKEN,
  },
}

module.exports = nextConfig
