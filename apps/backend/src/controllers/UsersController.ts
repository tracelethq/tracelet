import "reflect-metadata";
import { Controller, Get, Req, Res } from "routing-controllers";
import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

@Controller("/")
export class UsersController {
  @Get("/me")
  async me(@Req() req: Request, @Res() res: Response) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json(session);
  }
}
