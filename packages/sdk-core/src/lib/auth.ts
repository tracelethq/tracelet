import jwt from "jsonwebtoken";
import { getEnv } from "./env";

const DEFAULT_EXPIRES_IN = "7d";

export interface AuthOptions {
  /** JWT signing secret. Defaults to TRACELET_DOC_JWT_SECRET, then TRACELET_DOC_PASSWORD. */
  jwtSecret?: string;
  /** JWT expiration (e.g. "7d", "24h"). Defaults to "7d". */
  expiresIn?: string;
}

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export class Auth {
  private readonly username: string;
  private readonly password: string;
  private readonly jwtSecret: string;
  private readonly expiresIn: string;

  constructor(options: AuthOptions = {}) {
    const TRACELET_DOC_USERNAME = getEnv("TRACELET_DOC_USERNAME");
    const TRACELET_DOC_PASSWORD = getEnv("TRACELET_DOC_PASSWORD");
    this.username = TRACELET_DOC_USERNAME ?? "";
    this.password = TRACELET_DOC_PASSWORD ?? "";
    this.jwtSecret =
      options.jwtSecret ??
      getEnv("TRACELET_DOC_JWT_SECRET") ??
      this.password ??
      "";
    this.expiresIn = options.expiresIn ?? getEnv("TRACELET_DOC_JWT_EXPIRES_IN") ?? DEFAULT_EXPIRES_IN;
  }

  isAuthRequired(): boolean {
    return this.username !== "" && this.password !== "";
  }

  authenticate(username: string, password: string): boolean {
    return username === this.username && password === this.password;
  }

  /**
   * Create a JWT for the given username after successful authenticate().
   * Payload includes sub (username) and exp.
   */
  createToken(username: string): string {
    if (!this.jwtSecret) {
      throw new Error("Auth: JWT secret is not set. Set TRACELET_DOC_JWT_SECRET or TRACELET_DOC_PASSWORD.");
    }
    return jwt.sign(
      { sub: username } as JwtPayload,
      this.jwtSecret,
      { expiresIn: this.expiresIn }
    );
  }

  /**
   * Verify a JWT and return the payload (sub = username), or null if invalid/expired.
   */
  verifyToken(token: string): JwtPayload | null {
    if (!this.jwtSecret || !token) return null;
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return payload?.sub != null ? payload : null;
    } catch {
      return null;
    }
  }

  /**
   * Extract Bearer token from Authorization header (e.g. "Bearer <token>").
   * Returns null if missing or not Bearer.
   */
  getTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || typeof authHeader !== "string") return null;
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
    return parts[1] || null;
  }

  /**
   * Verify the Authorization header and return the JWT payload (username) or null.
   */
  verifyRequest(authHeader: string | undefined): JwtPayload | null {
    const token = this.getTokenFromHeader(authHeader);
    return token ? this.verifyToken(token) : null;
  }
}

export function createAuth(options?: AuthOptions): Auth {
  return new Auth(options);
}
