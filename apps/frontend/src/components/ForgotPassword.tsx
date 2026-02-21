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
      <p className="mt-(--spacing-paraf-modal) text-center">
        Nous vous enverrons un nouveau mot de passe sur votre boite mail
      </p>

      <form className="form-modal" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgotPasswordEmail" className="sr-only">
            Votre email
          </label>
          <input
            id="forgotPasswordEmail"
            name="forgotPasswordEmail"
            type="email"
            autoComplete="email"
            placeholder="Votre email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="submit-modal-area">
          <button type="submit" className="btn-cta" disabled={isFormInvalid}>
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}

