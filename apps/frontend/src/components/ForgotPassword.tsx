import { useState, type FormEvent } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const isFormInvalid = email.trim() === "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormInvalid) {
      return;
    }
  };

  return (
    <div className="m-(--spacing-container-modal)">
      <p className="mt-4 text-center text-sm">
        Nous vous enverrons un nouveau mot de passe sur votre boite mail
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgotPasswordEmail" className="sr-only">
            Votre email
          </label>
          <input
            id="dEmail"
            name="Email"
            type="email"
            autoComplete="email"
            placeholder="Votre email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="flex justify-center pt-1">
          <button type="submit" className="btn-cta" disabled={isFormInvalid}>
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
