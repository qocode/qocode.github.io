import resolve from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import css from 'rollup-plugin-css-only'

export default [{
  input: 'src/bundle.js',
  output: { file: 'assets/bundle.js', format: 'esm' },
  external: ['@notml/core', '@qocode/core'],
  plugins: [
    cleanup({ comments: 'none' }),
    css({ output: 'assets/bundle.css' })
  ]
}, {
  input: 'assets/bundle.js',
  output: { file: 'assets/bundle.js', format: 'esm' },
  plugins: [
    resolve({ browser: true, preferBuiltins: false })
  ]
}]
