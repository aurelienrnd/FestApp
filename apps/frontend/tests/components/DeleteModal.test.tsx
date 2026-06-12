import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteModal from "@/components/modals/DeleteModal";
import { useDelete } from "@/hooks/useDelete";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du hook useDelete pour controler handleDelete et reset dans chaque test
vi.mock("@/hooks/useDelete");

const mockHandleDelete = vi.fn();
const mockReset = vi.fn();

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useDelete).mockReturnValue({
    handleDelete: mockHandleDelete,
    isSubmitting: false,
    isDeleted: false,
    error: null,
    reset: mockReset,
  });
});

// element de test generique avec un id et un nom
const item = { id: "uuid-1", name: "Artiste Test" };

// ---------------------------------------------------------------------------

describe("DeleteModal", () => {
  it("un clic sur Confirmer appelle handleDelete et getLabel est utilise dans le texte", async () => {
    const user = userEvent.setup();

    render(
      <DeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        item={item}
        endpoint="/admin/artists"
        entityName="artiste"
        getLabel={(a) => a.name}
      />,
    );

    // getLabel doit etre utilise pour afficher le nom de l'element dans la question de confirmation
    expect(screen.getByText(/Artiste Test/)).toBeInTheDocument();

    // cliquer sur le bouton de confirmation
    await user.click(screen.getByText("Confirmer"));

    // handleDelete doit etre appele avec l'id de l'element et un callback
    expect(mockHandleDelete).toHaveBeenCalledWith("uuid-1", expect.any(Function));
  });

  it("affiche l'erreur retournee par l'API si la suppression echoue", () => {
    // si useDelete retourne une erreur, elle doit etre visible sous le bouton Confirmer
    vi.mocked(useDelete).mockReturnValue({
      handleDelete: mockHandleDelete,
      isSubmitting: false,
      isDeleted: false,
      error: "Erreur serveur, reessayez plus tard.",
      reset: mockReset,
    });

    render(
      <DeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        item={item}
        endpoint="/admin/artists"
        entityName="artiste"
        getLabel={(a) => a.name}
      />,
    );

    expect(
      screen.getByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });

  it("affiche un message de succes quand isDeleted est true", () => {
    // quand la suppression reussit, la modale bascule sur un ecran de confirmation
    vi.mocked(useDelete).mockReturnValue({
      handleDelete: mockHandleDelete,
      isSubmitting: false,
      isDeleted: true,
      error: null,
      reset: mockReset,
    });

    render(
      <DeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        item={item}
        endpoint="/admin/artists"
        entityName="artiste"
        getLabel={(a) => a.name}
      />,
    );

    // le message de succes doit remplacer le bouton Confirmer
    expect(screen.getByText(/a ete supprime/i)).toBeInTheDocument();
    expect(screen.queryByText("Confirmer")).not.toBeInTheDocument();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DeleteModal
        isOpen={true}
        onClose={onClose}
        onDeleted={vi.fn()}
        item={item}
        endpoint="/admin/artists"
        entityName="artiste"
        getLabel={(a) => a.name}
      />,
    );

    // cliquer sur le bouton de fermeture de la modale
    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    // onClose doit etre appele via handleClose qui appelle reset() puis onClose()
    expect(onClose).toHaveBeenCalled();
  });
});
