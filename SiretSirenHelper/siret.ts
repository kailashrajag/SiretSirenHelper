export const clean = (v: string | null | undefined): string => (v ?? "").replace(/\D/g, "");

export function luhn(digits: string): boolean {
    if (!/^\d+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = Number(digits[digits.length - 1 - i]);
        if (i % 2 === 1) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0;
}

export function isValidSiren(v: string): boolean {
    return /^\d{9}$/.test(v) && luhn(v);
}

// La Poste establishments (SIREN 356000000) do not follow Luhn: digit sum must be a multiple of 5
export function isValidSiret(v: string): boolean {
    if (!/^\d{14}$/.test(v)) return false;
    if (v.startsWith("356000000")) {
        return [...v].reduce((s, c) => s + Number(c), 0) % 5 === 0;
    }
    return luhn(v);
}

export function sirenFromSiret(siret: string): string {
    return siret.substring(0, 9);
}

export function siretFromSirenNic(siren: string, nic: string): string {
    return siren + nic;
}

export const formatSiren = (v: string): string => v.replace(/^(\d{0,3})(\d{0,3})(\d{0,3}).*$/, "$1 $2 $3").trim().replace(/\s+/g, " ");

export const formatSiret = (v: string): string =>
    `${formatSiren(v.substring(0, 9))} ${v.substring(9, 14)}`.trim();
