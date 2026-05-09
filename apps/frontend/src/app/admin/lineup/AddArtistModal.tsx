"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useMutation } from "../../../hooks/useMutation";
import type { ArtistItem, CreateApiResponse } from "../../../type";
import { FESTIVAL_DAYS } from "../../../config/festival";

type AddArtistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleArtist: (artist: ArtistItem) => void;
  artistToEdit?: ArtistItem | null;
};


const YOUTUBE_REGEX = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//;
const SPOTIFY_REGEX = /^https?:\/\/open\.spotify\.com\//;

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

/** Affiche la modale d'ajout ou de modification d'un artiste en trois etapes.
 * Etape 1 : nom, genre, origine, bio, liens YouTube et Spotify (optionnels). Etape 2 : description image, fichier image. Etape 3 : scene, heure de debut et de fin, case "Publier sur la page d'accueil".
 * Soumet les donnees en multipart/form-data a POST /admin/artists ou PATCH /admin/artists/:id.
 * En mode edition (artistToEdit defini), pre-remplit les champs et affiche "Modifier" a la place de "Ajouter".
 * @param {AddArtistModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(artist: ArtistItem) => void} props.handleArtist Met a jour la liste des artistes et ferme la modale.
 * @param {ArtistItem | null} props.artistToEdit Artiste a modifier — pre-remplit le formulaire si defini.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddArtistModal({
  isOpen,
  onClose,
  handleArtist,
  artistToEdit = null,
}: AddArtistModalProps) {
  const isEditMode = artistToEdit !== null;

  // Calcul des valeurs initiales depuis artistToEdit en mode edition
  const initialStart = artistToEdit?.start_time
    ? new Date(artistToEdit.start_time)
    : null;

  // Etape active de la modal
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Champs de l'etape 1
  const [name, setName] = useState(artistToEdit?.name ?? "");
  const [genre, setGenre] = useState(artistToEdit?.genre ?? "");
  const [origin, setOrigin] = useState(artistToEdit?.origin ?? "");
  const [bio, setBio] = useState(artistToEdit?.bio ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(artistToEdit?.youtube_url ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(artistToEdit?.spotify_url ?? "");
  const [isFeatured, setIsFeatured] = useState(
    artistToEdit?.is_featured ?? false,
  );

  // Champs de l'etape 2
  const [descriptionMedia, setDescriptionMedia] = useState(
    artistToEdit?.description_media ?? "",
  );
  const [image, setImage] = useState<File | null>(null);

  // Champs de l'etape 3
  const [stage, setStage] = useState(artistToEdit?.stage ?? "");
  const [date, setDate] = useState(
    initialStart ? initialStart.toISOString().slice(0, 10) : "",
  );
  const [startTime, setStartTime] = useState(
    initialStart ? initialStart.toTimeString().slice(0, 5) : "",
  );
  const [endTime, setEndTime] = useState(
    // Si l'heure de fin est inferieure a l'heure de debut, le concert passe minuit — endTime est le lendemains du date selectionnee
    artistToEdit?.end_time
      ? new Date(artistToEdit.end_time).toTimeString().slice(0, 5)
      : "",
  );

  // URL de previsualisation de l'image selectionnee
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    artistToEdit?.url_media ?? null,
  );

  // Erreurs de validation des URLs (etape 1)
  const [youtubeUrlError, setYoutubeUrlError] = useState<string | null>(null);
  const [spotifyUrlError, setSpotifyUrlError] = useState<string | null>(null);

  // Reinitialise les champs avec les valeurs de l'artiste a modifier a chaque ouverture de la modale
  useEffect(() => {
    if (!isOpen) return;
    const start = artistToEdit?.start_time
      ? new Date(artistToEdit.start_time)
      : null;
    setStep(1);
    setName(artistToEdit?.name ?? "");
    setGenre(artistToEdit?.genre ?? "");
    setOrigin(artistToEdit?.origin ?? "");
    setBio(artistToEdit?.bio ?? "");
    setYoutubeUrl(artistToEdit?.youtube_url ?? "");
    setSpotifyUrl(artistToEdit?.spotify_url ?? "");
    setYoutubeUrlError(null);
    setSpotifyUrlError(null);
    setIsFeatured(artistToEdit?.is_featured ?? false);
    setDescriptionMedia(artistToEdit?.description_media ?? "");
    setStage(artistToEdit?.stage ?? "");
    setDate(start ? start.toISOString().slice(0, 10) : "");
    setStartTime(start ? start.toTimeString().slice(0, 5) : "");
    setEndTime(
      artistToEdit?.end_time
        ? new Date(artistToEdit.end_time).toTimeString().slice(0, 5)
        : "",
    );
    setImage(null);
    setPreviewUrl(artistToEdit?.url_media ?? null);
  }, [isOpen, artistToEdit]);

  const { mutate, isLoading, error, reset } = useMutation<CreateApiResponse<{ artist: ArtistItem }>>(
    isEditMode ? `/admin/artists/${artistToEdit!.id}` : "/admin/artists",
    isEditMode ? "PATCH" : "POST",
  );

  const step1Invalid = isStep1Invalid(name, genre, origin, bio);
  // En mode edition, l'image est optionnelle (on conserve l'existante si aucune nouvelle n'est choisie)
  const step2Invalid = isEditMode
    ? descriptionMedia.trim() === ""
    : isStep2Invalid(descriptionMedia, image);
  const step3Invalid = isStep3Invalid(stage, date, startTime, endTime);

  // Reinitialise tous les champs et revient a l'etape 1
  const resetForm = () => {
    setStep(1);
    setName("");
    setGenre("");
    setOrigin("");
    setBio("");
    setYoutubeUrl("");
    setSpotifyUrl("");
    setYoutubeUrlError(null);
    setSpotifyUrlError(null);
    setDescriptionMedia("");
    setStage("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setIsFeatured(false);
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  /** Valide les URLs YouTube et Spotify avant de passer a l'etape 2.
   * Affiche un message d'erreur sous le champ concerne si le domaine est invalide.
   */
  const handleStep1Next = () => {
    let hasError = false;
    if (youtubeUrl && !YOUTUBE_REGEX.test(youtubeUrl)) {
      setYoutubeUrlError(
        "Le lien doit provenir de YouTube (youtube.com ou youtu.be).",
      );
      hasError = true;
    } else {
      setYoutubeUrlError(null);
    }
    if (spotifyUrl && !SPOTIFY_REGEX.test(spotifyUrl)) {
      setSpotifyUrlError(
        "Le lien doit provenir de Spotify (open.spotify.com).",
      );
      hasError = true;
    } else {
      setSpotifyUrlError(null);
    }
    if (!hasError) setStep(2);
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    reset();
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

    // Construit le FormData pour l'envoi multipart/form-data (requis par multer)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("genre", genre);
    formData.append("origin", origin);
    formData.append("bio", bio);

    formData.append("description_media", descriptionMedia);
    if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
    if (spotifyUrl) formData.append("spotify_url", spotifyUrl);
    // en mode edition, l'image n'est ajoutee que si une nouvelle a ete selectionnee
    if (image !== null) formData.append("image", image);
    formData.append("stage", stage);

    // Si l'heure de fin est inferieure a l'heure de debut, le concert passe minuit — end_time est le lendemains du date selectionnee
    const endDate =
      endTime < startTime
        ? new Date(new Date(date).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
        : date;

    formData.append(
      "start_time",
      new Date(`${date}T${startTime}`).toISOString(),
    );

    formData.append(
      "end_time",
      new Date(`${endDate}T${endTime}`).toISOString(),
    );
    formData.append("is_featured", String(isFeatured));

    mutate(formData, (data) => {
      resetForm();
      handleArtist(data.artist);
    });
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

      <div className="m-6">
        {step === 1 ? (
          <div key="step-1" className="form-modal">
            <div className="form-grid">
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

            <div className="form-grid">
              <div>
                <label htmlFor="artistYoutubeUrl" className="sr-only">
                  Lien YouTube
                </label>
                <input
                  id="artistYoutubeUrl"
                  name="youtube_url"
                  type="url"
                  placeholder="Lien YouTube (optionnel)"
                  className="input"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setYoutubeUrlError(null);
                  }}
                />
                {youtubeUrlError ? (
                  <p className="error-message">{youtubeUrlError}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="artistSpotifyUrl" className="sr-only">
                  Lien Spotify
                </label>
                <input
                  id="artistSpotifyUrl"
                  name="spotify_url"
                  type="url"
                  placeholder="Lien Spotify (optionnel)"
                  className="input"
                  value={spotifyUrl}
                  onChange={(e) => {
                    setSpotifyUrl(e.target.value);
                    setSpotifyUrlError(null);
                  }}
                />
                {spotifyUrlError ? (
                  <p className="error-message">{spotifyUrlError}</p>
                ) : null}
              </div>
            </div>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                disabled={step1Invalid}
                onClick={handleStep1Next}
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
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Previsualisation"
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
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
                className="btn-action"
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
            <div className="form-grid">
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
                <select
                  id="artistDate"
                  name="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  <option value="">-- Choisir un jour --</option>
                  {FESTIVAL_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
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
            </div>

            <div className="flex items-center gap-2">
              <input
                id="artistIsFeatured"
                name="is_featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="artistIsFeatured">
                Publier sur la page d&apos;accueil
              </label>
            </div>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-action"
                onClick={() => setStep(2)}
              >
                Retour
              </button>
              <button
                type="submit"
                className="btn-cta"
                disabled={step3Invalid || isLoading}
              >
                {isEditMode ? "Modifier" : "Ajouter"}
              </button>
            </div>

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
