import winston from 'winston'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

// Ensure logs directory exists relative to project root
const __dirname = dirname(fileURLToPath(import.meta.url))
const logDir = join(__dirname, '..', 'logs')
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}

const { combine, timestamp, errors, json, printf, colorize } = winston.format

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  let msg = `${timestamp} [${level}] ${message}`
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta)}`
  }
  return msg
})

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : devFormat
  ),
  defaultMeta: { service: 'smart-notes-api' },
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? json()
          : combine(colorize(), devFormat),
    }),
  ],
})

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: join(logDir, 'error.log'),
      level: 'error',
    })
  )
  logger.add(
    new winston.transports.File({
      filename: join(logDir, 'combined.log'),
    })
  )
}

export default logger
