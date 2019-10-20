import commander from 'commander'

import { logger } from './logger'
import { options } from './options'
import { version, name } from '../package.json'
import { launchExtractFromGroupSearch, launchExtractGroupPage } from './launchers'
import { initDb, closeDb } from './database'

commander.version(version)
  .option('-s --search <group>', 'Group search term to extract')
  .option('-g --group <group>', 'Specific group to extract')
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

const group = commander.group
const search = commander.search

const handleCommand = async (group: string, search: string) => {
  if (!group && !search) {
    commander.outputHelp()
    process.exit(1)
  }

  await initDb()

  if (search) {
    await launchExtractFromGroupSearch(search)
  } else if (group) {
    await launchExtractGroupPage(group)
  }

  await closeDb()
}

handleCommand(group, search)
  .then(() => {
    logger.info('Finished extracting successfully')
  })
  .catch((err) => {
    logger.error(`There was an error extracting ${err.message}`)
    process.exit(1)
  })
