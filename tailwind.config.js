export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241B35',
        mist: '#F7F4FA',
        line: '#E3DCEC',
        plum: { DEFAULT: '#3D2569', light: '#664796', deep: '#2B1850' },
        rose: { DEFAULT: '#E8458A', dark: '#B01F5F', soft: '#FDEBF3' },
        pink: { DEFAULT: '#E8458A' },
        lilac: { DEFAULT: '#F0EAF8' },
        wine: { 50: '#f5f1fa', 100: '#e8dff3', 500: '#E8458A', 600: '#664796', 700: '#503574', 900: '#302044' },
        navy: '#664796',
        cream: '#fbf8fd'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif'],
        editorial: ['"Source Serif 4"', 'Georgia', 'serif']
      },
      boxShadow: { card: '0 8px 30px rgba(102,71,150,.07)' },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: { 'fade-up': 'fadeUp .8s cubic-bezier(.2,.7,.2,1) both' }
    }
  },
  plugins: []
};
