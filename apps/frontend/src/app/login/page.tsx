"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isFormInvalid = email.trim() === "" || password.trim() === "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormInvalid) {
      return;
    }

    // TODO: brancher la requete de connexion ici
    console.log({ email, password });
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

        <div className="flex justify-center pt-2">
          <button type="submit" className="btn-cta" disabled={isFormInvalid}>
            Envoyer
          </button>
        </div>
      </form>

      <button className="mt-10 btn-type-2">Mot de passe oublie</button>
    </section>
  );
}
