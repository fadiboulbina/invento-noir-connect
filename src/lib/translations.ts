export interface Translation {
  // Navigation
  dashboard: string;
  products: string;
  customers: string;
  orders: string;
  shippers: string;
  priceComparison: string;
  
  // Authentication
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  authentication: string;
  
  // Common Actions
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  search: string;
  filter: string;
  sort: string;
  export: string;
  print: string;
  
  // Dashboard
  totalSales: string;
  stockLevels: string;
  pendingOrders: string;
  lowStock: string;
  recentOrders: string;
  topProducts: string;
  
  // Products
  productName: string;
  productImage: string;
  category: string;
  buyingPrice: string;
  sellingPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  notes: string;
  lowStockAlert: string;
  addProduct: string;
  editProduct: string;
  viewDetails: string;
  uploadImage: string;
  removeImage: string;
  
  // Customers
  customerName: string;
  shopName: string;
  phoneNumber: string;
  wilaya: string;
  commune: string;
  address: string;
  locationUrl: string;
  totalPurchases: string;
  lastPurchase: string;
  
  // Orders
  orderDate: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  paymentStatus: string;
  deliveryStatus: string;
  
  // Status
  paid: string;
  unpaid: string;
  pending: string;
  delivered: string;
  shipping: string;
  cancelled: string;
  
  // General
  loading: string;
  error: string;
  success: string;
  warning: string;
  confirmation: string;
  welcome: string;
  inventoryManagement: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    products: "Products",
    customers: "Customers", 
    orders: "Orders",
    shippers: "Suppliers",
    priceComparison: "Price Comparison",
    
    // Authentication
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    authentication: "Authentication",
    
    // Common Actions
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    export: "Export",
    print: "Print",
    
    // Dashboard
    totalSales: "Total Sales",
    stockLevels: "Stock Levels",
    pendingOrders: "Pending Orders",
    lowStock: "Low Stock",
    recentOrders: "Recent Orders",
    topProducts: "Top Products",
    
    // Products
    productName: "Product Name",
    productImage: "Product Image",
    category: "Category",
    buyingPrice: "Buying Price",
    sellingPrice: "Selling Price",
    stockQuantity: "Stock Quantity",
    lowStockThreshold: "Low Stock Threshold",
    notes: "Notes",
    lowStockAlert: "Low Stock Alert",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    viewDetails: "View Details",
    uploadImage: "Upload Image",
    removeImage: "Remove Image",
    
    // Customers
    customerName: "Customer Name",
    shopName: "Shop Name",
    phoneNumber: "Phone Number",
    wilaya: "Wilaya",
    commune: "Commune",
    address: "Address",
    locationUrl: "Location URL",
    totalPurchases: "Total Purchases",
    lastPurchase: "Last Purchase",
    
    // Orders
    orderDate: "Order Date",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    totalPrice: "Total Price",
    paymentStatus: "Payment Status",
    deliveryStatus: "Delivery Status",
    
    // Status
    paid: "Paid",
    unpaid: "Unpaid",
    pending: "Pending",
    delivered: "Delivered",
    shipping: "Shipping",
    cancelled: "Cancelled",
    
    // General
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    confirmation: "Confirmation",
    welcome: "Welcome",
    inventoryManagement: "Inventory Management",
  },
  
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    products: "Produits",
    customers: "Clients",
    orders: "Commandes",
    shippers: "Fournisseurs",
    priceComparison: "Comparaison de prix",
    
    // Authentication
    signIn: "Connexion",
    signUp: "Inscription",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    fullName: "Nom complet",
    authentication: "Authentification",
    
    // Common Actions
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    export: "Exporter",
    print: "Imprimer",
    
    // Dashboard
    totalSales: "Ventes totales",
    stockLevels: "Niveaux de stock",
    pendingOrders: "Commandes en attente",
    lowStock: "Stock faible",
    recentOrders: "Commandes récentes",
    topProducts: "Produits populaires",
    
    // Products
    productName: "Nom du produit",
    productImage: "Image du produit",
    category: "Catégorie",
    buyingPrice: "Prix d'achat",
    sellingPrice: "Prix de vente",
    stockQuantity: "Quantité en stock",
    lowStockThreshold: "Seuil de stock faible",
    notes: "Notes",
    lowStockAlert: "Alerte stock faible",
    addProduct: "Ajouter un produit",
    editProduct: "Modifier le produit",
    viewDetails: "Voir les détails",
    uploadImage: "Télécharger une image",
    removeImage: "Supprimer l'image",
    
    // Customers
    customerName: "Nom du client",
    shopName: "Nom du magasin",
    phoneNumber: "Numéro de téléphone",
    wilaya: "Wilaya",
    commune: "Commune",
    address: "Adresse",
    locationUrl: "URL de localisation",
    totalPurchases: "Achats totaux",
    lastPurchase: "Dernier achat",
    
    // Orders
    orderDate: "Date de commande",
    quantity: "Quantité",
    unitPrice: "Prix unitaire",
    totalPrice: "Prix total",
    paymentStatus: "Statut de paiement",
    deliveryStatus: "Statut de livraison",
    
    // Status
    paid: "Payé",
    unpaid: "Non payé",
    pending: "En attente",
    delivered: "Livré",
    shipping: "Expédition",
    cancelled: "Annulé",
    
    // General
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    warning: "Avertissement",
    confirmation: "Confirmation",
    welcome: "Bienvenue",
    inventoryManagement: "Gestion d'inventaire",
  },
  
  ar: {
    // Navigation
    dashboard: "لوحة القيادة",
    products: "المنتجات",
    customers: "العملاء",
    orders: "الطلبات",
    shippers: "الموردون",
    priceComparison: "مقارنة الأسعار",
    
    // Authentication
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    authentication: "المصادقة",
    
    // Common Actions
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    filter: "تصفية",
    sort: "ترتيب",
    export: "تصدير",
    print: "طباعة",
    
    // Dashboard
    totalSales: "إجمالي المبيعات",
    stockLevels: "مستويات المخزون",
    pendingOrders: "الطلبات المعلقة",
    lowStock: "مخزون منخفض",
    recentOrders: "الطلبات الأخيرة",
    topProducts: "أفضل المنتجات",
    
    // Products
    productName: "اسم المنتج",
    productImage: "صورة المنتج",
    category: "الفئة",
    buyingPrice: "سعر الشراء",
    sellingPrice: "سعر البيع",
    stockQuantity: "كمية المخزون",
    lowStockThreshold: "حد المخزون المنخفض",
    notes: "ملاحظات",
    lowStockAlert: "تنبيه مخزون منخفض",
    addProduct: "إضافة منتج",
    editProduct: "تعديل المنتج",
    viewDetails: "عرض التفاصيل",
    uploadImage: "رفع صورة",
    removeImage: "إزالة الصورة",
    
    // Customers
    customerName: "اسم العميل",
    shopName: "اسم المتجر",
    phoneNumber: "رقم الهاتف",
    wilaya: "الولاية",
    commune: "البلدية",
    address: "العنوان",
    locationUrl: "رابط الموقع",
    totalPurchases: "إجمالي المشتريات",
    lastPurchase: "آخر شراء",
    
    // Orders
    orderDate: "تاريخ الطلب",
    quantity: "الكمية",
    unitPrice: "سعر الوحدة",
    totalPrice: "السعر الإجمالي",
    paymentStatus: "حالة الدفع",
    deliveryStatus: "حالة التسليم",
    
    // Status
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    pending: "معلق",
    delivered: "تم التسليم",
    shipping: "شحن",
    cancelled: "ملغى",
    
    // General
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    warning: "تحذير",
    confirmation: "تأكيد",
    welcome: "مرحباً",
    inventoryManagement: "إدارة المخزون",
  },
};

export type Language = keyof typeof translations;
export const languages: Language[] = ['en', 'fr', 'ar'];
export const defaultLanguage: Language = 'en';