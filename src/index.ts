import commander from 'commander'

import { logger } from './logger'
import { options } from './options'
import { version, name } from '../package.json'
import { extract } from './extract'

commander.version(version)
  .arguments('[group]')
  .option('-g --group <group>', 'Group to extract')
  .option('-v --verbose', 'Verbose log')
  .option('-f --force', 'Force overwrite')
  .parse(process.argv)

if (commander.verbose) {
  options.verbose = true
}

if (commander.force) {
  options.force = true
}

logger.debug(`Starting ${name} v${version}`)

const group = commander.group || commander.args[0]

extract(group)
  .then(() => logger.info('Finished extracting successfully'))
  .catch((err) => logger.error(`There was an error extracting ${err.message}`))
