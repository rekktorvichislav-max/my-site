/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    staticPageGenerationTimeout: 120,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Убираем experimental.runtime — он больше не нужен
}

module.exports = nextConfig