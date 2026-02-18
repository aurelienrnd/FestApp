export default function ContactUs() {
  return (
    <div className="m-(--spacing-container-modal)">
      <form className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="sr-only">
              Nom Prénom
            </label>
            <input
              id="contactName"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Nom Prenom"
              className="input"
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
          />
        </div>

        <div className="flex justify-center pt-1">
          <button type="submit" className="btn-cta">
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
