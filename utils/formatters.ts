
/**
 * 格式化数值，保留指定位小数
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * 格式化大数值 (K, M, B)
 */
export const formatCompactNumber = (value: number): string => {
  const formatter = Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * 格式化金额 (带货币符号)
 */
export const formatCurrency = (value: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};
