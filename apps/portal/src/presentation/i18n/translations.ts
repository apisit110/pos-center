export interface Translations {
  common: {
    search: string;
    clear: string;
    loading: string;
  };
  mainLayout: {
    dashboard: string;
    transactions: string;
    merchants: string;
    products: string;
    staff: string;
    logout: string;
  };
  login: {
    welcome: string;
    subtitle: string;
    username: string;
    usernamePlaceholder: string;
    pin: string;
    signIn: string;
    errorTooManyAttempts: string;
    errorFailed: string;
    brandTitle: string;
    brandText: string;
  };
  dashboard: {
    placeholder: string;
  };
  transactionList: {
    title: string;
    dateRange: string;
    transactionId: string;
    transactionIdPlaceholder: string;
    orderId: string;
    orderIdPlaceholder: string;
    method: string;
    methodAll: string;
    methodCash: string;
    methodQr: string;
    status: string;
    statusAll: string;
    merchant: string;
    merchantAll: string;
    store: string;
    storeAll: string;
    columnDate: string;
    columnAmount: string;
  };
  merchantList: {
    title: string;
    create: string;
    partnerId: string;
    partnerIdPlaceholder: string;
    name: string;
    namePlaceholder: string;
    columnPartnerId: string;
    columnNameEn: string;
    columnNameTh: string;
  };
  merchantDetail: {
    notFound: string;
    forbidden: string;
    subtitle: string;
    information: string;
    partnerId: string;
    uid: string;
    relatedStores: string;
    staff: string;
    terminals: string;
    noTerminals: string;
    columnTid: string;
    columnTerminalName: string;
    columnStore: string;
    columnSid: string;
    columnStoreName: string;
    columnAddress: string;
    columnName: string;
    columnUsername: string;
    columnRole: string;
    columnStatus: string;
    credentials: string;
    noCredentials: string;
    columnProvider: string;
    columnClientId: string;
    columnCreatedAt: string;
    columnLastRotatedAt: string;
    createCredential: string;
    rotateSecret: string;
    rotateConfirm: string;
    clientSecret: string;
    secretShownOnce: string;
    secretSaved: string;
    copy: string;
    copied: string;
    credentialFailed: string;
  };
  productList: {
    addProduct: string;
    barcode: string;
    barcodePlaceholder: string;
    name: string;
    namePlaceholder: string;
    maxPrice: string;
    maxPricePlaceholder: string;
    brand: string;
    brandAll: string;
    unit: string;
    unitAll: string;
    merchant: string;
    merchantAll: string;
    store: string;
    storeAll: string;
    columnName: string;
    columnPrice: string;
  };
  productDetail: {
    title: string;
    notFound: string;
    productName: string;
    brand: string;
    basePrice: string;
    barcode: string;
    productSku: string;
    additionalInfo: string;
    merchantPartnerId: string;
    sku: string;
    company: string;
    notAvailable: string;
    status: string;
    active: string;
  };
  staffList: {
    title: string;
    dateRange: string;
    merchantUid: string;
    merchantUidPlaceholder: string;
    username: string;
    usernamePlaceholder: string;
    role: string;
    roleAll: string;
    status: string;
    statusAll: string;
    columnName: string;
    columnMerchant: string;
    columnCreatedAt: string;
  };
  staffRole: {
    manager: string;
    cashier: string;
  };
  staffStatus: {
    active: string;
    pending: string;
    inactive: string;
    suspended: string;
  };
  transactionDetail: {
    title: string;
    notFound: string;
    details: string;
    transactionId: string;
    orderId: string;
    merchantPartnerId: string;
    store: string;
    terminal: string;
    staff: string;
    amountSection: string;
    status: string;
    orderStatus: string;
    paymentMethod: string;
    amount: string;
    timeline: string;
    timelineCreated: string;
    items: string;
    orderTotal: string;
    columnProduct: string;
    columnSku: string;
    columnBarcode: string;
    columnQuantity: string;
    columnUnitPrice: string;
    columnTotal: string;
  };
  transactionStatus: {
    pending: string;
    approved: string;
    success: string;
    failed: string;
    voided: string;
    refunded: string;
  };
}

