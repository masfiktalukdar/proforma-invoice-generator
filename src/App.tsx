import { useEffect, useMemo, useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import {
  createDefaultInvoiceData,
  createEmptyLineItem,
  lcTerms,
  packingModes,
} from "./data/invoiceDefaults";
import type {
  InvoiceFormData,
  LineItem,
  PricingCurrency,
  TradeTerm,
} from "./types/invoice";
import {
  calculateTotals,
  formatAmountInWords,
  getCurrencyInfo,
  getInvoiceNumber,
  STORAGE_KEY,
} from "./utils/invoice";
import "./App.css";

type ViewMode = "edit" | "preview";

const isTradeTerm = (value: unknown): value is TradeTerm => {
  return value === "CD" || value === "BB" || value === "SC";
};

const isPricingCurrency = (value: unknown): value is PricingCurrency => {
  return value === "USD" || value === "BDT";
};

const loadStoredData = (): InvoiceFormData => {
  const defaults = createDefaultInvoiceData();

  if (typeof window === "undefined") {
    return defaults;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<InvoiceFormData>;
    const lineItems =
      Array.isArray(parsed.lineItems) && parsed.lineItems.length
        ? parsed.lineItems.map((item) => ({
            id:
              typeof item.id === "string" ? item.id : createEmptyLineItem().id,
            productName:
              typeof item.productName === "string" ? item.productName : "",
            hsCode: typeof item.hsCode === "string" ? item.hsCode : "",
            packagingMode: packingModes.includes(
              item.packagingMode as LineItem["packagingMode"],
            )
              ? (item.packagingMode as LineItem["packagingMode"])
              : "30 KG Jar",
            quantity: typeof item.quantity === "string" ? item.quantity : "",
            rate: typeof item.rate === "string" ? item.rate : "",
          }))
        : defaults.lineItems;

    return {
      ...defaults,
      ...parsed,
      tradeTerm: isTradeTerm(parsed.tradeTerm)
        ? parsed.tradeTerm
        : defaults.tradeTerm,
      pricingCurrency: isPricingCurrency(parsed.pricingCurrency)
        ? parsed.pricingCurrency
        : defaults.pricingCurrency,
      lcTerm: lcTerms.includes(parsed.lcTerm as InvoiceFormData["lcTerm"])
        ? (parsed.lcTerm as InvoiceFormData["lcTerm"])
        : defaults.lcTerm,
      lineItems,
    };
  } catch {
    return defaults;
  }
};

function App() {
  const [data, setData] = useState<InvoiceFormData>(() => loadStoredData());
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const currencyInfo = useMemo(
    () => getCurrencyInfo(data.pricingCurrency),
    [data.pricingCurrency],
  );
  const totals = useMemo(
    () => calculateTotals(data.lineItems),
    [data.lineItems],
  );
  const invoiceNumber = useMemo(
    () => getInvoiceNumber(data.invoiceDate, data.tradeTerm),
    [data.invoiceDate, data.tradeTerm],
  );
  const amountInWords = useMemo(
    () => formatAmountInWords(totals.totalAmount, currencyInfo),
    [totals.totalAmount, currencyInfo],
  );

  const updateField = <K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K],
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLineItem = <K extends keyof LineItem>(
    id: string,
    field: K,
    value: LineItem[K],
  ) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => {
      if (prev.lineItems.length === 1) {
        return {
          ...prev,
          lineItems: [createEmptyLineItem()],
        };
      }

      return {
        ...prev,
        lineItems: prev.lineItems.filter((item) => item.id !== id),
      };
    });
  };

  const resetForm = () => {
    const defaults = createDefaultInvoiceData();
    setData(defaults);
    localStorage.removeItem(STORAGE_KEY);
    setViewMode("edit");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Proforma Invoice Builder</h1>
        <div className="header-actions">
          {viewMode === "edit" ? (
            <>
              <button type="button" className="ghost" onClick={resetForm}>
                Reset
              </button>
              <span className="status-pill">Editing</span>
            </>
          ) : null}
        </div>
      </header>

      {viewMode === "edit" ? (
        <InvoiceForm
          data={data}
          currencyCode={currencyInfo.code}
          currencySymbol={currencyInfo.symbol}
          invoiceNumber={invoiceNumber}
          totals={totals}
          amountInWords={amountInWords}
          onFieldChange={updateField}
          onLineItemChange={updateLineItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onCreate={() => setViewMode("preview")}
          onReset={resetForm}
        />
      ) : (
        <InvoicePreview
          data={data}
          invoiceNumber={invoiceNumber}
          onBackToEdit={() => setViewMode("edit")}
        />
      )}
    </div>
  );
}

export default App;
