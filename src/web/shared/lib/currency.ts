export const formatCurrencyAmount = (amountInMinorUnits: number, currency = 'RUB') =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(amountInMinorUnits / 100);

export const toMinorUnits = (value: string) => Math.round(Number(value.replace(',', '.')) * 100);

export const isMoneyInput = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value);
