import { useState, type FormEvent } from "react";
//TODO - SRONLY ?

/** Affiche un formulaire de contact avec les champs nom, email, sujet et message */
export default function ContactUs() {
  // Stockent l’état d’envoi du formulaire et les valeurs des champs
  const [isSubmit, setIsSubmit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Vérifie que tous les champs contiennent du texte valide
  const isFormInvalid =
    name.trim() === "" ||
    email.trim() === "" ||
    subject.trim() === "" ||
    message.trim() === "";

  // Empêche le rechargement, valide le formulaire puis log les champs
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isFormInvalid) {
      return;
    }

    console.log({ name, email, subject, message });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setIsSubmit(true);
  };

  return (
    <div className="m-(--spacing-container-modal)">
      {isSubmit ? (
        <p className="mt-4 text-center">votres message est envoyer</p>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div className="flex justify-center pt-1">
            <button type="submit" className="btn-cta" disabled={isFormInvalid}>
              Envoyer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
