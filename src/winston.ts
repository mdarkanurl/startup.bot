import { format, transports, createLogger } from "winston";
import 'winston-daily-rotate-file';
const { combine, timestamp, json } = format;
import 'dotenv/config';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const BETTER_STACK_SOURCE_TOKEN = process.env.BETTER_STACK_SOURCE_TOKEN || "";
const BETTER_STACK_ENDPOINT = process.env.BETTER_STACK_ENDPOINT || "https://s1609300.eu-nbg-2.betterstackdata.com";

const logtail = new Logtail(BETTER_STACK_SOURCE_TOKEN, {
  endpoint: BETTER_STACK_ENDPOINT,
});

const fileRotateTransportForError = new transports.DailyRotateFile({
  dirname: "logs/error",
  filename: 'error-%DATE%.log',
  level: 'error',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const fileRotateTransportForInfo = new transports.DailyRotateFile({
  dirname: "logs/info",
  filename: 'info-%DATE%.log',
  level: 'info',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    fileRotateTransportForError,
    fileRotateTransportForInfo,
    new LogtailTransport(logtail)
  ],
  exceptionHandlers: [
    new transports.File({
      dirname: "logs/exception",
      filename: 'exception.log'
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      dirname: "logs/rejections",
      filename: 'rejections.log'
    }),
  ],
});

export {
    logger
}
