import Link from "next/link";

/** Page 404 — affichée quand une route est introuvable ou quand notFound() est appelé.
 * Composant serveur rendu dans le layout racine, thème visiteur appliqué manuellement.
 */
export default function NotFound() {
  return (
    <div
      data-theme="visitor"
      className="app-root min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center"
    >
      <p className="text-8xl md:text-[12rem] font-black text-(--color-1) leading-none">
        404
      </p>

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest">
          Page introuvable
        </h1>
        <p className="text-sm md:text-base text-(--color-text)/60 max-w-sm">
          La page que tu cherches n&apos;existe pas ou a été déplacée.
        </p>
      </div>

      <Link href="/" className="btn-cta px-6 py-3 text-sm uppercase tracking-widest">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
