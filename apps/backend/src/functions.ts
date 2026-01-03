import type { StringValue } from "ms";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { serialize } from "cookie";
import type { DbUser } from "./type.ts";

export function getEnv(name: string): string {
  const variables = process.env[name];
  if (!variables) throw new Error(`Missing env var: ${name}`);
  return variables;
}

export function envToString(name: string): StringValue | number {
  const value = getEnv(name);
  if (!/^\d+(\s?[a-zA-Z]+)?$/.test(value)) {
    throw new Error(`Invalid duration for ${name}`);
  }
  return value as StringValue;
}

export function userExists(user: DbUser | undefined) {
  if (!user) {
    const message: string = "email ou mot de passe incorrect";
    throw new Error("email ou mot de passe incorrect");
  }
}

export function passwordIsValid(password: string, passwordHash: string) {
  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) {
    throw new Error("email ou mot de passe incorrect");
  }
}

export function initToken(
  user: DbUser,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string,
): string {
  return jwt.sign({ sub: user.id, role: "admin" }, getEnv(JWT_SECRET), {
    expiresIn: envToString(JWT_EXPIRES_IN), // jwt ne peut recevoir que des string ou number et non des Environment Variable
  });
}

export function serializeCookie(
  EnvName: string,
  envSecure: string,
  envSameSite: string,
  token: string,
  time: number,
): string {
  const cookieName = getEnv(EnvName);
  const secure = getEnv(envSecure) === "true"; // oblige le cookie à être transmis uniquement via HTTPS, cookie doit recevoir un boolean
  const sameSite = getEnv(envSameSite) as "lax" | "strict" | "none"; // definit la politique SameSite pour le cookie

  return serialize(cookieName, token, {
    httpOnly: true, // empêche l'accès au cookie via JavaScript côté client, réduisant les risques de vol de cookie via des attaques XSS
    secure,
    sameSite,
    path: "/", // rend le cookie accessible sur l'ensemble du site
    maxAge: time, // durée de vie du cookie en secondes (ici 1 heure)
  });
}
