/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // -----  Global variable mapped colors  ---------
        primary:   'var(--color-primary)',
        surface:   'var(--color-surface)',
        gold:      'var(--color-gold)',
        muted:     'var(--color-muted)',
        success:   'var(--color-success)',
        danger:    'var(--color-danger)',
        neutral:   'var(--color-neutral)',
        
        // CamelCase support for existing usage
        bgApp:       'var(--bg-app)',
        bgInput:     'var(--bg-input)',
        borderInput: 'var(--border-input)',
        textMain:    'var(--text-main)',
        textMuted:   'var(--text-muted)',
        brand:       'var(--brand-color)',
        brandLight:  'var(--brand-color-light)',
        brandDark:   'var(--brand-color-dark)',

        // Kebab-case support for standard Tailwind class syntax and CSS compatibility
        'bg-app':             'var(--bg-app)',
        'bg-input':           'var(--bg-input)',
        'border-input':       'var(--border-input)',
        'text-main':          'var(--text-main)',
        'text-muted':         'var(--text-muted)',
        'brand-color':        'var(--brand-color)',
        'brand-color-light':  'var(--brand-color-light)',
        'brand-color-dark':   'var(--brand-color-dark)',
        'brand-light':        'var(--brand-color-light)',
        'brand-dark':         'var(--brand-color-dark)',
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
        display: ['var(--font-display)', 'Rubik', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
        rounded: ['var(--font-rounded)', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', 'Meiryo', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '24px', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
};