import resolve from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default [{
  input: 'src/bundle.js',
  output: { file: 'assets/bundle.js', format: 'esm' },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    cleanup({ comments: 'none' })
  ]
}]
