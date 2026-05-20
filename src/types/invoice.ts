export type TradeTerm = 'CD' | 'BB' | 'SC'

export type PricingCurrency = 'USD' | 'BDT'

export type PackingMode = '60 KG Drum' | '120 KG Drum' | '30 KG Jar'

export type LcTerm =
  | 'At sight'
  | '60 Days Sight'
  | '90 Days Sight'
  | '120 Days Sight'

export interface LineItem {
  id: string
  productName: string
  hsCode: string
  packagingMode: PackingMode
  quantity: string
  rate: string
}

export interface InvoiceFormData {
  invoiceDate: string
  tradeTerm: TradeTerm
  pricingCurrency: PricingCurrency
  applicantName: string
  applicantFactory: string
  modeOfShipment: string
  placeOfLoading: string
  finalDestination: string
  termsOfPayment: string
  advisingBank: string
  accountNumber: string
  swiftCode: string
  bankAddress: string
  lcTerm: LcTerm
  lineItems: LineItem[]
}