export const en: Translations = {
  common: {
    search: 'Search',
    clear: 'Clear',
    loading: 'Loading...',
  },
  mainLayout: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    merchants: 'Merchants',
    products: 'Products',
    staff: 'Staff',
    logout: 'Log out',
  },
  login: {
    welcome: 'Welcome Back',
    subtitle: 'Please enter your details',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    pin: 'Pin',
    signIn: 'Sign In',
    errorTooManyAttempts: 'Too many login attempts. Please try again later.',
    errorFailed: 'Login failed',
    brandTitle: 'Lightning POS',
    brandText: 'Empower your business with the most advanced point-of-sale service center.',
  },
  dashboard: {
    placeholder: 'Content will be placed here',
  },
  transactionList: {
    title: 'Transactions',
    dateRange: 'Date Range',
    transactionId: 'Transaction ID',
    transactionIdPlaceholder: 'Search by transaction ID...',
    orderId: 'Order ID',
    orderIdPlaceholder: 'Search by order ID...',
    method: 'Method',
    methodAll: 'All methods',
    methodCash: 'Cash',
    methodQr: 'QR',
    status: 'Status',
    statusAll: 'All statuses',
    merchant: 'Merchant',
    merchantAll: 'All Merchants',
    store: 'Store',
    storeAll: 'All Stores',
    columnDate: 'Date',
    columnAmount: 'Amount',
  },
  merchantList: {
    title: 'Merchants',
    create: 'Create Merchant',
    partnerId: 'Partner ID',
    partnerIdPlaceholder: 'Search by Partner ID...',
    name: 'Merchant Name',
    namePlaceholder: 'Search by name (EN/TH)...',
    columnPartnerId: 'Partner ID',
    columnNameEn: 'Merchant Name (EN)',
    columnNameTh: 'Merchant Name (TH)',
  },
  merchantDetail: {
    notFound: 'Merchant not found',
    forbidden: 'Forbidden',
    subtitle: 'MERCHANT MANAGEMENT',
    information: 'Merchant Information',
    partnerId: 'Partner ID',
    uid: 'Unique ID (UID)',
    relatedStores: 'Related Stores',
    staff: 'Staff',
    terminals: 'Terminals',
    noTerminals: 'No terminals yet.',
    columnTid: 'TID',
    columnTerminalName: 'Terminal Name',
    columnStore: 'Store',
    columnSid: 'SID',
    columnStoreName: 'Store Name',
    columnAddress: 'Address',
    columnName: 'Name',
    columnUsername: 'Username',
    columnRole: 'Role',
    columnStatus: 'Status',
    credentials: 'Credentials',
    noCredentials: 'No credentials yet.',
    columnProvider: 'Provider',
    columnClientId: 'Client ID',
    columnCreatedAt: 'Created At',
    columnLastRotatedAt: 'Last Rotated At',
    createCredential: 'Create Credential',
    rotateSecret: 'Rotate',
    rotateConfirm: 'Rotate the client secret? The current secret stops working immediately.',
    clientSecret: 'Client Secret',
    secretShownOnce: 'Copy the client secret now. It is shown only once and cannot be viewed again.',
    secretSaved: 'I have saved it',
    copy: 'Copy',
    copied: 'Copied',
    credentialFailed: 'Could not issue the credential.',
  },
  productList: {
    addProduct: '+ Add Product',
    barcode: 'Barcode',
    barcodePlaceholder: 'Search barcode...',
    name: 'Product Name',
    namePlaceholder: 'Search name...',
    maxPrice: 'Max Price',
    maxPricePlaceholder: 'Max price...',
    brand: 'Brand',
    brandAll: 'All Brands',
    unit: 'Unit',
    unitAll: 'All Units',
    merchant: 'Merchant',
    merchantAll: 'All Merchants',
    store: 'Store',
    storeAll: 'All Stores',
    columnName: 'Name',
    columnPrice: 'Price',
  },
  productDetail: {
    title: 'Product Details',
    notFound: 'Product not found',
    productName: 'Product Name',
    brand: 'Brand',
    basePrice: 'Base Price',
    barcode: 'Barcode',
    productSku: 'Product SKU',
    additionalInfo: 'Additional Information',
    merchantPartnerId: 'Partner ID',
    sku: 'SKU',
    company: 'Company',
    notAvailable: 'N/A',
    status: 'Status',
    active: 'Active',
  },
  staffList: {
    title: 'Staff Management',
    dateRange: 'Date Range',
    merchantUid: 'Merchant UID',
    merchantUidPlaceholder: 'Enter merchant UID...',
    username: 'Username',
    usernamePlaceholder: 'Search by username...',
    role: 'Role',
    roleAll: 'All roles',
    status: 'Status',
    statusAll: 'All statuses',
    columnName: 'Name',
    columnMerchant: 'Merchant',
    columnCreatedAt: 'Created At',
  },
  staffRole: {
    manager: 'Manager',
    cashier: 'Cashier',
  },
  staffStatus: {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
    suspended: 'Suspended',
  },
  transactionDetail: {
    title: 'Transaction Details',
    notFound: 'Transaction not found',
    details: 'Details',
    transactionId: 'Transaction ID',
    orderId: 'Order ID',
    merchantPartnerId: 'Partner ID',
    store: 'Store',
    terminal: 'Terminal',
    staff: 'Staff',
    amountSection: 'Amount',
    status: 'Status',
    orderStatus: 'Order Status',
    paymentMethod: 'Payment Method',
    amount: 'Amount',
    timeline: 'Timeline',
    timelineCreated: 'Created',
    items: 'Items ({count})',
    orderTotal: 'Order Total',
    columnProduct: 'Product',
    columnSku: 'SKU',
    columnBarcode: 'Barcode',
    columnQuantity: 'Quantity',
    columnUnitPrice: 'Unit Price',
    columnTotal: 'Total',
  },
  transactionStatus: {
    pending: 'Pending',
    approved: 'Approved',
    success: 'Success',
    failed: 'Failed',
    voided: 'Voided',
    refunded: 'Refunded',
  },
};

