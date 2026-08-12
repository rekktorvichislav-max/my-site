/** @type {import('next').NextConfig} */
const nextConfig = {
    staticPageGenerationTimeout: 120,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig