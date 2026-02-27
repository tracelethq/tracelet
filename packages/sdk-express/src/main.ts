import { TraceletCore, TraceletMeta } from "@tracelet/core";
import { Application } from "express";
import { traceletMiddleware } from "./middleware";
import { traceletDoc } from "./traceletDoc";
import { DEFAULT_TRACELET_DOCS_BASE_PATH } from "./lib/constants";

export interface TraceletDocOptions {
  docFilePath?: string;
  meta?: TraceletMeta[];
  uiBasePath?: string;
}

export interface TraceletExpressOptions {
  app: Application;
  meta?: TraceletMeta[];
  traceletDocOptions?: TraceletDocOptions;
  environment?: "local" | null;
  logFilePath?: string;
  debug?: boolean;
}

export class TraceletExpress {
  private readonly app: Application;
  private readonly traceletDocOptions?: TraceletDocOptions;
  private readonly tracelet: TraceletCore;
  private readonly uiBasePath: string;
  private readonly logFilePath?: string;

  constructor(options: TraceletExpressOptions) {
    this.app = options.app;
    this.traceletDocOptions = options.traceletDocOptions;
    this.uiBasePath = options.traceletDocOptions?.uiBasePath ?? DEFAULT_TRACELET_DOCS_BASE_PATH;
    this.logFilePath = options.logFilePath;
    const traceletDocOptions = this.traceletDocOptions?.docFilePath
      ? { defaultDocFile: this.traceletDocOptions.docFilePath, meta: options.meta }
      : { meta: options.meta };
    this.tracelet = new TraceletCore({
      environment: options.environment,
      traceletDocOptions,
      logFilePath: options.logFilePath,
      debug: options.debug,
    });
  }

  /**
   * Registers Tracelet middleware and doc routes on the app.
   * Call this before defining your routes so the middleware runs for every request.
   */
  public start(): void {
    const { logger, routeMeta } = this.tracelet.start();
    this.app.use(traceletMiddleware(logger, this.uiBasePath));
    traceletDoc(routeMeta, this.app, {
      uiTemplateOverrides: this.uiBasePath ? { basePath: this.uiBasePath } : undefined,
      logFilePath: this.logFilePath,
    });
  }
}
/** Creates Tracelet and registers middleware on the app. Await this before defining routes. */
export function traceletExpress(options: TraceletExpressOptions) {
  const t = new TraceletExpress(options);
  t.start();
  return t;
}
