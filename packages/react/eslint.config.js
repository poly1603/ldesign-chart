import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  react: true,
  formatters: true,
  ignores: ['es', 'lib', 'dist', 'node_modules'],
})
