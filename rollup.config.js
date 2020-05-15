import resolve from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import css from 'rollup-plugin-css-only'

export default [{
  input: 'src/bundle.js',
  output: { file: 'build/bundle.js', format: 'esm' },
  external: ['@notml/core', '@qocode/core'],
  plugins: [
    cleanup({ comments: 'none' }),
    css({ output: 'assets/bundle.css' })
  ]
}, {
  input: 'build/bundle.js',
  output: { file: 'assets/bundle.js', format: 'esm' },
  plugins: [
    resolve({ browser: true, preferBuiltins: false })
  ]
}, {
  input: 'src/check-and-redirect.js',
  output: { file: 'assets/check-and-redirect.js' },
  plugins: [
    cleanup({ comments: 'none' }),
    resolve({ browser: true, preferBuiltins: false })
  ]
}]
