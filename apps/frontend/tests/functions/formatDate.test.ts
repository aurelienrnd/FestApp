import { formatDateLong, formatConcertDatetime } from "@/functions/formatDate";

// ---------------------------------------------------------------------------

describe("formatDateLong", () => {
  it("retourne une date en francais long", () => {
    // la date ISO doit etre formatee en jour numerique + mois long + annee
    const result = formatDateLong("2026-05-09T00:00:00Z");

    expect(result).toMatch(/9/);
    expect(result).toMatch(/mai/i);
    expect(result).toMatch(/2026/);
  });
});

// ---------------------------------------------------------------------------

describe("formatConcertDatetime", () => {
  it("retourne un objet avec date et time separes", () => {
    // la date et l'heure du concert doivent etre separees dans deux proprietes distinctes
    const result = formatConcertDatetime("2025-08-01T20:00:00Z");

    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("time");
    expect(typeof result.date).toBe("string");
    expect(typeof result.time).toBe("string");
  });

  it("retourne l'heure au format HH:MM", () => {
    // le champ time doit etre au format deux chiffres : deux chiffres
    const result = formatConcertDatetime("2025-08-01T20:00:00Z");

    expect(result.time).toMatch(/^\d{2}:\d{2}$/);
  });
});
