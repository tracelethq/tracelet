import {
  Controller,
  Post,
  Body,
  Req,
  Res,
} from "routing-controllers";
import type { Request, Response } from "express";
import { z } from "zod";
import { IngestService } from "../services/IngestService.js";

const API_KEY_HEADER = "x-api-key";

const logEntrySchema = z.object({
  requestId: z.string(),
  tracingId: z.string(),
  method: z.string(),
  route: z.string(),
  statusCode: z.number(),
  durationMs: z.number(),
  responseSize: z.number().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

const ingestBodySchema = z.object({
  logs: z.array(logEntrySchema).optional().default([]),
  apiExplorer: z.record(z.unknown()).optional(),
});

function getApiKeyFromRequest(req: Request): string | null {
  const header = req.headers[API_KEY_HEADER];
  if (typeof header === "string" && header.trim()) return header.trim();
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  }
  return null;
}

const ingestService = new IngestService();

@Controller("/ingest")
export class IngestController {
  /**
   * Ingest logs and/or API explorer JSON from SDK (packages).
   * Authenticate with API key (header x-api-key or Authorization: Bearer <key>).
   * Key must have metadata.organizationId and metadata.env (set when creating the key in the app).
   */
  @Post()
  async ingest(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const apiKey = getApiKeyFromRequest(req);
    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key. Use x-api-key header or Authorization: Bearer <key>." });
    }

    const context = await ingestService.verifyApiKey(apiKey);
    if (!context) {
      return res.status(401).json({ error: "Invalid or expired API key, or key not scoped to a project/env." });
    }

    const parseResult = ingestBodySchema.safeParse(body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid body", details: parseResult.error.flatten() });
    }

    const { logs, apiExplorer } = parseResult.data;

    try {
      const result = await ingestService.ingest(context, { logs, apiExplorer });
      return res.status(202).json({
        ok: true,
        logs: result.logsCount,
        apiExplorerUpdated: result.apiExplorerUpdated,
      });
    } catch (err) {
      console.error("[ingest] Error storing data:", err);
      return res.status(500).json({ error: "Failed to store ingest data." });
    }
  }
}
