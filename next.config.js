/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Отключаем статическую генерацию для всех API-роутов
  staticPageGenerationTimeout: 120,
  // Игнорируем ошибки во время сборки
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Запрещаем предварительный рендеринг для API
  experimental: {
    runtime: 'nodejs',
  },
}

module.exports = nextConfig