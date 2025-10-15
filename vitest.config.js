import path from 'path';

const viteConfig = {
  plugins: [],
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
};

export default viteConfig;
