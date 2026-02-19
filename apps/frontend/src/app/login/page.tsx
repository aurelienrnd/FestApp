"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type ApiError = { error: string };

type ApiRequestResult<T> = {
  data: T | null;
  error: ApiError | null;
};

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiRequestResult<T>> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: { error: payload?.error ?? "Donnees invalides" },
      };
    }

    return { data: payload as T, error: null };
  } catch (error) {
    console.error("request error", error);
    return { data: null, error: { error: "login request error" } };
  }
}

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  const isFormInvalid = email.trim() === "" || password.trim() === "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isFormInvalid) {
      return;
    }

    const result = await apiRequest<{
      message?: string;
      userSession?: unknown;
    }>("/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <section className="section-page flex flex-col items-center justify-center">
      <h1 className="text-center text-6xl font-black uppercase md:text-8xl">
        Connexion
      </h1>

      <form className="mt-12 w-full max-w-lg space-y-8" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginEmail" className="sr-only">
            Votre email
          </label>
          <input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Votre email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="loginPassword" className="sr-only">
            Votre mot de passe
          </label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          {error ? (
            <p className="mb-3 text-sm text-(--collor-1)">{error.error}</p>
          ) : null}
          <button type="submit" className="btn-cta" disabled={isFormInvalid}>
            Envoyer
          </button>
        </div>
      </form>

      <button className="mt-10 btn-type-2">Mot de passe oublie</button>
    </section>
  );
}
