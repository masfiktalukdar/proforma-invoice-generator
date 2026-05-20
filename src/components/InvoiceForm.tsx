import type { FormEvent } from "react";
import type {
  InvoiceFormData,
  LineItem,
  LcTerm,
  TradeTerm,
} from "../types/invoice";
import { lcTerms, packingModes } from "../data/invoiceDefaults";
import { calculateLineAmount, formatNumber } from "../utils/invoice";

type UpdateField = <K extends keyof InvoiceFormData>(
  field: K,
  value: InvoiceFormData[K],
) => void;

type UpdateLineItem = <K extends keyof LineItem>(
  id: string,
  field: K,
  value: LineItem[K],
) => void;

interface InvoiceFormProps {
  data: InvoiceFormData;
  currencyCode: string;
  currencySymbol: string;
  invoiceNumber: string;
  totals: {
    totalQuantity: number;
    totalAmount: number;
  };
  amountInWords: string;
  onFieldChange: UpdateField;
  onLineItemChange: UpdateLineItem;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onCreate: () => void;
  onReset: () => void;
}

export const InvoiceForm = ({
  data,
  currencyCode,
  currencySymbol,
  invoiceNumber,
  totals,
  amountInWords,
  onFieldChange,
  onLineItemChange,
  onAddItem,
  onRemoveItem,
  onCreate,
  onReset,
}: InvoiceFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate();
  };

  return (
    <div className="editor">
      <form className="form-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="section-title">
            <h2>Invoice Settings</h2>
            <p>Invoice number is generated from the date and delivery term.</p>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Invoice Date</span>
              <input
                type="date"
                value={data.invoiceDate}
                onChange={(event) =>
                  onFieldChange("invoiceDate", event.target.value)
                }
                required
              />
            </label>
            <label className="field">
              <span>Delivery Term</span>
              <select
                value={data.tradeTerm}
                onChange={(event) =>
                  onFieldChange("tradeTerm", event.target.value as TradeTerm)
                }
              >
                <option value="CD">CD - Cash Delivery</option>
                <option value="BB">BB</option>
                <option value="SC">SC</option>
              </select>
            </label>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Mode of Shipment</span>
              <input
                type="text"
                value={data.modeOfShipment}
                onChange={(event) =>
                  onFieldChange("modeOfShipment", event.target.value)
                }
                placeholder="By Truck"
              />
            </label>
            <label className="field">
              <span>Pricing Currency</span>
              <select
                value={data.pricingCurrency}
                onChange={(event) =>
                  onFieldChange(
                    "pricingCurrency",
                    event.target.value as InvoiceFormData["pricingCurrency"],
                  )
                }
              >
                <option value="USD">USD ($)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </label>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Place of Loading</span>
              <input
                type="text"
                value={data.placeOfLoading}
                onChange={(event) =>
                  onFieldChange("placeOfLoading", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Final Destination</span>
              <input
                type="text"
                value={data.finalDestination}
                onChange={(event) =>
                  onFieldChange("finalDestination", event.target.value)
                }
                placeholder="Applicant's Factory"
              />
            </label>
          </div>
          <div className="inline-note">Invoice No: {invoiceNumber}</div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <h2>Applicant Details</h2>
            <p>These details are saved locally and auto-filled on reload.</p>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Applicant Name</span>
              <input
                type="text"
                value={data.applicantName}
                onChange={(event) =>
                  onFieldChange("applicantName", event.target.value)
                }
                placeholder="Applicant Name"
                required
              />
            </label>
            <label className="field">
              <span>Applicant Factory</span>
              <input
                type="text"
                value={data.applicantFactory}
                onChange={(event) =>
                  onFieldChange("applicantFactory", event.target.value)
                }
                placeholder="Factory Address"
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <h2>Description of Goods</h2>
            <p>Each product line uses its own H.S Code number.</p>
          </div>
          <div className="table-wrap">
            <table className="line-items">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Product Name</th>
                  <th>H.S Code</th>
                  <th>Packing Mode</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate / kg ({currencySymbol})</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => {
                  const amount = calculateLineAmount(item);
                  return (
                    <tr key={item.id}>
                      <td data-label="SL">{index + 1}</td>
                      <td data-label="Product Name">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(event) =>
                            onLineItemChange(
                              item.id,
                              "productName",
                              event.target.value,
                            )
                          }
                          placeholder="Product Name"
                          required
                        />
                      </td>
                      <td data-label="H.S Code">
                        <input
                          type="text"
                          value={item.hsCode}
                          onChange={(event) =>
                            onLineItemChange(
                              item.id,
                              "hsCode",
                              event.target.value,
                            )
                          }
                          placeholder="H.S Code"
                          required
                        />
                      </td>
                      <td data-label="Packing Mode">
                        <select
                          value={item.packagingMode}
                          onChange={(event) =>
                            onLineItemChange(
                              item.id,
                              "packagingMode",
                              event.target.value as LineItem["packagingMode"],
                            )
                          }
                        >
                          {packingModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Qty">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(event) =>
                            onLineItemChange(
                              item.id,
                              "quantity",
                              event.target.value,
                            )
                          }
                          placeholder="0.00"
                        />
                      </td>
                      <td data-label="Unit" className="unit-cell">
                        kg
                      </td>
                      <td data-label={`Rate / kg (${currencySymbol})`}>
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={item.rate}
                          onChange={(event) =>
                            onLineItemChange(
                              item.id,
                              "rate",
                              event.target.value,
                            )
                          }
                          placeholder={`Rate (${currencySymbol})`}
                        />
                      </td>
                      <td data-label="Amount" className="amount-cell">
                        {formatNumber(amount)}
                      </td>
                      <td data-label="Action" className="action-cell">
                        <button
                          type="button"
                          className="icon-button delete-button"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="line-items-footer">
            <button type="button" className="secondary" onClick={onAddItem}>
              Add Item
            </button>
            <div className="totals">
              <div>
                <span>Total Quantity</span>
                <strong>{formatNumber(totals.totalQuantity)}</strong>
              </div>
              <div>
                <span>Total Amount</span>
                <strong>
                  {currencySymbol} {formatNumber(totals.totalAmount)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <h2>Bank and Payment</h2>
            <p>These details appear in the invoice bank section.</p>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Terms of Payment</span>
              <input
                type="text"
                value={data.termsOfPayment}
                onChange={(event) =>
                  onFieldChange("termsOfPayment", event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Advising Bank</span>
              <input
                type="text"
                value={data.advisingBank}
                onChange={(event) =>
                  onFieldChange("advisingBank", event.target.value)
                }
                placeholder="Bank Name"
              />
            </label>
            <label className="field">
              <span>Account Number</span>
              <input
                type="text"
                value={data.accountNumber}
                onChange={(event) =>
                  onFieldChange("accountNumber", event.target.value)
                }
                placeholder="Account Number"
              />
            </label>
            <label className="field">
              <span>Swift Code</span>
              <input
                type="text"
                value={data.swiftCode}
                onChange={(event) =>
                  onFieldChange("swiftCode", event.target.value)
                }
                placeholder="Swift Code"
              />
            </label>
          </div>
          <label className="field">
            <span>Bank Address</span>
            <textarea
              rows={2}
              value={data.bankAddress}
              onChange={(event) =>
                onFieldChange("bankAddress", event.target.value)
              }
              placeholder="Bank Address"
            />
          </label>
        </section>

        <section className="form-section">
          <div className="section-title">
            <h2>Terms and Conditions</h2>
            <p>Condition 01 uses the selected L/C option.</p>
          </div>
          <label className="field">
            <span>L/C Term for Condition 01</span>
            <select
              value={data.lcTerm}
              onChange={(event) =>
                onFieldChange("lcTerm", event.target.value as LcTerm)
              }
            >
              {lcTerms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="form-actions">
          <button type="button" className="ghost" onClick={onReset}>
            Reset Form
          </button>
          <button type="submit" className="primary">
            Create Invoice
          </button>
        </div>
      </form>

      <aside className="summary-card">
        <div className="summary-header">
          <h3>Invoice Summary</h3>
          <span className="summary-pill">Autosaved</span>
        </div>
        <div className="summary-row">
          <span>Invoice No</span>
          <strong>{invoiceNumber}</strong>
        </div>
        <div className="summary-row">
          <span>Currency</span>
          <strong>
            {currencyCode} ({currencySymbol})
          </strong>
        </div>
        <div className="summary-row">
          <span>Total Quantity</span>
          <strong>{formatNumber(totals.totalQuantity)}</strong>
        </div>
        <div className="summary-row">
          <span>Total Amount</span>
          <strong>
            {currencySymbol} {formatNumber(totals.totalAmount)}
          </strong>
        </div>
        <div className="summary-words">Amount in words: {amountInWords}</div>
        <div className="summary-note">
          Your form values are saved locally to prevent accidental loss.
        </div>
      </aside>
    </div>
  );
};
