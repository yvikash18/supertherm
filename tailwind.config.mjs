/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware: driven by CSS variables in global.css (dark default + html.light)
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          2: 'rgb(var(--c-ink-2) / <alpha-value>)',
          3: 'rgb(var(--c-ink-3) / <alpha-value>)',
        },
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        molten: {
          50: 'rgb(var(--c-molten-50) / <alpha-value>)',
          100: 'rgb(var(--c-molten-100) / <alpha-value>)',
          200: 'rgb(var(--c-molten-200) / <alpha-value>)',
          300: 'rgb(var(--c-molten-300) / <alpha-value>)',
          400: 'rgb(var(--c-molten-400) / <alpha-value>)',
          500: 'rgb(var(--c-molten-500) / <alpha-value>)',
          600: 'rgb(var(--c-molten-600) / <alpha-value>)',
          700: 'rgb(var(--c-molten-700) / <alpha-value>)',
        },
        ember: 'rgb(var(--c-ember) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
