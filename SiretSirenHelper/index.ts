import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { clean, formatSiren, formatSiret, isValidSiren, isValidSiret, sirenFromSiret, siretFromSirenNic } from "./siret";

export class SiretSirenHelper implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private notify!: () => void;
    private root!: HTMLDivElement;
    private input!: HTMLInputElement;
    private badge!: HTMLSpanElement;
    private nicRow!: HTMLDivElement;
    private nic!: HTMLInputElement;
    private resultRow!: HTMLDivElement;
    private resultText!: HTMLSpanElement;
    private copyBtn!: HTMLButtonElement;
    private hint!: HTMLDivElement;

    private value = "";
    private derived = "";
    private forcedMode = "Auto";

    public init(
        _context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.notify = notifyOutputChanged;
        this.root = document.createElement("div");
        this.root.className = "ssh-root";

        const row = document.createElement("div");
        row.className = "ssh-row";
        this.input = document.createElement("input");
        this.input.className = "ssh-input";
        this.input.type = "text";
        this.input.inputMode = "numeric";
        this.input.maxLength = 20;
        this.input.placeholder = "SIRET (14 digits) or SIREN (9 digits)";
        this.input.addEventListener("input", () => {
            this.recompute();
            this.notify();
        });
        this.badge = document.createElement("span");
        this.badge.className = "ssh-badge";
        row.append(this.input, this.badge);

        this.nicRow = document.createElement("div");
        this.nicRow.className = "ssh-row";
        const nicLabel = document.createElement("span");
        nicLabel.className = "ssh-hint";
        nicLabel.textContent = "NIC (5 digits):";
        this.nic = document.createElement("input");
        this.nic.className = "ssh-input ssh-nic";
        this.nic.type = "text";
        this.nic.inputMode = "numeric";
        this.nic.maxLength = 5;
        this.nic.addEventListener("input", () => this.recompute());
        this.nicRow.append(nicLabel, this.nic);

        this.resultRow = document.createElement("div");
        this.resultRow.className = "ssh-row";
        this.resultText = document.createElement("span");
        this.resultText.className = "ssh-derived";
        this.copyBtn = document.createElement("button");
        this.copyBtn.type = "button";
        this.copyBtn.className = "ssh-btn";
        this.copyBtn.textContent = "Copy";
        this.copyBtn.addEventListener("click", () => {
            void navigator.clipboard?.writeText(this.derived);
        });
        this.resultRow.append(this.resultText, this.copyBtn);

        this.hint = document.createElement("div");
        this.hint.className = "ssh-hint";

        this.root.append(row, this.nicRow, this.resultRow, this.hint);
        container.appendChild(this.root);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const raw = context.parameters.value.raw ?? "";
        if (clean(raw) !== clean(this.input.value)) {
            this.input.value = raw;
        }
        this.forcedMode = ({ "1": "SIRET", "2": "SIREN" } as Record<string, string>)[String(context.parameters.mode?.raw)] ?? "Auto";
        const disabled = context.mode.isControlDisabled;
        this.input.disabled = disabled;
        this.nic.disabled = disabled;
        this.recompute();
    }

    private detectMode(digits: string): "siret" | "siren" {
        if (this.forcedMode === "SIRET") return "siret";
        if (this.forcedMode === "SIREN") return "siren";
        return digits.length > 9 ? "siret" : "siren";
    }

    private recompute(): void {
        const digits = clean(this.input.value);
        this.value = digits;
        const mode = this.detectMode(digits);
        let valid = false;
        let derived = "";
        let shown = "";
        let hint = "";

        if (mode === "siret") {
            valid = isValidSiret(digits);
            this.nicRow.style.display = "none";
            if (valid) {
                derived = sirenFromSiret(digits);
                shown = `SIREN: ${formatSiren(derived)}`;
            } else if (digits.length === 14) {
                hint = "Checksum invalid: check the SIRET.";
            } else if (digits.length > 0) {
                hint = "A SIRET has 14 digits.";
            }
        } else {
            valid = isValidSiren(digits);
            this.nicRow.style.display = valid ? "flex" : "none";
            const nic = clean(this.nic.value);
            if (valid && nic.length === 5) {
                const siret = siretFromSirenNic(digits, nic);
                if (isValidSiret(siret)) {
                    derived = siret;
                    shown = `SIRET: ${formatSiret(siret)}`;
                } else {
                    hint = "SIREN + NIC is not a valid SIRET.";
                }
            } else if (valid) {
                hint = "A SIRET depends on the establishment: enter its NIC to build it.";
            } else if (digits.length === 9) {
                hint = "Checksum invalid: check the SIREN.";
            } else if (digits.length > 0) {
                hint = "A SIREN has 9 digits.";
            }
        }

        const full = mode === "siret" ? 14 : 9;
        if (digits.length === 0) {
            this.badge.textContent = "";
            this.badge.className = "ssh-badge";
        } else if (digits.length < full) {
            this.badge.textContent = "Incomplete";
            this.badge.className = "ssh-badge ssh-ko";
        } else {
            this.badge.textContent = valid ? "Valid" : "Invalid";
            this.badge.className = `ssh-badge ${valid ? "ssh-ok" : "ssh-ko"}`;
        }

        this.resultText.textContent = shown;
        this.resultRow.style.display = derived ? "flex" : "none";
        this.hint.textContent = hint;

        if (derived !== this.derived) {
            this.derived = derived;
            this.notify();
        }
    }

    public getOutputs(): IOutputs {
        const outputs: IOutputs = { value: this.value };
        if (this.derived) outputs.derivedValue = this.derived;
        return outputs;
    }

    public destroy(): void {
        this.root.remove();
    }
}

