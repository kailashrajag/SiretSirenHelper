import { describe, expect, it } from "vitest";
import { clean, formatSiren, formatSiret, isValidSiren, isValidSiret, sirenFromSiret } from "./siret";

describe("siret/siren", () => {
    it("cleans input", () => expect(clean("732 829 320 00074")).toBe("73282932000074"));
    it("validates a real SIREN", () => expect(isValidSiren("732829320")).toBe(true));
    it("rejects a bad SIREN", () => {
        expect(isValidSiren("732829321")).toBe(false);
        expect(isValidSiren("12345")).toBe(false);
    });
    it("validates a real SIRET", () => expect(isValidSiret("73282932000074")).toBe(true));
    it("rejects a bad SIRET", () => expect(isValidSiret("73282932000075")).toBe(false));
    it("validates La Poste SIRET", () => expect(isValidSiret("35600000000029")).toBe(true));
    it("derives SIREN", () => expect(sirenFromSiret("73282932000074")).toBe("732829320"));
    it("formats", () => {
        expect(formatSiren("732829320")).toBe("732 829 320");
        expect(formatSiret("73282932000074")).toBe("732 829 320 00074");
    });
});
