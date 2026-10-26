# SIRET / SIREN Helper (PCF)

A Power Apps component for model-driven app forms that validates French **SIRET** (14 digits) and **SIREN** (9 digits) numbers. It runs fully offline, with no API, no Power Automate and no premium licence.

## Features
- Validates the Luhn checksum, including the La Poste exception (SIREN 356000000).
- **SIRET → SIREN**: shows the SIREN (first 9 digits) with a Copy button.
- **SIREN → SIRET**: enter the establishment NIC (5 digits) to build and validate the SIRET.
- Optional second bound field (`derivedValue`) that receives the derived value, so it is saved to Dataverse.
- `mode` input: Auto (detected by length), SIRET or SIREN.

A SIREN alone cannot give a SIRET, because a company has one SIRET per establishment. That is why the NIC is needed.

## Develop
```
npm install --legacy-peer-deps
npm test
npm run build
npm start watch
```

## Package as a solution
```
mkdir Solution; cd Solution
pac solution init --publisher-name <name> --publisher-prefix <prefix>
pac solution add-reference --path ..
dotnet build --configuration Release
```
Import `Solution\bin\Release\Solution.zip` in make.powerapps.com.

## Use
Form designer → select a text column (SIRET or SIREN) → Components → add **SIRET / SIREN Helper**. Optionally bind `Derived value` to another text column.

## Downloadable view
Create a view with the filter `SIRET contains data` AND `SIREN contains data`, add the key columns, then use **Export to Excel**.
