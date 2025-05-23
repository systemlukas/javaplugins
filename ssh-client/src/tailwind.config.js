/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // For files like main.tsx, App.tsx directly in src/
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    // Add other paths if you structure your project differently
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
