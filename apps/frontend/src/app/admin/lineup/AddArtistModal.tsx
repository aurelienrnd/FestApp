"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import type { ArtistListRow } from "../../../types";

type AddArtistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleArtist: (artist: ArtistListRow) => void;
};

type CreateArtistApiResponse = {
  message: string;
  artist: ArtistListRow;
};

/** Verifie si le formulaire de l'etape 1 est incomplet.
 * Retourne `true` si au moins un champ requis est vide.
 * @param {string} name Nom de l'artiste
 * @param {string} genre Genre musical
 * @param {string} origin Origine geographique
 * @param {string} bio Biographie de l'artiste
 */
function isStep1Invalid(
  name: string,
  genre: string,
  origin: string,
  bio: string,
) {
  return (
    name.trim() === "" ||
    genre.trim() === "" ||
    origin.trim() === "" ||
    bio.trim() === ""
  );
}

/** Verifie si le formulaire de l'etape 2 est incomplet.
 * Retourne `true` si au moins un champ requis est vide ou absent.
 * @param {string} descriptionMedia Texte alternatif de l'image
 * @param {File | null} image Fichier image
 */
function isStep2Invalid(descriptionMedia: string, image: File | null) {
  return descriptionMedia.trim() === "" || image === null;
}

/** Verifie si le formulaire de l'etape 3 est incomplet.
 * Retourne `true` si au moins un champ requis est vide.
 * @param {string} stage Nom de la scene
 * @param {string} date Date du concert
 * @param {string} startTime Heure de debut
 * @param {string} endTime Heure de fin
 */
function isStep3Invalid(
  stage: string,
  date: string,
  startTime: string,
  endTime: string,
) {
  return (
    stage.trim() === "" || date === "" || startTime === "" || endTime === ""
  );
}

/** Affiche la modale d'ajout d'un artiste en trois etapes.
 * Etape 1 : nom, genre, origine, bio. Etape 2 : description image, fichier image. Etape 3 : scene, heure de debut et de fin.
 * Soumet les donnees en multipart/form-data a POST /admin/artists.
 * @param {AddArtistModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(artist: ArtistListRow) => void} props.handleArtist Met a jour la liste des artistes et ferme la modale.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddArtistModal({
  isOpen,
  onClose,
  handleArtist,
}: AddArtistModalProps) {
  // Etape active de la modal
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Champs de l'etape 1
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [origin, setOrigin] = useState("");
  const [bio, setBio] = useState("");

  // Champs de l'etape 2
  const [descriptionMedia, setDescriptionMedia] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Champs de l'etape 3
  const [stage, setStage] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // URL de previsualisation de l'image selectionnee
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Gestion des erreurs et du chargement
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const step1Invalid = isStep1Invalid(name, genre, origin, bio);
  const step2Invalid = isStep2Invalid(descriptionMedia, image);
  const step3Invalid = isStep3Invalid(stage, date, startTime, endTime);

  // Reinitialise tous les champs et revient a l'etape 1
  const resetForm = () => {
    setStep(1);
    setName("");
    setGenre("");
    setOrigin("");
    setBio("");
    setDescriptionMedia("");
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStage("");
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    resetForm();
    onClose();
  };

  // Gere la selection du fichier image et met a jour la previsualisation
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // Gere la soumission du formulaire d'ajout d'artiste
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step3Invalid) return;

    setIsLoading(true);
    setError(null);

    // Construit le FormData pour l'envoi multipart/form-data (requis par multer)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("genre", genre);
    formData.append("origin", origin);
    formData.append("bio", bio);
    formData.append("description_media", descriptionMedia);
    formData.append("image", image as File);
    formData.append("stage", stage);
    formData.append(
      "start_time",
      new Date(`${date}T${startTime}`).toISOString(),
    );
    formData.append("end_time", new Date(`${date}T${endTime}`).toISOString());

    const result = await apiRequest<CreateArtistApiResponse>("/admin/artists", {
      method: "POST",
      body: formData,
    });

    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    resetForm();
    setIsLoading(false);
    handleArtist(result.data.artist);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Ajout artiste"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Artiste</h2>

      <div className="m-(--space-md)">
        {step === 1 ? (
          <div key="step-1" className="form-modal">
            <div>
              <label htmlFor="artistName" className="sr-only">
                Nom de l&apos;artiste
              </label>
              <input
                id="artistName"
                name="name"
                type="text"
                placeholder="Nom de l'artiste"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistGenre" className="sr-only">
                Genre musical
              </label>
              <input
                id="artistGenre"
                name="genre"
                type="text"
                placeholder="Genre musical"
                className="input"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistOrigin" className="sr-only">
                Origine
              </label>
              <input
                id="artistOrigin"
                name="origin"
                type="text"
                placeholder="Origine (pays / ville)"
                className="input"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistBio" className="sr-only">
                Biographie
              </label>
              <textarea
                id="artistBio"
                name="bio"
                placeholder="Biographie"
                className="input"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                disabled={step1Invalid}
                onClick={() => setStep(2)}
              >
                Suivant
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div key="step-2" className="form-modal">
            <div>
              <label htmlFor="artistDescriptionMedia" className="sr-only">
                Description de l&apos;image
              </label>
              <input
                id="artistDescriptionMedia"
                name="descriptionMedia"
                type="text"
                placeholder="Description de l'image (texte alternatif)"
                className="input"
                value={descriptionMedia}
                onChange={(e) => setDescriptionMedia(e.target.value)}
              />
            </div>

            <div className="upload-zone">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Previsualisation"
                  width={320}
                  height={200}
                  className="card-media-img"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-(--color-text-input)"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
              <input
                id="artistImage"
                name="image"
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Photo de l'artiste"
                onChange={handleImageChange}
              />
              <label htmlFor="artistImage" className="upload-btn">
                + Ajouter photo
              </label>
              <p className="text-xs text-(--color-text-input)">
                jpg, png, webp : 5mo max
              </p>
            </div>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-type-2 rounded-md border border-(--color-text-input) p-(--space-xs)"
                onClick={() => setStep(1)}
              >
                Retour
              </button>
              <button
                type="button"
                className="btn-cta"
                disabled={step2Invalid}
                onClick={() => setStep(3)}
              >
                Suivant
              </button>
            </div>
          </div>
        ) : (
          <form key="step-3" className="form-modal" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="artistStage" className="sr-only">
                Scène
              </label>
              <input
                id="artistStage"
                name="stage"
                type="text"
                placeholder="Nom de la scène"
                className="input"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistDate" className="sr-only">
                Date du concert
              </label>
              <input
                id="artistDate"
                name="date"
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistStartTime" className="sr-only">
                Heure de début
              </label>
              <input
                id="artistStartTime"
                name="start_time"
                type="time"
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artistEndTime" className="sr-only">
                Heure de fin
              </label>
              <input
                id="artistEndTime"
                name="end_time"
                type="time"
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-type-2 rounded-md border border-(--color-text-input) p-(--space-xs)"
                onClick={() => setStep(2)}
              >
                Retour
              </button>
              <button
                type="submit"
                className="btn-cta"
                disabled={step3Invalid || isLoading}
              >
                Ajouter
              </button>
            </div>

            {error ? (
              <p className="text-center text-(--color-1)">{error}</p>
            ) : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
