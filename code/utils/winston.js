const winston = require("winston");

const {timestamp, printf } = winston.format;

const timestampedFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
	level: "debug",
	exitOnError: false,
	transports: [

		new winston.transports.File({
			level: "error",
			filename: `${__dirname}/../logs/error.log`,
			format: winston.format.json()
		}),
		new winston.transports.File({
			filename: `${__dirname}/../logs/cobined.log`,
			format: winston.format.json()
		}),
		new winston.transports.Console({
			level: "debug",
			format: winston.format.combine(
				timestamp(),
				winston.format.colorize(),
				timestampedFormat,
			)
		})
	],
	exceptionHandlers: [
		new winston.transports.File({
			filename: `${__dirname}/../logs/exceptions.log`,
			format: winston.format.json()
		}),
		new winston.transports.Console({
			format: winston.format.combine(
				timestamp(),
				timestampedFormat,
				winston.format.colorize(),
				winston.format.simple()
			)
		})
	]
});
module.exports = logger;