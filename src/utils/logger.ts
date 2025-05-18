export enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
	DEBUG = "DEBUG",
}

export const Logger = {
	log(level: LogLevel, message: string, data?: unknown): void {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] [${level}] ${message}`;

		switch (level) {
			case LogLevel.INFO:
				console.info(formattedMessage);
				break;
			case LogLevel.WARN:
				console.warn(formattedMessage);
				break;
			case LogLevel.ERROR:
				console.error(formattedMessage, data || "");
				break;
			case LogLevel.DEBUG:
				console.debug(formattedMessage, data || "");
				break;
		}
	},

	info(message: string): void {
		Logger.log(LogLevel.INFO, message);
	},

	warn(message: string): void {
		Logger.log(LogLevel.WARN, message);
	},

	error(message: string, error?: unknown): void {
		Logger.log(LogLevel.ERROR, message, error);
	},

	debug(message: string, data?: unknown): void {
		Logger.log(LogLevel.DEBUG, message, data);
	},
};
