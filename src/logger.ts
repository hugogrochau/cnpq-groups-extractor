import chalk from 'chalk'
import { options } from './options'

export const logger = {
  debug: (message?: string | null) => options.verbose && console.info(`${chalk.bold.blue('DEBUG')} ${message}`),
  info: (message?: string | null) => console.info(`${chalk.bold.green('INFO')} ${message}`),
  warn: (message?: string | null) => console.info(`${chalk.bold.yellow('WARN')} ${message}`),
  error: (message?: string | null) => console.info(`${chalk.bold.red('ERROR')} ${message}`)
}
