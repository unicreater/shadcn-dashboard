export class Logger {
  static log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (process.env.NODE_ENV === "development") {
      switch (level) {
        case "DEBUG":
          console.debug(`[${timestamp}] DEBUG: ${message}`, context);
          break;
        case "INFO":
          console.info(`[${timestamp}] INFO: ${message}`, context);
          break;
        case "WARN":
          console.warn(`[${timestamp}] WARN: ${message}`, context);
          break;
        case "ERROR":
          console.error(`[${timestamp}] ERROR: ${message}`, context);
          break;
      }
    } else {
      // In production, send to logging service or write to file
      console.log(JSON.stringify(logEntry));
    }
  }

  static debug(message, context) {
    this.log("DEBUG", message, context);
  }

  static info(message, context) {
    this.log("INFO", message, context);
  }

  static warn(message, context) {
    this.log("WARN", message, context);
  }

  static error(message, context) {
    this.log("ERROR", message, context);
  }
}
