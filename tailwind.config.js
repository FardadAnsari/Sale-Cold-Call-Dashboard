/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this based on your project structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        'logo': "url('/src/images/logo.png')", 

      },
        
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};