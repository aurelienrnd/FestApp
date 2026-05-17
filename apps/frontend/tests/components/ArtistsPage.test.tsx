import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/admin/artists/page";
import { useFetch } from "@/hooks/useFetch";

// next/navigation : mock de useRouter pour eviter les erreurs Next.js en jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// next/link : balise a standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// next/image : balise img standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock de useNavPath pour eviter les erreurs de navigation en jsdom
vi.mock("@/hooks/useNavPath", () => ({
  useNavPath: vi.fn().mockReturnValue({ isAdminPath: true, pathname: "/admin/artists" }),
}));

// mock de useRoleGuard : aucune redirection dans les tests
vi.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: vi.fn(),
}));

// mock de AddArtistModal : div identifiable pour verifier l'ouverture
vi.mock("@/components/modals/AddArtistModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Modale ajout artiste</div> : null,
}));

// mock de DeleteModal : non utilise dans ces tests
vi.mock("@/components/modals/DeleteModal", () => ({
  default: () => null,
}));

// artiste programmé le 21 mai
const mockArtistJour1 = {
  id: "uuid-1",
  name: "Artiste Jour 1",
  url_media: "/img/artiste1.webp",
  description_media: "Photo artiste 1",
  stage: "MainStage",
  start_time: "2027-05-21T20:00:00Z",
  is_featured: false,
};

// artiste programmé le 22 mai
const mockArtistJour2 = {
  id: "uuid-2",
  name: "Artiste Jour 2",
  url_media: "/img/artiste2.webp",
  description_media: "Photo artiste 2",
  stage: "MainStage",
  start_time: "2027-05-22T20:00:00Z",
  is_featured: false,
};

beforeEach(() => {
  vi.mocked(useFetch).mockReturnValue({
    data: { artists: [mockArtistJour1, mockArtistJour2] },
    isLoading: false,
    error: null,
  });
});

// ---------------------------------------------------------------------------

describe("ArtistsPage", () => {
  it("filtre les artistes par date apres clic sur un filtre de jour", async () => {
    const user = userEvent.setup();

    render(<Page />);

    // tous les artistes sont visibles par defaut
    expect(screen.getByText("Artiste Jour 1")).toBeInTheDocument();
    expect(screen.getByText("Artiste Jour 2")).toBeInTheDocument();

    // label du filtre genere depuis FESTIVAL_DAYS ("2027-05-21")
    const label21mai = new Date("2027-05-21").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });

    // clic sur le filtre du premier jour
    await user.click(screen.getByRole("button", { name: label21mai }));

    // seul l'artiste du 21 mai doit rester visible
    expect(screen.getByText("Artiste Jour 1")).toBeInTheDocument();
    expect(screen.queryByText("Artiste Jour 2")).not.toBeInTheDocument();
  });

  it("ouvre la modale d'ajout au clic sur le bouton dedie", async () => {
    const user = userEvent.setup();

    render(<Page />);

    await user.click(screen.getByRole("button", { name: "Ajouter un artiste" }));

    expect(screen.getByText("Modale ajout artiste")).toBeInTheDocument();
  });
});
