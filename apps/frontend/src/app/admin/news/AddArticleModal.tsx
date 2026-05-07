"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useMutation } from "../../../hooks/useMutation";
import type { ArticleItem, CreateApiResponse } from "../../../type";

type AddArticleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleArticle: (article: ArticleItem) => void;
  articleToEdit?: ArticleItem | null;
};


/** Verifie si le formulaire de l'etape 1 est incomplet.
 * Retourne `true` si le titre est vide.
 * @param {string} title Titre de l'article
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
  if (descriptionMedia.trim() === "") return true;
  if (!isEditMode && image === null) return true;
  return false;
}

/** Affiche la modale d'ajout ou de modification d'un article en deux etapes.
 * Etape 1 : titre, contenu (optionnel), case is_published.
 * Etape 2 : description image, fichier image.
 * Soumet les donnees en multipart/form-data a POST /admin/articles ou PATCH /admin/articles/:id.
 * En mode edition (articleToEdit defini), pre-remplit les champs et conserve l'image existante si aucune nouvelle n'est choisie.
 * @param {AddArticleModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(article: ArticleItem) => void} props.handleArticle Met a jour la liste des articles et ferme la modale.
 * @param {ArticleItem | null} props.articleToEdit Article a modifier — pre-remplit le formulaire si defini.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddArticleModal({
  isOpen,
  onClose,
  handleArticle,
  articleToEdit = null,
}: AddArticleModalProps) {
  // Determine si on est en mode edition (articleToEdit defini) ou en mode creation (articleToEdit null)
  const isEditMode = articleToEdit !== null;

  // Controle de l'etape actuelle du formulaire (1 ou 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Champs de l'etape 1
  const [title, setTitle] = useState(articleToEdit?.title ?? "");
  const [content, setContent] = useState(articleToEdit?.content ?? "");
  const [isPublished, setIsPublished] = useState(
    articleToEdit?.is_published ?? false,
  );

  // Champs de l'etape 2
  const [descriptionMedia, setDescriptionMedia] = useState(
    articleToEdit?.description_media ?? "",
  );
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    articleToEdit?.url_media ?? null,
  );

  const { mutate, isLoading, error, reset } = useMutation<CreateApiResponse<{ article: ArticleItem }>>(
    isEditMode ? `/admin/articles/${articleToEdit!.id}` : "/admin/articles",
    isEditMode ? "PATCH" : "POST",
  );

  // Validation des formulaires des deux etapes
  const step1Invalid = isStep1Invalid(title);
  const step2Invalid = isStep2Invalid(descriptionMedia, image, isEditMode);

  // Reinitialise tous les champs et revient a l'etape 1
  const resetForm = () => {
    setStep(1);
    setTitle("");
    setContent("");
    setIsPublished(false);
    setDescriptionMedia("");
    setImage(null);
    if (previewUrl && !articleToEdit) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Ferme la modale et reinitialise le formulaire
  const handleClose = () => {
    reset();
    resetForm();
    onClose();
  };

  // Gere la selection du fichier image et met a jour la previsualisation
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    if (previewUrl && !articleToEdit) URL.revokeObjectURL(previewUrl);
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
      handleArticle(data.article);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Ajout article"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Article</h2>

      <div className="m-6">
        {step === 1 ? (
          <div key="step-1" className="form-modal">
            <div>
              <label htmlFor="articleTitle" className="sr-only">
                Titre de l&apos;article
              </label>
              <input
                id="articleTitle"
                name="title"
                type="text"
                placeholder="Titre de l'article"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="articleContent" className="sr-only">
                Contenu
              </label>
              <textarea
                id="articleContent"
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
                id="articleIsPublished"
                name="is_published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <label htmlFor="articleIsPublished">Publier l&apos;article</label>
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
              <label htmlFor="articleDescriptionMedia" className="sr-only">
                Description de l&apos;image
              </label>
              <input
                id="articleDescriptionMedia"
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
                id="articleImage"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Image de l'article"
                onChange={handleImageChange}
              />
              <label htmlFor="articleImage" className="upload-btn">
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
