import { Router, Request, Response } from "express";
import { LogReader } from "@tracelet/core";
import path from "path";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const READ_LINES = 5000;
const logReader = new LogReader();


export function createLogsRouter(logFilePath?: string) {
  const router = Router();

  router.get("/logs", async (req: Request, res: Response) => {
    if (!logFilePath) {
      return res.json({
        groups: [],
        total: 0,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        message: "Log file not configured. Set logFilePath in Tracelet options.",
      });
    }
    const resolvedPath = path.isAbsolute(logFilePath) ? logFilePath : path.resolve(process.cwd(), logFilePath);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const page = Math.max(1, Number(req.query.page) || 1);
    const type = (req.query.type as string) || "all";
    const level = (req.query.level as string) || "all";
    const search = (req.query.search as string) || "";

    const {total, logs} = await logReader.readLastLines({ filePath: resolvedPath, maxLines: READ_LINES, page, limit, type, level, search });

    return res.json({
      groups: logs,
      total,
      page,
      limit,
    });
  });

  return router;
}

/** Default router when no logFilePath is passed (for backward compatibility). */
const defaultLogsRouter = createLogsRouter();

export default defaultLogsRouter;
