import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F97316', // Orange/Amber theme (matching registration form)
        secondary: '#FB923C', // Light orange accent
        accent: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
export default config
