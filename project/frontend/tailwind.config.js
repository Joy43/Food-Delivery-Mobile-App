/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Brand palette (matches Colors.ts exactly) ────────────────────
        primary:   '#0A0E27',   // primaryDark  – main background
        surface:   '#1A1F3A',   // secondaryDark – cards / surfaces
        gold:      '#E8B923',   // Gold Accent / CTA
        muted:     '#A0A8B8',   // Text Secondary
        success:   '#10B981',   // Success green
        danger:    '#EF4444',   // Destructive red
        neutral:   '#6B7280',   // Neutral gray
      },
    },
  },
  plugins: [],
};