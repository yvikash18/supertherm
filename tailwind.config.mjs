/** @type {import('tailwindcss').Config} */
// Colours are defined once as CSS variables in src/styles/global.css.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        floor: 'var(--floor)',
        plate: 'var(--plate)',
        rule: 'var(--rule)',
        steel: { DEFAULT: 'var(--steel)', 2: 'var(--steel-2)', 3: 'var(--steel-3)' },
        cab: { DEFAULT: 'var(--cab)', deep: 'var(--cab-deep)' },
        night: { DEFAULT: 'var(--night)', 2: 'var(--night-2)' },
        heat: { 700: 'var(--h700)', 900: 'var(--h900)', 1100: 'var(--h1100)', 1250: 'var(--h1250)' },
        copper: 'var(--copper)',
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
