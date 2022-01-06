import devConfig from './configs/rollup.config.dev'
import prodConfig from './configs/rollup.config.prod'

const production = !process.env.ROLLUP_WATCH

const config = production ? prodConfig : devConfig

export default config
