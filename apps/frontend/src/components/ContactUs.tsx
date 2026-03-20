import { useState, type FormEvent } from "react";

// TODO requet
/** Affiche un formulaire de contact avec les champs nom, email, sujet et message */
export default function ContactUs() {
  // Champs du formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Etats de gestion de la soumission
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verifie que tous les champs contiennent du texte valide
  const isFormInvalid =
    name.trim() === "" ||
    email.trim() === "" ||
    subject.trim() === "" ||
    message.trim() === "";

  // Empeche le rechargement, valide le formulaire puis reinitialise les champs
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isFormInvalid) {
      return;
    }

    setIsLoading(true);

    // TODO requet
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setIsLoading(false);
    setSuccess(true);
  };

  return (
    <div className="m-(--space-md)">
      {success ? (
        <p className="mt-(--spacing-paragraph) text-center">
          votre message est envoye
        </p>
      ) : (
        <form className="form-modal" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-(--space-md) md:grid-cols-2">
            <div>
              <label htmlFor="contactName" className="sr-only">
                Nom Prenom
              </label>
              <input
                id="contactName"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nom Prenom"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="sr-only">
                Votre email
              </label>
              <input
                id="contactEmail"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Votre email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="contactSubject" className="sr-only">
              Sujet
            </label>
            <input
              id="contactSubject"
              name="subject"
              type="text"
              placeholder="Sujet"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contactMessage" className="sr-only">
              Message
            </label>
            <textarea
              id="contactMessage"
              name="message"
              placeholder="Tapez votre texte ici"
              className="text-area"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <div className="submit-modal-area">
            <button type="submit" className="btn-cta" disabled={isFormInvalid || isLoading}>
              Envoyer
            </button>
          </div>
          {error ? (
            <p className="text-center text-(--color-1)">{error}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
