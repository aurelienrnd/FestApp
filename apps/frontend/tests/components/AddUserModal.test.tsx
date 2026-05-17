import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddUserModal from "@/app/admin/users/AddUserModal";
import { useMutation } from "@/hooks/useMutation";
import type { UserItem } from "@/type";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du hook useMutation pour controler mutate et error dans chaque test
vi.mock("@/hooks/useMutation");

const mockMutate = vi.fn();
const mockReset = vi.fn();

// utilisateur existant utilise pour tester le mode edition
const mockUserToEdit: UserItem = {
  id: "uuid-1",
  email: "jean.dupont@test.com",
  display_name: "Jean Dupont",
  role: "news",
  created_at: "2025-01-01T00:00:00Z",
  password_changed_at: null,
};

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useMutation).mockReturnValue({
    mutate: mockMutate,
    isLoading: false,
    error: null,
    reset: mockReset,
  });
});

// ---------------------------------------------------------------------------

describe("AddUserModal", () => {
  it("desactive le bouton 'Ajouter' si les champs requis sont vides", () => {
    // prenom, nom, email et role sont tous requis pour soumettre
    render(
      <AddUserModal isOpen={true} onClose={vi.fn()} handleUserSaved={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddUserModal isOpen={true} onClose={onClose} handleUserSaved={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("splittes display_name en prenom et nom en mode edition", () => {
    // "Jean Dupont" doit etre decoupe en firstName="Jean" et lastName="Dupont"
    render(
      <AddUserModal
        isOpen={true}
        onClose={vi.fn()}
        handleUserSaved={vi.fn()}
        userToEdit={mockUserToEdit}
      />,
    );

    expect(screen.getByDisplayValue("Jean")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dupont")).toBeInTheDocument();
  });

  it("affiche l'erreur retournee par l'API", () => {
    // l'erreur renvoyee par useMutation doit etre visible sous le bouton
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: "Email deja utilise.",
      reset: mockReset,
    });

    render(
      <AddUserModal isOpen={true} onClose={vi.fn()} handleUserSaved={vi.fn()} />,
    );

    expect(screen.getByText("Email deja utilise.")).toBeInTheDocument();
  });
});
