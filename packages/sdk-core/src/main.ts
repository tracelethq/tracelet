// import { IngestClient } from "./ingest";
import { Logger } from "./logger";
import { RouteMeta, TraceletMeta } from "./meta";

interface TraceletCoreOptions {
  serviceName: string;
  environment?: "local" | null;
  apiKey?: string;
  traceletDocOptions?: {defaultDocFile?: string, meta?: TraceletMeta[]};
  /** When set, logs are appended to this file (Node only). One JSON line per entry. */
  logFilePath?: string;
}

export class TraceletCore {
  private logger: Logger;
  private routeMeta: RouteMeta;
  constructor(options: TraceletCoreOptions) {
    const { serviceName, environment, apiKey, traceletDocOptions, logFilePath } = options;
    // const ingestClient = new IngestClient({
    //   apiKey: apiKey,
    //   environment: environment,
    // });
    this.logger = new Logger({
      serviceName: serviceName,
      environment: environment ?? "production",
      // ingestClient: ingestClient,
      ...(logFilePath != null && { logFilePath }),
    });
    this.routeMeta = new RouteMeta({
      // ingestClient: ingestClient,
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