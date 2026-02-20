import "reflect-metadata";
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
} from "routing-controllers";
import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

const ENV_VALUES = ["development", "staging", "production"] as const;

const createEnvSchema = z.object({
  env: z.enum(ENV_VALUES),
  baseUrl: z.string().url().optional().or(z.literal("")),
  apiKey: z.string().optional(),
});

const updateEnvSchema = z.object({
  baseUrl: z.string().url().optional().or(z.literal("")),
  apiKey: z.string().optional(),
});

async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

async function isMemberOfOrg(userId: string, organizationId: string): Promise<boolean> {
  const m = await prisma.member.findFirst({
    where: { userId, organizationId },
  });
  return !!m;
}

@Controller("/organizations")
export class OrganizationEnvsController {
  /** List envs for an organization (project). */
  @Get("/:organizationId/envs")
  async list(
    @Param("organizationId") organizationId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const envs = await prisma.organizationEnv.findMany({
      where: { organizationId },
      orderBy: { env: "asc" },
      select: {
        id: true,
        env: true,
        baseUrl: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json(envs);
  }

  /** Create or replace an env (upsert by organizationId + env). */
  @Post("/:organizationId/envs")
  async create(
    @Param("organizationId") organizationId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const parsed = createEnvSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { env, baseUrl, apiKey } = parsed.data;
    const envRecord = await prisma.organizationEnv.upsert({
      where: {
        organizationId_env: { organizationId, env },
      },
      create: {
        organizationId,
        env,
        baseUrl: baseUrl || null,
        apiKey: apiKey ?? null,
      },
      update: {
        baseUrl: baseUrl || null,
        apiKey: apiKey ?? null,
      },
      select: {
        id: true,
        env: true,
        baseUrl: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(201).json(envRecord);
  }

  /** Update an env by id. */
  @Patch("/:organizationId/envs/:envId")
  async update(
    @Param("organizationId") organizationId: string,
    @Param("envId") envId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const parsed = updateEnvSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const envRecord = await prisma.organizationEnv.findFirst({
      where: { id: envId, organizationId },
    });
    if (!envRecord) return res.status(404).json({ error: "Environment not found" });

    const updated = await prisma.organizationEnv.update({
      where: { id: envId },
      data: {
        ...(parsed.data.baseUrl !== undefined && {
          baseUrl: parsed.data.baseUrl || null,
        }),
        ...(parsed.data.apiKey !== undefined && { apiKey: parsed.data.apiKey ?? null }),
      },
      select: {
        id: true,
        env: true,
        baseUrl: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json(updated);
  }

  /** Delete an env. */
  @Delete("/:organizationId/envs/:envId")
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("envId") envId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(404).json({ error: "Project not found" });
    }

    const envRecord = await prisma.organizationEnv.findFirst({
      where: { id: envId, organizationId },
    });
    if (!envRecord) return res.status(404).json({ error: "Environment not found" });

    await prisma.organizationEnv.delete({ where: { id: envId } });
    return res.status(204).send();
  }
}
