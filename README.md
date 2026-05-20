# Proforma Invoice Generator

A React and TypeScript app for building proforma invoices with a clean, white-themed layout. The form autosaves to local storage and generates a print-ready invoice preview that matches the provided format.

## Features

- Dynamic invoice number with auto-updating year and delivery term
- CD, BB, and SC delivery term support with currency switching
- Editable line items with H.S Code, packaging mode, quantity, and rate
- Auto-calculated totals and amount-in-words conversion
- Local autosave to prevent data loss on refresh

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Customize

- Update beneficiary details in src/data/invoiceDefaults.ts
- Adjust invoice styling in src/App.css and src/index.css
