import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F6CBD',
        accent: '#FF6B35',
        surface: '#0B1B2B',
        muted: '#1B2A3B',
      },
    },
  },
  plugins: [],
};

export default config;
