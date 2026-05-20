import { useRef, useState } from "react";
import { beneficiary } from "../data/invoiceDefaults";
import type { InvoiceFormData } from "../types/invoice";
import {
  calculateLineAmount,
  calculateTotals,
  formatAmountInWords,
  formatInvoiceDate,
  formatNumber,
  getCurrencyInfo,
} from "../utils/invoice";

interface InvoicePreviewProps {
  data: InvoiceFormData;
  invoiceNumber: string;
  onBackToEdit: () => void;
}

export const InvoicePreview = ({
  data,
  invoiceNumber,
  onBackToEdit,
}: InvoicePreviewProps) => {
  const invoiceSheetRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const currencyInfo = getCurrencyInfo(data.pricingCurrency);
  const formattedDate = formatInvoiceDate(data.invoiceDate);
  const lineAmounts = data.lineItems.map(calculateLineAmount);
  const totals = calculateTotals(data.lineItems);
  const totalQuantity = totals.totalQuantity;
  const totalAmount = totals.totalAmount;
  const amountInWords = formatAmountInWords(totalAmount, currencyInfo);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const sheet = invoiceSheetRef.current;
    if (!sheet || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(sheet, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        useCORS: true,
      });

      const pageWidth = 210;
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const pdfHeight = Math.max(imageHeight, 20);
      const imageData = canvas.toDataURL("image/jpeg", 0.82);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pageWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(imageData, "JPEG", 0, 0, imageWidth, imageHeight);

      const fileName = `proforma-invoice-${invoiceNumber
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()}.pdf`;

      pdf.save(fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const terms = [
    `The above price is valid for Back To Back L/C ${data.lcTerm}.`,
    "L/C must be valid up to 65 days for shipment and 55 days from the date of shipment for negotiation.",
    "Partial shipment will be allowed.",
    'L/C is to be unrestricted for negotiation and must mention "Upon negotiation/at maturity we authorize you to claim reimburse from (Insert respective reimbursing bank name and address)".',
    "Charges relating to reimbursement/discrepancy or any bank charges, if any to be on account of the opener & UD must be Issued.",
    "Payment to be made in US Dollar through Bangladesh Bank.",
    "L/C must bear Chemical VAT registration No. of buyer (A mandatory condition of customs).",
    "Master L/C No. & Date, Export L/C No. & Date to be mentioned in BTB L/C.",
    "All Terms & Conditions of this Performa Invoice deemed to be an integral part of the L/C.",
    "Overdue Interest to be paid @ 16% from the date of maturity till payment made.",
    "This PI is valid for 21 days only.",
    "+/- 2% weight is acceptable.",
    "For Any natural disturbance or any cause if the delivery delay, then company will not be responsible.",
  ];

  return (
    <div className="invoice-preview">
      <div className="preview-toolbar">
        <button type="button" className="ghost" onClick={onBackToEdit}>
          Back to Edit
        </button>
        <div className="preview-toolbar-actions">
          <button type="button" className="primary" onClick={handlePrint}>
            Print
          </button>
          <button type="button" className="secondary" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      <div className="invoice-sheet" ref={invoiceSheetRef}>
        <div className="invoice-title">Proforma Invoice</div>

        <div className="invoice-top">
          <div className="invoice-block">
            <div className="invoice-label">Beneficiary:</div>
            <div className="invoice-value strong">{beneficiary.name}</div>
            <div className="invoice-line">
              <span className="invoice-key">Factory</span> :{" "}
              {beneficiary.factory}
            </div>
            <div className="invoice-line">
              <span className="invoice-key">Vat Registration No</span> :{" "}
              {beneficiary.vatRegistrationNo}
            </div>
          </div>
          <div className="invoice-block">
            <div className="invoice-label">Proforma Invoice No & Date :</div>
            <div className="invoice-line">{invoiceNumber}</div>
            <div className="invoice-line">{formattedDate}</div>
          </div>
        </div>

        <div className="invoice-top">
          <div className="invoice-block">
            <div className="invoice-label">Applicant:</div>
            <div className="invoice-value strong">
              {data.applicantName || "-"}
            </div>
            <div className="invoice-line">{data.applicantFactory || "-"}</div>
          </div>
          <div className="invoice-block">
            <div className="invoice-kv">
              <span>Mode of Shipment</span>
              <span>: {data.modeOfShipment || "-"}</span>
            </div>
            <div className="invoice-kv">
              <span>Place of Loading</span>
              <span>: {data.placeOfLoading || "-"}</span>
            </div>
            <div className="invoice-kv">
              <span>Final Destination</span>
              <span>: {data.finalDestination || "-"}</span>
            </div>
          </div>
        </div>

        <div className="invoice-section">Description of Goods</div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Sl</th>
              <th>Products</th>
              <th>HS Code</th>
              <th>Packing Mode</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate ({currencyInfo.symbol})</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.productName || "-"}</td>
                <td>{item.hsCode || "-"}</td>
                <td>{item.packagingMode}</td>
                <td className="align-right">
                  {formatNumber(Number(item.quantity || 0))}
                </td>
                <td>kg</td>
                <td className="align-right">
                  {currencyInfo.symbol}{" "}
                  {formatNumber(Number(item.rate || 0), 4)}
                </td>
                <td className="align-right">
                  {currencyInfo.symbol} {formatNumber(lineAmounts[index])}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="total-label">
                Total:
              </td>
              <td className="align-right">{formatNumber(totalQuantity)}</td>
              <td></td>
              <td></td>
              <td className="align-right">
                {currencyInfo.symbol} {formatNumber(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="invoice-amount">
          <strong>Amount in words:</strong> {amountInWords}
        </div>
        <div className="invoice-amount">
          <strong>Total Invoice Value:</strong> {amountInWords}
        </div>

        <div className="invoice-bank">
          <div className="invoice-block">
            <div className="invoice-kv">
              <span>Advising Bank</span>
              <span>: {data.advisingBank || "-"}</span>
            </div>
            <div className="invoice-kv">
              <span>Account Number</span>
              <span>: {data.accountNumber || "-"}</span>
            </div>
            <div className="invoice-kv">
              <span>Swift Code</span>
              <span>: {data.swiftCode || "-"}</span>
            </div>
            <div className="invoice-kv">
              <span>Address</span>
              <span>: {data.bankAddress || "-"}</span>
            </div>
          </div>
          <div className="invoice-block">
            <div className="invoice-kv">
              <span>Terms of Payment</span>
              <span>: {data.termsOfPayment || "-"}</span>
            </div>
          </div>
        </div>

        <div className="invoice-section">Terms and Conditions:</div>
        <ol className="terms-list">
          {terms.map((term, index) => (
            <li
              key={term}
            >{`${String(index + 1).padStart(2, "0")}. ${term}`}</li>
          ))}
        </ol>

        <div className="invoice-signature">
          <div className="signature-line"></div>
          <div>Authorized signature</div>
          <div className="signature-company">For Tusi Haytham Bio Limited</div>
        </div>
      </div>
    </div>
  );
};
