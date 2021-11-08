// @ts-ignore
import baseConfig from './rollup.config.base.ts'
import filesize from 'rollup-plugin-filesize'

export default {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        filesize()
    ]
}
