export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wine: { 50: '#fff4f5', 100: '#fde0e4', 500: '#9d2e38', 600: '#8b2630', 700: '#741c25', 900: '#421418' },
        navy: '#10233e',
        cream: '#fbfaf7'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: { card: '0 8px 30px rgba(16,35,62,.07)' }
    }
  },
  plugins: []
};
