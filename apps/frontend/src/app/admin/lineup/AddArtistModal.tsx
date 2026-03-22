"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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

/** Verifie si le formulaire de la partie 1 est incomplet.
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

/** Verifie si le formulaire de la partie 2 est incomplet.
 * Retourne `true` si au moins un champ requis est vide ou absent.
 * @param {string} descriptionMedia Texte alternatif de l'image
 * @param {File | null} image Fichier image
 */
function isStep2Invalid(descriptionMedia: string, image: File | null) {
  return descriptionMedia.trim() === "" || image === null;
}

/** Affiche la modale d'ajout d'un artiste en deux etapes.
 * Etape 1 : nom, genre, origine. Etape 2 : bio, description image, fichier image.
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
  const [step, setStep] = useState<1 | 2>(1);

  // Champs de l'etape 1
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [origin, setOrigin] = useState("");

  // Champs de l'etape 2
  const [bio, setBio] = useState("");
  const [descriptionMedia, setDescriptionMedia] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // URL de previsualisation de l'image selectionnee
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Gestion des erreurs et du chargement
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Genere une URL de previsualisation quand l'image change et libere l'ancienne
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const step1Invalid = isStep1Invalid(name, genre, origin, bio);
  const step2Invalid = isStep2Invalid(descriptionMedia, image);

  // Reinitialise tous les champs et revient a l'etape 1
  const resetForm = () => {
    setStep(1);
    setName("");
    setGenre("");
    setOrigin("");
    setBio("");
    setDescriptionMedia("");
    setImage(null);
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    resetForm();
    onClose();
  };

  // Gere la selection du fichier image
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.files?.[0] ?? null);
  };

  // Gere la soumission du formulaire d'ajout d'artiste
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step2Invalid) return;

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

    const result = await apiRequest<CreateArtistApiResponse>("/admin/artists", {
      method: "POST",
      body: formData,
    });

    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    handleArtist(result.data.artist);
    resetForm();
    setIsLoading(false);
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
          <div className="form-modal">
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
        ) : (
          <form className="form-modal" onSubmit={handleSubmit}>
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

            <div>
              <label htmlFor="artistImage" className="sr-only">
                Photo de l&apos;artiste
              </label>
              <input
                id="artistImage"
                name="image"
                type="file"
                accept="image/*"
                className="input"
                onChange={handleImageChange}
              />
            </div>

            {previewUrl ? (
              <div className="flex justify-center">
                <Image
                  src={previewUrl}
                  alt="Previsualisation"
                  width={320}
                  height={200}
                  className="card-media-img"
                />
              </div>
            ) : null}

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-type-2 rounded-md border border-(--color-text-input) p-(--space-xs)"
                onClick={() => setStep(1)}
              >
                Retour
              </button>
              <button
                type="submit"
                className="btn-cta"
                disabled={step2Invalid || isLoading}
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
