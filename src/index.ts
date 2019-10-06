import commander from 'commander'

import { logger } from './logger'
import { options } from './options'
import { version, name } from '../package.json'

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

if (!group) {
  logger.info('Extracting all groups')
  process.exit(0)
}

logger.info(`Extracting group ${group}`)
