/** @type {import('tailwindcss').Config} */
// Palet warna dan font situs (warna logo LPK BYE: pink #E8458A, ungu #664796, abu #BFBEBE)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241B35',      // teks utama
        mist: '#F7F4FA',     // latar halaman
        line: '#E3DCEC',     // garis dan border
        plum: { DEFAULT: '#3D2569', light: '#664796', deep: '#2B1850' }, // ungu: hero, footer, tombol gelap
        rose: { DEFAULT: '#D12A74', dark: '#B01F5F', soft: '#FDEBF3' },  // pink aksi: tombol, fokus
        pink: { DEFAULT: '#E8458A' },                                    // pink logo (dekorasi)
        lilac: { DEFAULT: '#F0EAF8' },                                   // ungu muda: latar ikon
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        draw: { to: { strokeDashoffset: '0' } },
        pop: {
          '0%': { transform: 'scale(.6)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .8s cubic-bezier(.2,.7,.2,1) both',
        draw: 'draw .6s .3s ease forwards',
        pop: 'pop .5s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
