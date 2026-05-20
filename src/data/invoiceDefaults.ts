import type {
  InvoiceFormData,
  LcTerm,
  LineItem,
  PackingMode,
} from '../types/invoice'
import { createId, getTodayIso } from '../utils/invoice'

export const beneficiary = {
  name: 'Tusi Haytham Bio Limited',
  factory: 'Namila, Kapaleswar, Kapasia, Gazipur, Bangladesh',
  vatRegistrationNo: '001538096-0207',
}

export const defaultPlaceOfLoading =
  'Beneficiary Factory: Namila, Kapaleswar, Kapasia, Gazipur'

export const defaultTermsOfPayment = 'By Equivalent Letter of Credit'

export const packingModes: PackingMode[] = [
  '60 KG Drum',
  '120 KG Drum',
  '30 KG Jar',
]

export const lcTerms: LcTerm[] = [
  'At sight',
  '60 Days Sight',
  '90 Days Sight',
  '120 Days Sight',
]

export const createEmptyLineItem = (): LineItem => ({
  id: createId(),
  productName: '',
  hsCode: '',
  packagingMode: '30 KG Jar',
  quantity: '',
  rate: '',
})

export const createDefaultInvoiceData = (): InvoiceFormData => ({
  invoiceDate: getTodayIso(),
  tradeTerm: 'CD',
  pricingCurrency: 'BDT',
  applicantName: '',
  applicantFactory: '',
  modeOfShipment: 'By Truck',
  placeOfLoading: defaultPlaceOfLoading,
  finalDestination: '',
  termsOfPayment: defaultTermsOfPayment,
  advisingBank: '',
  accountNumber: '',
  swiftCode: '',
  bankAddress: '',
  lcTerm: '120 Days Sight',
  lineItems: [createEmptyLineItem()],
})
