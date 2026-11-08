export type UserRole = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  avatar?: string;
  phone?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export type TelecomCategory =
  | 'Fibra Óptica'
  | 'Routers & Redes'
  | 'Antenas & Wireless'
  | 'Switches & PoE'
  | 'Cables & Conectores'
  | 'CCTV & Seguridad'
  | 'Servidores & Racks'
  | 'Herramientas & Medición'
  | 'Telefonía IP & PBX';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: TelecomCategory;
  description: string;
  unitCost: number;
  salePrice: number;
  // Stock per branch: branchId -> number
  stockByBranch: Record<string, number>;
  minStock: number;
  unit: string; // 'Pieza', 'Bobina 305m', 'Bobina 1000m', 'Kit', 'Metro'
  trackSerial: boolean;
  serialNumbers?: string[];
  model?: string;
  specifications?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'VENTA' | 'TRANSFERENCIA';

export interface StockMovement {
  id: string;
  type: MovementType;
  productId: string;
  productName: string;
  sku: string;
  branchId: string;
  branchName: string;
  targetBranchId?: string;
  targetBranchName?: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceDoc?: string;
  user: string;
  serials?: string[];
  createdAt: string;
}

export type CustomerType = 'WISP_ISP' | 'INSTALADOR' | 'EMPRESA' | 'PARTICULAR';

export type VipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  rfc?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  customerType: CustomerType;
  creditLimit: number;
  currentCredit: number;
  notes?: string;
  // VIP System
  isVip?: boolean;
  vipTier?: VipTier;
  vipDiscountPercent?: number;
  vipSpecialBenefits?: string[];
  vipNotes?: string;
  vipAssignedAt?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  selectedSerials?: string[];
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO' | 'MIXTO';

export interface Sale {
  id: string;
  folio: string;
  branchId: string;
  branchName: string;
  sellerId: string;
  sellerName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  // VIP Sale Details
  isVipSale?: boolean;
  vipTier?: VipTier;
  vipDiscountPercent?: number;
  vipDiscountAmount?: number;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    subtotal: number;
    serials?: string[];
  }[];
  subtotal: number;
  tax: number; // IVA 16%
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  notes?: string;
  status: 'COMPLETADA' | 'CANCELADA' | 'COTIZACION';
  createdAt: string;
}

export interface CloudSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  pendingChanges: number;
  syncServer: string;
}
