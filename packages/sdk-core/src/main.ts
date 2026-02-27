import { Logger } from "./logger";
import { RouteMeta, TraceletMeta } from "./meta";

interface TraceletCoreOptions {
  environment?: "local" | null;
  traceletDocOptions?: { defaultDocFile?: string; meta?: TraceletMeta[] };
  /** When set, logs are appended to this file (Node only). One JSON line per entry. */
  logFilePath?: string;
  debug?: boolean;
}

export class TraceletCore {
  private logger: Logger;
  private routeMeta: RouteMeta;
  constructor(options: TraceletCoreOptions) {
    const { environment, traceletDocOptions, logFilePath, debug } = options;
    this.logger = new Logger({
      environment: environment ?? undefined,
      logFilePath:logFilePath ?? "tracelet.log",
      debugMode: debug ?? false,
    });
    this.routeMeta = new RouteMeta({
      ...traceletDocOptions,
    });
  }
  public start() {
    return {
      logger: this.logger,
      routeMeta: this.routeMeta,
    };
  }
}
