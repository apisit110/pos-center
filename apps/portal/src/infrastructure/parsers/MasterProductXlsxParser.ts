export interface MasterProduct {
  uid: string;
  image_url: string[];
  name_en: string | null;
  name_th: string | null;
  brand_en: string | null;
  brand_th: string | null;
  company_name_en: string | null;
  company_name_th: string | null;
  base_price: number;
  unit_name: string | null;
  barcode: string | null;
  qrcode: string | null;
}

export interface MasterStoreProduct {
  product_uid: string;
  stock: number;
  price: number;
  price_tiers: unknown[] | null;
}

export interface MasterProductFile {
  products: MasterProduct[];
  storeProducts: MasterStoreProduct[];
}

const PRODUCT_SHEET = 'product';
const STORE_PRODUCT_SHEET = 'store_product';

const toText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  // formula / rich text cells come back as objects
  if (typeof value === 'object') {
    const v = value as { text?: unknown; result?: unknown; richText?: { text: string }[] };
    if (v.richText) return v.richText.map(t => t.text).join('') || null;
    return toText(v.text ?? v.result);
  }
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toNumber = (value: unknown): number => {
  const text = toText(value);
  return text === null ? NaN : Number(text);
};

const parseJsonArray = (value: unknown): unknown[] | null => {
  const text = toText(value);
  if (text === null) return null;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Parses master_product_v2.xlsx: sheet `product` (required) and sheet `store_product` (optional). */
export async function parseMasterProductXlsx(buffer: ArrayBuffer): Promise<MasterProductFile> {
  // exceljs is CommonJS: the class is on `default` or on the namespace depending on the bundler
  const mod = await import('exceljs');
  const ExcelJS = mod.default ?? mod;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const productSheet = workbook.getWorksheet(PRODUCT_SHEET);
  if (!productSheet) throw new Error(`Invalid master product file: sheet "${PRODUCT_SHEET}" not found`);

  const columnsOf = (sheet: typeof productSheet) => {
    const columns = new Map<string, number>();
    sheet.getRow(1).eachCell((cell, col) => {
      const name = toText(cell.value);
      if (name) columns.set(name, col);
    });
    return columns;
  };
  const requireColumns = (sheetName: string, columns: Map<string, number>, required: string[]) => {
    const missing = required.filter(c => !columns.has(c));
    if (missing.length > 0) {
      throw new Error(`Invalid master product file: sheet "${sheetName}" is missing column ${missing.join(', ')}`);
    }
  };

  const pc = columnsOf(productSheet);
  requireColumns(PRODUCT_SHEET, pc, ['uid', 'base_price']);

  const products: MasterProduct[] = [];
  productSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cell = (name: string) => (pc.has(name) ? row.getCell(pc.get(name)!).value : null);
    const uid = toText(cell('uid'));
    if (!uid) return;
    products.push({
      uid,
      image_url: (parseJsonArray(cell('image_url')) ?? []).filter((u): u is string => typeof u === 'string'),
      name_en: toText(cell('name_en')),
      name_th: toText(cell('name_th')),
      brand_en: toText(cell('brand_en')),
      brand_th: toText(cell('brand_th')),
      company_name_en: toText(cell('company_name_en')),
      company_name_th: toText(cell('company_name_th')),
      base_price: toNumber(cell('base_price')),
      unit_name: toText(cell('unit_name')),
      barcode: toText(cell('barcode')),
      qrcode: toText(cell('qrcode')),
    });
  });

  const storeProducts: MasterStoreProduct[] = [];
  const storeSheet = workbook.getWorksheet(STORE_PRODUCT_SHEET);
  if (storeSheet) {
    const sc = columnsOf(storeSheet);
    requireColumns(STORE_PRODUCT_SHEET, sc, ['product_uid', 'stock', 'price']);
    storeSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const cell = (name: string) => (sc.has(name) ? row.getCell(sc.get(name)!).value : null);
      const productUid = toText(cell('product_uid'));
      if (!productUid) return;
      storeProducts.push({
        product_uid: productUid,
        stock: toNumber(cell('stock')),
        price: toNumber(cell('price')),
        price_tiers: parseJsonArray(cell('price_tiers')),
      });
    });
  }

  return { products, storeProducts };
}
