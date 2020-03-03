import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import css from 'rollup-plugin-css-only'

export default [{
  input: 'src/bundle.js',
  output: { file: 'assets/bundle.js', format: 'esm' },
  plugins: [
    alias({
      entries: [
        { find: '@qocode/qocode/qosource', replacement: '@qocode/qocode' }
      ]
    }),
    resolve({ browser: true, preferBuiltins: false }),
    cleanup({ comments: 'none' }),
    css({ output: 'assets/bundle.css' })
  ]
}]
