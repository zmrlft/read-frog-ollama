module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    '@repo/ui/plugins/postcss-rename-custom-props.cjs': {
      fromPrefix: '--tw-',
      toPrefix: '--rf-tw-',
    },
    'autoprefixer': {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 16,
      propList: ['*'],
      transformUnit: 'px',
    },
  },
}
