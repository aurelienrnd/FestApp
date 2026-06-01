/** Indicateur de chargement — texte "Chargement" centré avec une ligne bleue qui s'étend depuis le centre. */
export default function LoadingLine() {
  return (
    <div className="flex flex-col items-center gap-4 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75">
      <span className="uppercase tracking-widest text-sm">Chargement</span>
      <div
        className="w-full max-w-sm h-0.5 bg-(--color-3)"
        style={{ transformOrigin: "center", animation: "line-expand 1.8s ease-in-out infinite" }}
      />
    </div>
  );
}
