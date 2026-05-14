"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Modal from "react-modal";
import ModalCloseButton from "../ModalCloseButton";
import { useMutation } from "../../hooks/useMutation";
import type { NewsItem, CreateApiResponse } from "../../type";
import { isEmpty } from "../../functions/validation";

type AddNewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleNews: (news: NewsItem) => void;
  newsToEdit?: NewsItem | null;
};


/** Verifie si le formulaire de l'etape 1 est incomplet.
 * Retourne `true` si le titre est vide.
 * @param {string} title Titre de la news
 */
function isStep1Invalid(title: string) {
  return title.trim().length < 2;
}

/** Verifie si le formulaire de l'etape 2 est incomplet.
 * En mode edition, l'image est optionnelle.
 * @param {string} descriptionMedia Texte alternatif de l'image
 * @param {File | null} image Fichier image
 * @param {boolean} isEditMode Mode edition — l'image existante est conservee si aucune nouvelle n'est choisie
 */
function isStep2Invalid(
  descriptionMedia: string,
  image: File | null,
  isEditMode: boolean,
) {
  if (isEmpty(descriptionMedia)) return true;
  if (!isEditMode && image === null) return true;
  return false;
}

/** Affiche la modale d'ajout ou de modification d'une news en deux etapes.
 * Etape 1 : titre, contenu (optionnel), case is_published.
 * Etape 2 : description image, fichier image.
 * Soumet les donnees en multipart/form-data a POST /admin/news ou PATCH /admin/news/:id.
 * En mode edition (newsToEdit defini), pre-remplit les champs et conserve l'image existante si aucune nouvelle n'est choisie.
 * @param {AddNewsModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(news: NewsItem) => void} props.handleNews Met a jour la liste des news et ferme la modale.
 * @param {NewsItem | null} props.newsToEdit News a modifier — pre-remplit le formulaire si defini.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddNewsModal({
  isOpen,
  onClose,
  handleNews,
  newsToEdit = null,
}: AddNewsModalProps) {
  // Determine si on est en mode edition (newsToEdit defini) ou en mode creation (newsToEdit null)
  const isEditMode = newsToEdit !== null;

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState(newsToEdit?.title ?? "");
  const [content, setContent] = useState(newsToEdit?.content ?? "");
  const [isPublished, setIsPublished] = useState(newsToEdit?.is_published ?? false);
  const [descriptionMedia, setDescriptionMedia] = useState(newsToEdit?.description_media ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(newsToEdit?.url_media ?? null);

  // Revoque l'URL blob quand previewUrl change ou que le composant est demonte
  useEffect(() => {
    if (!previewUrl || isEditMode) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl, isEditMode]);

  const { mutate, isLoading, error, reset } = useMutation<CreateApiResponse<{ news: NewsItem }>>(
    isEditMode ? `/admin/news/${newsToEdit!.id}` : "/admin/news",
    isEditMode ? "PATCH" : "POST",
  );

  // Validation des formulaires des deux etapes
  const step1Invalid = isStep1Invalid(title);
  const step2Invalid = isStep2Invalid(descriptionMedia, image, isEditMode);

  const resetForm = () => {
    setStep(1);
    setTitle(newsToEdit?.title ?? "");
    setContent(newsToEdit?.content ?? "");
    setIsPublished(newsToEdit?.is_published ?? false);
    setDescriptionMedia(newsToEdit?.description_media ?? "");
    setImage(null);
    setPreviewUrl(newsToEdit?.url_media ?? null);
  };

  const handleClose = () => {
    reset();
    resetForm();
    onClose();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // Soumet les donnees du formulaire a l'API et traite la reponse
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Empêche la soumission normale du formulaire
    event.preventDefault();
    if (step2Invalid) return;

    // Construction du payload multipart/form-data
    const formData = new FormData();
    formData.append("title", title);
    if (content) formData.append("content", content);
    formData.append("is_published", String(isPublished));
    formData.append("description_media", descriptionMedia);
    if (image !== null) formData.append("image", image);

    mutate(formData, (data) => {
      resetForm();
      handleNews(data.news);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Ajout news"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">News</h2>

      <div className="m-6">
        {step === 1 ? (
          <div key="step-1" className="form-modal">
            <div>
              <label htmlFor="newsTitle" className="sr-only">
                Titre de la news
              </label>
              <input
                id="newsTitle"
                name="title"
                type="text"
                placeholder="Titre de la news"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="newsContent" className="sr-only">
                Contenu
              </label>
              <textarea
                id="newsContent"
                name="content"
                placeholder="Contenu (optionnel)"
                className="input"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="newsIsPublished"
                name="is_published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <label htmlFor="newsIsPublished">Publier la news</label>
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
          <form key="step-2" className="form-modal" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newsDescriptionMedia" className="sr-only">
                Description de l&apos;image
              </label>
              <input
                id="newsDescriptionMedia"
                name="description_media"
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
                id="newsImage"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Image de la news"
                onChange={handleImageChange}
              />
              <label htmlFor="newsImage" className="upload-btn">
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
                type="submit"
                className="btn-cta"
                disabled={step2Invalid || isLoading}
              >
                {isEditMode ? "Modifier" : "Ajouter"}
              </button>
            </div>

            {error ? (
              <p className="error-message">{error}</p>
            ) : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
