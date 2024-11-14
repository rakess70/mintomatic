// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.externals = [...(config.externals || []), "pino-pretty", "lokijs", "encoding"];
      return config;
    },
  };
  
  export default nextConfig;
  