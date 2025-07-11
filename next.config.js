/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js and canvas issues for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
      assert: false,
      util: false,
      buffer: false,
      events: false,
    };

    // Ignore canvas module completely for both server and client
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });

    // Add specific rule to ignore canvas in pdfjs-dist
    config.module.rules.push({
      test: /node_modules\/pdfjs-dist\/build\/pdf\.js$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: '__non_webpack_require__\\("canvas"\\)',
          replace: 'null',
          flags: 'g'
        }
      }
    });

    // Handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });

    // Ignore problematic PDF.js imports
    config.module.rules.push({
      test: /node_modules\/pdfjs-dist/,
      resolve: {
        fallback: {
          canvas: false,
          fs: false,
        },
      },
    });

    return config;
  },
  
  // Transpile PDF.js modules
  transpilePackages: ['pdfjs-dist'],
};

module.exports = nextConfig;