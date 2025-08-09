import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix cross-origin warning in development
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.localhost'],
  
  // Performance optimizations for development
  experimental: {
    // Enable server components HMR cache for better development performance
    serverComponentsHmrCache: true,
    
    // Optimize package imports for better bundling
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    
    // Enable CSS chunking for better performance
    cssChunking: true,
  },
  
  // Enable detailed fetch logging for debugging
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  
  // Optimize images
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      // Enable faster refresh
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  async rewrites() {
    return [
      // Normalize device routes to safe internal paths to avoid dot/colon edge cases
      {
        source: '/device/ip/:address*',
        destination: '/device/_ip/:address*',
      },
      {
        source: '/device/internetid/:id*',
        destination: '/device/_internetid/:id*',
      },
    ];
  },
};

export default nextConfig;
