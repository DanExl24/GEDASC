/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily:{
        quicksand: ['Quicksand', 'sans-serif'],
        robotoSlab: ['Roboto Slab', 'serif'],
      },
      colors:{
        senaColor : '#077E07',
        lightBlue : '#205EAF'
      }
    },
  },
  plugins: [],
}