export const th: Translations = {
  common: {
    search: 'ค้นหา',
    clear: 'ล้าง',
    loading: 'กำลังโหลด...',
  },
  mainLayout: {
    dashboard: 'แดชบอร์ด',
    transactions: 'ธุรกรรม',
    merchants: 'ร้านค้า',
    products: 'สินค้า',
    staff: 'พนักงาน',
    logout: 'ออกจากระบบ',
  },
  login: {
    welcome: 'ยินดีต้อนรับกลับมา',
    subtitle: 'กรุณากรอกข้อมูลของคุณ',
    username: 'ชื่อผู้ใช้',
    usernamePlaceholder: 'กรอกชื่อผู้ใช้',
    pin: 'รหัส PIN',
    signIn: 'เข้าสู่ระบบ',
    errorTooManyAttempts: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง',
    errorFailed: 'เข้าสู่ระบบไม่สำเร็จ',
    brandTitle: 'Lightning POS',
    brandText: 'เสริมศักยภาพธุรกิจของคุณด้วยศูนย์บริการ POS ที่ล้ำสมัยที่สุด',
  },
  dashboard: {
    placeholder: 'เนื้อหาจะแสดงที่นี่',
  },
  transactionList: {
    title: 'ธุรกรรม',
    dateRange: 'ช่วงวันที่',
    transactionId: 'รหัสรายการ',
    transactionIdPlaceholder: 'ค้นหาด้วยรหัสรายการ...',
    orderId: 'รหัสคำสั่งซื้อ',
    orderIdPlaceholder: 'ค้นหาด้วยรหัสคำสั่งซื้อ...',
    method: 'ช่องทางชำระเงิน',
    methodAll: 'ทุกช่องทาง',
    methodCash: 'เงินสด',
    methodQr: 'QR',
    status: 'สถานะ',
    statusAll: 'ทุกสถานะ',
    merchant: 'ร้านค้า',
    merchantAll: 'ทุกร้านค้า',
    store: 'สาขา',
    storeAll: 'ทุกสาขา',
    columnDate: 'วันที่',
    columnAmount: 'ยอดเงิน',
  },
  merchantList: {
    title: 'ร้านค้า',
    create: 'สร้างร้านค้า',
    partnerId: 'Partner ID',
    partnerIdPlaceholder: 'ค้นหาด้วย Partner ID...',
    name: 'ชื่อร้านค้า',
    namePlaceholder: 'ค้นหาด้วยชื่อ (EN/TH)...',
    columnPartnerId: 'Partner ID',
    columnNameEn: 'ชื่อร้านค้า (EN)',
    columnNameTh: 'ชื่อร้านค้า (TH)',
  },
  merchantDetail: {
    notFound: 'ไม่พบร้านค้า',
    forbidden: 'ไม่มีสิทธิ์เข้าถึง',
    subtitle: 'จัดการร้านค้า',
    information: 'ข้อมูลร้านค้า',
    partnerId: 'รหัสพาร์ทเนอร์ (Partner ID)',
    uid: 'รหัสเฉพาะ (UID)',
    relatedStores: 'สาขาที่เกี่ยวข้อง',
    staff: 'พนักงาน',
    terminals: 'เครื่อง POS (Terminals)',
    noTerminals: 'ยังไม่มี terminal',
    columnTid: 'TID',
    columnTerminalName: 'ชื่อเครื่อง',
    columnStore: 'สาขา',
    columnSid: 'SID',
    columnStoreName: 'ชื่อสาขา',
    columnAddress: 'ที่อยู่',
    columnName: 'ชื่อ',
    columnUsername: 'ชื่อผู้ใช้',
    columnRole: 'ตำแหน่ง',
    columnStatus: 'สถานะ',
    credentials: 'ข้อมูลรับรอง (Credentials)',
    noCredentials: 'ยังไม่มี credential',
    columnProvider: 'ผู้ให้บริการ',
    columnClientId: 'Client ID',
    columnCreatedAt: 'วันที่สร้าง',
    columnLastRotatedAt: 'Rotate ล่าสุด',
    createCredential: 'สร้าง Credential',
    rotateSecret: 'Rotate',
    rotateConfirm: 'ต้องการ rotate client secret ใช่ไหม? secret เดิมจะใช้งานไม่ได้ทันที',
    clientSecret: 'Client Secret',
    secretShownOnce: 'คัดลอก client secret เก็บไว้ตอนนี้ ระบบจะแสดงเพียงครั้งเดียวและไม่สามารถดูได้อีก',
    secretSaved: 'บันทึกแล้ว',
    copy: 'คัดลอก',
    copied: 'คัดลอกแล้ว',
    credentialFailed: 'ไม่สามารถออก credential ได้',
  },
  productList: {
    addProduct: '+ เพิ่มสินค้า',
    barcode: 'บาร์โค้ด',
    barcodePlaceholder: 'ค้นหาบาร์โค้ด...',
    name: 'ชื่อสินค้า',
    namePlaceholder: 'ค้นหาชื่อ...',
    maxPrice: 'ราคาสูงสุด',
    maxPricePlaceholder: 'ราคาสูงสุด...',
    brand: 'แบรนด์',
    brandAll: 'ทุกแบรนด์',
    unit: 'หน่วย',
    unitAll: 'ทุกหน่วย',
    merchant: 'ร้านค้า',
    merchantAll: 'ทุกร้านค้า',
    store: 'สาขา',
    storeAll: 'ทุกสาขา',
    columnName: 'ชื่อ',
    columnPrice: 'ราคา',
  },
  productDetail: {
    title: 'รายละเอียดสินค้า',
    notFound: 'ไม่พบสินค้า',
    productName: 'ชื่อสินค้า',
    brand: 'แบรนด์',
    basePrice: 'ราคาพื้นฐาน',
    barcode: 'บาร์โค้ด',
    productSku: 'SKU สินค้า',
    additionalInfo: 'ข้อมูลเพิ่มเติม',
    merchantPartnerId: 'Partner ID ร้านค้า',
    sku: 'SKU',
    company: 'บริษัท',
    notAvailable: 'ไม่มีข้อมูล',
    status: 'สถานะ',
    active: 'ใช้งานอยู่',
  },
  staffList: {
    title: 'จัดการพนักงาน',
    dateRange: 'ช่วงวันที่',
    merchantUid: 'UID ร้านค้า',
    merchantUidPlaceholder: 'กรอก UID ร้านค้า...',
    username: 'ชื่อผู้ใช้',
    usernamePlaceholder: 'ค้นหาด้วยชื่อผู้ใช้...',
    role: 'ตำแหน่ง',
    roleAll: 'ทุกตำแหน่ง',
    status: 'สถานะ',
    statusAll: 'ทุกสถานะ',
    columnName: 'ชื่อ',
    columnMerchant: 'ร้านค้า',
    columnCreatedAt: 'สร้างเมื่อ',
  },
  staffRole: {
    manager: 'ผู้จัดการ',
    cashier: 'แคชเชียร์',
  },
  staffStatus: {
    active: 'ใช้งานอยู่',
    pending: 'รอดำเนินการ',
    inactive: 'ไม่ใช้งาน',
    suspended: 'ถูกระงับ',
  },
  transactionDetail: {
    title: 'รายละเอียดธุรกรรม',
    notFound: 'ไม่พบธุรกรรม',
    details: 'รายละเอียด',
    transactionId: 'รหัสรายการ',
    orderId: 'รหัสคำสั่งซื้อ',
    merchantPartnerId: 'Partner ID ร้านค้า',
    store: 'สาขา',
    terminal: 'เครื่องขาย',
    staff: 'พนักงาน',
    amountSection: 'ยอดเงิน',
    status: 'สถานะ',
    orderStatus: 'สถานะคำสั่งซื้อ',
    paymentMethod: 'ช่องทางชำระเงิน',
    amount: 'ยอดเงิน',
    timeline: 'ไทม์ไลน์',
    timelineCreated: 'สร้างรายการ',
    items: 'รายการสินค้า ({count})',
    orderTotal: 'ยอดรวมคำสั่งซื้อ',
    columnProduct: 'สินค้า',
    columnSku: 'SKU',
    columnBarcode: 'บาร์โค้ด',
    columnQuantity: 'จำนวน',
    columnUnitPrice: 'ราคาต่อหน่วย',
    columnTotal: 'รวม',
  },
  transactionStatus: {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติ',
    success: 'สำเร็จ',
    failed: 'ล้มเหลว',
    voided: 'ยกเลิก',
    refunded: 'คืนเงิน',
  },
};
