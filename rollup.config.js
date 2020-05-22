import resolve from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import css from 'rollup-plugin-css-only'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'src/external.js',
  output: { file: 'build/external.js', format: 'esm', compact: true },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    cleanup({ comments: 'none' }),
    terser()
  ]
}, {
  input: 'src/bundle.js',
  output: { file: 'build/bundle.js', format: 'esm' },
  external: ['@notml/core', '@qocode/core', '../external.js'],
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
