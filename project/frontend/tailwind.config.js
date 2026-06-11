/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Global variable mapped colors
        primary:   'var(--color-primary)',
        surface:   'var(--color-surface)',
        gold:      'var(--color-gold)',
        muted:     'var(--color-muted)',
        success:   'var(--color-success)',
        danger:    'var(--color-danger)',
        neutral:   'var(--color-neutral)',
        
        bgApp:     'var(--bg-app)',
        bgInput:   'var(--bg-input)',
        borderInput: 'var(--border-input)',
        textMain:  'var(--text-main)',
        textMuted: 'var(--text-muted)',
        brand:     'var(--brand-color)',
        brandLight: 'var(--brand-color-light)',
        brandDark: 'var(--brand-color-dark)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        base: '4px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        'margin-mobile': '16px',
        'gutter-mobile': '12px',
      },
      fontFamily: {
        rubik: ['Rubik', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};