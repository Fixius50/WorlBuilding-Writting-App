/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Webpack configuration for sql.js WASM support
    webpack: (config, { isServer }) => {
        // Handle sql.js WASM files
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        // Fallback for node modules in browser
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
