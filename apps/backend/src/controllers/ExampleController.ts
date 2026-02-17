import "reflect-metadata";
import { Controller, Post, Body, Res } from "routing-controllers";
import type { Response } from "express";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

@Controller("/")
export class ExampleController {
  @Post("/example")
  create(@Body() body: unknown, @Res() res: Response) {
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }
    return res.status(201).json({
      message: "Created",
      data: parsed.data,
    });
  }
}
