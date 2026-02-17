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

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  organizationId: z.string().min(1),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
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

@Controller("/projects")
export class ProjectsController {
  /** List projects for an organization (user must be member). Query: organizationId */
  @Get("/")
  async list(@Req() req: Request, @Res() res: Response) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : null;
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId query is required" });
    }
    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(403).json({ error: "Not a member of this organization" });
    }

    const projects = await prisma.project.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true },
    });
    return res.json(projects);
  }

  /** Get one project by id (user must be member of project's org) */
  @Get("/:id")
  async get(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const project = await prisma.project.findFirst({
      where: { id },
      select: { id: true, name: true, slug: true, organizationId: true, createdAt: true, updatedAt: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!(await isMemberOfOrg(session.user.id, project.organizationId))) {
      return res.status(403).json({ error: "Not a member of this organization" });
    }
    return res.json(project);
  }

  /** Create a project in an organization (user must be member) */
  @Post("/")
  async create(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { name, slug, organizationId } = parsed.data;
    if (!(await isMemberOfOrg(session.user.id, organizationId))) {
      return res.status(403).json({ error: "Not a member of this organization" });
    }

    const existing = await prisma.project.findUnique({
      where: {
        organizationId_slug: { organizationId, slug },
      },
    });
    if (existing) {
      return res.status(409).json({ error: "A project with this slug already exists in this organization" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        userId: session.user.id,
        organizationId,
      },
      select: { id: true, name: true, slug: true },
    });
    return res.status(201).json(project);
  }

  /** Update a project (user must be member of project's org) */
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const project = await prisma.project.findFirst({
      where: { id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!(await isMemberOfOrg(session.user.id, project.organizationId))) {
      return res.status(403).json({ error: "Not a member of this organization" });
    }

    if (parsed.data.slug && parsed.data.slug !== project.slug) {
      const existing = await prisma.project.findUnique({
        where: {
          organizationId_slug: { organizationId: project.organizationId, slug: parsed.data.slug },
        },
      });
      if (existing) {
        return res.status(409).json({ error: "A project with this slug already exists in this organization" });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.slug && { slug: parsed.data.slug }),
      },
      select: { id: true, name: true, slug: true },
    });
    return res.json(updated);
  }

  /** Delete a project (user must be member of project's org) */
  @Delete("/:id")
  async delete(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const project = await prisma.project.findFirst({
      where: { id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!(await isMemberOfOrg(session.user.id, project.organizationId))) {
      return res.status(403).json({ error: "Not a member of this organization" });
    }

    await prisma.project.delete({ where: { id } });
    return res.status(204).send();
  }
}
