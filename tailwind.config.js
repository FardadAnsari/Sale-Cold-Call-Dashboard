/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path if your files are elsewhere
  ],
  theme: {
    extend: {
      // Add custom background images or gradients here
      backgroundImage: {
        'logo-pattern': "url('/src/images/logo.png')",
        'hero-gradient': "linear-gradient(to right, #3b82f6, #6366f1)",
        'dark-gradient': "linear-gradient(to bottom, #111827, #1f2937)",
        'light-gradient': "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
      },
      // Optional: Add custom colors, fonts, spacing, etc.
      colors: {
        primary: 'red',
        secondary: 'blue',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
    require('@tailwindcss/typography'), // 
  ],
};