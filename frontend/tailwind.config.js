import colors from './src/styles/colors.js'

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        'brand-bg': colors.background.main,
        'brand-dark': colors.background.dark,
        'brand-footer': colors.background.footer,
        'brand-card': colors.background.card,
        'brand-cyan': colors.gradient.from,
        'brand-indigo': colors.gradient.to,
        'cyan-accent': colors.text.accentCyan,
        'body-text': colors.text.body,
        'text-secondary': colors.text.secondaryMuted,
        'text-desc': colors.text.description,
        'text-sub': colors.text.subtitle,
        'text-card': colors.text.cardDesc,
        'text-divider': colors.text.dividerText,
        'tag-text': colors.text.tagText,
      },
    },
  },
}
