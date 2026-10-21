# Shanmukha Technologies — Expo 54

Dummy-data React Native billing + inventory app.

## Rules implemented

- Admin creates customer and assigns business type.
- Customer does not select business type.
- Inventory items are admin-provided only.
- There is no Add Inventory Item screen.
- Inventory keeps Reserve Stock / Live Stock / Transfer Stock flow.
- Customer can add Raw Materials.
- Raw Materials are for expenditure/usage only; they are NOT used in billing.
- Raw Material usage reduces Live Stock and creates usage/expense history.
- Billing uses Inventory Items only.
- Discount can be percentage or amount.
- GST and net amount are shown.
- Print / Share / PDF buttons are UI-only placeholders for now.
- No backend/API is required.

## Run

```bash
npm install
npx expo start -c
```

For Android:

```bash
npm run android
```

Expo SDK 54 targets React Native 0.81 and React 19.1.
