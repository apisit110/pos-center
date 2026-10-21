export const formatAmount = (amount: number, symbol = ''): string =>
  `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
