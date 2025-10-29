import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  formatters: true,
  ignores: ['es', 'lib', 'dist', 'node_modules'],
})
