import type { LineItem, PricingCurrency, TradeTerm } from '../types/invoice'

export type CurrencyCode = PricingCurrency

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  majorUnit: string
  minorUnit: string
}

export const STORAGE_KEY = 'proforma-invoice-form-v1'

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const getTodayIso = (): string => {
  return new Date().toISOString().slice(0, 10)
}

export const getInvoiceNumber = (
  invoiceDate: string,
  tradeTerm: TradeTerm
): string => {
  const safeDate = invoiceDate ? new Date(invoiceDate) : new Date()
  const year = Number.isNaN(safeDate.getTime())
    ? new Date().getFullYear()
    : safeDate.getFullYear()
  const previousYear = year - 1

  return `TUBC/AUX/${year}/${tradeTerm}/${previousYear}`
}

export const formatInvoiceDate = (invoiceDate: string): string => {
  if (!invoiceDate) {
    return ''
  }

  const date = new Date(invoiceDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const formatted = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return formatted.replace(/ /g, '-')
}

export const getCurrencyInfo = (currency: PricingCurrency): CurrencyInfo => {
  if (currency === 'BDT') {
    return {
      code: 'BDT',
      symbol: '৳',
      majorUnit: 'Taka',
      minorUnit: 'Paisa',
    }
  }

  return {
    code: 'USD',
    symbol: '$',
    majorUnit: 'US Dollar',
    minorUnit: 'Cents',
  }
}

export const parseNumber = (value: string): number => {
  const normalized = value.replace(/,/g, '')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export const calculateLineAmount = (item: LineItem): number => {
  return parseNumber(item.quantity) * parseNumber(item.rate)
}

export const calculateTotals = (items: LineItem[]) => {
  return items.reduce(
    (totals, item) => {
      totals.totalQuantity += parseNumber(item.quantity)
      totals.totalAmount += calculateLineAmount(item)
      return totals
    },
    { totalQuantity: 0, totalAmount: 0 }
  )
}

export const formatNumber = (value: number, fractionDigits = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

const ones = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
]

const scales = ['', 'Thousand', 'Million', 'Billion']

const chunkToWords = (value: number): string => {
  const words: string[] = []
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100

  if (hundreds > 0) {
    words.push(`${ones[hundreds]} Hundred`)
  }

  if (remainder > 0) {
    if (remainder < 20) {
      words.push(ones[remainder])
    } else {
      const tenValue = Math.floor(remainder / 10)
      const unitValue = remainder % 10
      if (tenValue > 0) {
        words.push(tens[tenValue])
      }
      if (unitValue > 0) {
        words.push(ones[unitValue])
      }
    }
  }

  return words.join(' ')
}

export const numberToWords = (value: number): string => {
  if (value === 0) {
    return ones[0]
  }

  let remaining = value
  let scaleIndex = 0
  const parts: string[] = []

  while (remaining > 0) {
    const chunk = remaining % 1000
    if (chunk > 0) {
      const chunkWords = chunkToWords(chunk)
      const scale = scales[scaleIndex]
      parts.unshift(scale ? `${chunkWords} ${scale}` : chunkWords)
    }
    remaining = Math.floor(remaining / 1000)
    scaleIndex += 1
  }

  return parts.join(' ')
}

export const formatAmountInWords = (
  value: number,
  currencyInfo: CurrencyInfo
): string => {
  const rounded = Math.round(value * 100)
  const majorValue = Math.floor(rounded / 100)
  const minorValue = rounded % 100

  const majorWords = numberToWords(majorValue)
  const minorWords = minorValue > 0 ? numberToWords(minorValue) : ''

  const minorPart = minorValue
    ? ` and ${minorWords} ${currencyInfo.minorUnit}`
    : ''

  return `${currencyInfo.code} ${majorWords}${minorPart} only`
}
