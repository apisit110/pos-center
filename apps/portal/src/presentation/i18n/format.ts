export const formatMessage = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
