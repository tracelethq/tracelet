import { TraceletCore, TraceletMeta } from "@tracelet/core";
import { Application } from "express";
import { traceletMiddleware } from "./middleware";
import { traceletDoc } from "./traceletDoc";
import { DEFAULT_TRACELET_DOCS_BASE_PATH } from "./lib/constants";

interface TraceletDocOptions {
  docFilePath?: string;
  meta?: TraceletMeta[];
  uiBasePath?: string;
}

interface TraceletExpressOptions {
  serviceName: string;
  app: Application;
  meta?: TraceletMeta[];
  traceletDocOptions?: TraceletDocOptions;
  environment?: "local" | null;
  logFilePath?: string;
  apiKey?: string;
}

export class TraceletExpress {
  private readonly serviceName: string;
  private readonly app: Application;
  private readonly meta?: TraceletMeta[];
  private readonly traceletDocOptions?: TraceletDocOptions;
  private readonly environment?: "local" | null;
  private readonly logFilePath?: string;
  private readonly tracelet: TraceletCore;
  private readonly apiKey?: string;
  private readonly uiBasePath: string;

  constructor(options: TraceletExpressOptions) {
    this.serviceName = options.serviceName;
    this.app = options.app;
    this.meta = options.meta;
    this.traceletDocOptions = options.traceletDocOptions;
    this.environment = options.environment;
    this.logFilePath = options.logFilePath;
    this.apiKey = options.apiKey;
    this.uiBasePath = options.traceletDocOptions?.uiBasePath ?? DEFAULT_TRACELET_DOCS_BASE_PATH;
    const traceletDocOptions = this.traceletDocOptions?.docFilePath
      ? { defaultDocFile: this.traceletDocOptions.docFilePath, meta: this.meta }
      : { meta: this.meta };
    this.tracelet = new TraceletCore({
      serviceName: this.serviceName,
      environment: this.environment,
      apiKey: this.apiKey,
      traceletDocOptions,
      logFilePath: this.logFilePath,
    });
  }

  /**
   * Registers Tracelet middleware and doc routes on the app.
   * Call this before defining your routes so the middleware runs for every request.
   */
  public start(): void {
    const { logger, routeMeta } = this.tracelet.start();
    this.app.use(traceletMiddleware(logger, this.uiBasePath));
    traceletDoc(routeMeta, this.app, this.uiBasePath ? { uiTemplateOverrides: { basePath: this.uiBasePath } } : undefined);
  }
}
/** Creates Tracelet and registers middleware on the app. Await this before defining routes. */
export function traceletExpress(options: TraceletExpressOptions) {
  const t = new TraceletExpress(options);
  t.start();
  return t;
}
