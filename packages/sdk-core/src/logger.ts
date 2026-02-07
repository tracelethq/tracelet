export interface LoggerOptions {
    serviceName: string;
    environment?: string;
  }
  
  export interface LogPayload {
    [key: string]: any;
  }
  
  export function createLogger(options: LoggerOptions) {
    const baseContext = {
      service: options.serviceName,
      environment: options.environment ?? "prod",
    };
  
    function log(level: "info" | "error", payload: LogPayload) {
      const logEntry = {
        level,
        ...baseContext,
        ...payload,
      };
  
      if (options.environment === "dev") {
        // human readable
        console.log(level.toUpperCase(), logEntry);
      } else {
        // production JSON
        console.log(JSON.stringify(logEntry));
      }
    }
  
    return {
      info(payload: LogPayload) {
        log("info", payload);
      },
      error(payload: LogPayload) {
        log("error", payload);
      },
    };
  }
  