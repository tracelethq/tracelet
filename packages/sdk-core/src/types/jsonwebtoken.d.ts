declare module "jsonwebtoken" {
  export function sign(
    payload: object,
    secret: string,
    options?: { expiresIn?: string }
  ): string;

  export function verify(token: string, secret: string): object;
}
