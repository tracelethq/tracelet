import "reflect-metadata";
import { Controller, Get, Req, Res } from "routing-controllers";
import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

@Controller("/organizations")
export class OrganizationsController {
  /** List organizations the current user is a member of (id, name, slug). */
  @Get("/")
  async list(@Req() req: Request, @Res() res: Response) {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const members = await prisma.member.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: { _count: { select: { members: true } } },
        },
      },
    });
    const orgs = members.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      createdAt: m.organization.createdAt,
      memberCount: m.organization._count.members,
    }));
    return res.json(orgs);
  }
}
