/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,.28), 0 10px 30px rgba(2,132,199,.18), 0 0 45px rgba(139,92,246,.12)'
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at top right, rgba(34,211,238,.18), transparent 28%), radial-gradient(circle at bottom left, rgba(168,85,247,.16), transparent 24%), linear-gradient(135deg, rgba(2,6,23,.96), rgba(3,7,18,.92))'
      }
    }
  },
  plugins: []
};