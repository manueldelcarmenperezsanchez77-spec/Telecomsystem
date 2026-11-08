import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch,
  CartItem,
  CloudSyncState,
  Customer,
  PaymentMethod,
  Product,
  Sale,
  StockMovement,
  User,
  VipTier,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_CUSTOMERS,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from '../data/initialData';

export const WHATSAPP_SUPPORT_NUMBER = '961-580-24-90';
export const WHATSAPP_CLEAN_PHONE = '529615802490';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Auth & Branch
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  branches: Branch[];
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductStock: (product: Product, branchId?: string) => number;

  // Movements (Kardex)
  movements: StockMovement[];
  registerMovement: (params: {
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA';
    productId: string;
    quantity: number;
    reason: string;
    referenceDoc?: string;
    targetBranchId?: string;
    serials?: string[];
  }) => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  applyCartDiscountPercent: (discountPercent: number) => void;
  updateCartSerials: (productId: string, serials: string[]) => void;
  clearCart: () => void;
  cartTotals: {
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    itemCount: number;
  };

  // Sales
  sales: Sale[];
  processSale: (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string;
    isQuote?: boolean;
    isVipSale?: boolean;
    vipTier?: VipTier;
    vipDiscountPercent?: number;
    vipDiscountAmount?: number;
  }) => Sale;
  selectedSaleForTicket: Sale | null;
  setSelectedSaleForTicket: (sale: Sale | null) => void;

  // Customers & VIP
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  toggleCustomerVip: (
    customerId: string,
    vipData?: {
      isVip?: boolean;
      vipTier?: VipTier;
      vipDiscountPercent?: number;
      vipSpecialBenefits?: string[];
      vipNotes?: string;
    }
  ) => void;
  deleteCustomer: (id: string) => void;

  // Cloud Sync
  cloudSync: CloudSyncState;
  syncNow: () => Promise<void>;
  exportDataBackup: () => void;
  importDataBackup: (jsonData: string) => boolean;

  // WhatsApp helper
  openWhatsAppSupport: (message?: string, customPhone?: string) => void;
  sendSaleByWhatsApp: (sale: Sale, targetPhone?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'telecosys_products_v1',
  BRANCHES: 'telecosys_branches_v1',
  CURRENT_BRANCH: 'telecosys_curr_branch_v1',
  CUSTOMERS: 'telecosys_customers_v1',
  MOVEMENTS: 'telecosys_movements_v1',
  SALES: 'telecosys_sales_v1',
  USER: 'telecosys_user_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Load branches
  const [branches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [currentBranch, setCurrentBranchState] = useState<Branch>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_BRANCH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_BRANCHES[0];
  });

  const setCurrentBranch = (branch: Branch) => {
    setCurrentBranchState(branch);
    localStorage.setItem(STORAGE_KEYS.CURRENT_BRANCH, JSON.stringify(branch));
  };

  // Available users
  const [availableUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  // Save current user on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try {
        const parsed: Customer[] = JSON.parse(saved);
        return parsed.map((c) => {
          const init = INITIAL_CUSTOMERS.find((i) => i.id === c.id);
          if (init && c.isVip === undefined) {
            return {
              ...init,
              ...c,
              isVip: init.isVip,
              vipTier: init.vipTier,
              vipDiscountPercent: init.vipDiscountPercent,
              vipSpecialBenefits: init.vipSpecialBenefits,
              vipNotes: init.vipNotes,
              vipAssignedAt: init.vipAssignedAt,
            };
          }
          return c;
        });
      } catch {
        return INITIAL_CUSTOMERS;
      }
    }
    return INITIAL_CUSTOMERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  // Movements
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  // Sales
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initial sample sale
    const sampleSale: Sale = {
      id: 'sale-001',
      folio: 'TEL-2026-0001',
      branchId: 'br-tuxtla-matriz',
      branchName: 'Sucursal Matriz (Tuxtla Gtz)',
      sellerId: 'usr-ventas-1',
      sellerName: 'Lic. Mariana Morales',
      customerId: 'cust-1',
      customerName: 'Ing. Alejandro Solís Gómez',
      customerPhone: '961-123-45-67',
      items: [
        {
          productId: 'prod-1',
          productName: 'Routerboard Mikrotik hEX S (RB760iGS)',
          sku: 'MIK-HEX-S',
          quantity: 2,
          unitPrice: 1680,
          discountPercent: 0,
          subtotal: 3360,
          serials: ['HEXS-2026-9901', 'HEXS-2026-9902'],
        },
        {
          productId: 'prod-7',
          productName: 'Conector Rápido Mecánico SC/APC Verde (Bolsa 50 pzas)',
          sku: 'CON-SC-APC-50P',
          quantity: 1,
          unitPrice: 750,
          discountPercent: 0,
          subtotal: 750,
        },
      ],
      subtotal: 4110,
      tax: 0,
      discount: 0,
      total: 4110,
      paymentMethod: 'TRANSFERENCIA',
      amountPaid: 4110,
      change: 0,
      notes: 'Entrega en mostrador para red WISP Berriozábal',
      status: 'COMPLETADA',
      createdAt: '2026-09-04T16:20:00Z',
    };
    return [sampleSale];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  // Cart for POS
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSaleForTicket, setSelectedSaleForTicket] = useState<Sale | null>(null);

  // Cloud Sync
  const [cloudSync, setCloudSync] = useState<CloudSyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: 'Hace un momento',
    pendingChanges: 0,
    syncServer: 'cloud-cluster-telecom-mx.googlecloud.internal',
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setCloudSync((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCloudSync((prev) => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = async () => {
    setCloudSync((prev) => ({ ...prev, isSyncing: true }));
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setCloudSync((prev) => ({
      ...prev,
      isSyncing: false,
      lastSyncTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      pendingChanges: 0,
    }));
  };

  const getProductStock = (product: Product, branchId?: string): number => {
    const bId = branchId || currentBranch.id;
    return product.stockByBranch[bId] ?? 0;
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Register initial movement if stock > 0 in current branch
    const initialQty = newProduct.stockByBranch[currentBranch.id] || 0;
    if (initialQty > 0) {
      registerMovement({
        type: 'ENTRADA',
        productId: newProduct.id,
        quantity: initialQty,
        reason: 'Inventario inicial de producto nuevo',
        referenceDoc: 'ALTA-INICIAL',
        serials: newProduct.serialNumbers,
      });
    }

    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  const registerMovement = (params: {
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA';
    productId: string;
    quantity: number;
    reason: string;
    referenceDoc?: string;
    targetBranchId?: string;
    serials?: string[];
  }) => {
    const product = products.find((p) => p.id === params.productId);
    if (!product) return;

    const bId = currentBranch.id;
    const currentStock = product.stockByBranch[bId] || 0;
    let newStock = currentStock;

    if (params.type === 'ENTRADA') {
      newStock = currentStock + params.quantity;
    } else if (params.type === 'SALIDA') {
      newStock = Math.max(0, currentStock - params.quantity);
    } else if (params.type === 'AJUSTE') {
      newStock = params.quantity;
    } else if (params.type === 'TRANSFERENCIA') {
      newStock = Math.max(0, currentStock - params.quantity);
    }

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === params.productId) {
          const updatedStock = { ...p.stockByBranch, [bId]: newStock };
          if (params.type === 'TRANSFERENCIA' && params.targetBranchId) {
            const targetCurrent = p.stockByBranch[params.targetBranchId] || 0;
            updatedStock[params.targetBranchId] = targetCurrent + params.quantity;
          }
          return { ...p, stockByBranch: updatedStock, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    const targetBranch = branches.find((b) => b.id === params.targetBranchId);

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      type: params.type,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      branchId: bId,
      branchName: currentBranch.name,
      targetBranchId: params.targetBranchId,
      targetBranchName: targetBranch?.name,
      quantity: params.quantity,
      previousStock: currentStock,
      newStock: newStock,
      reason: params.reason,
      referenceDoc: params.referenceDoc,
      user: currentUser.name,
      serials: params.serials,
      createdAt: new Date().toISOString(),
    };

    setMovements((prev) => [movement, ...prev]);
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  // Cart methods
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const availableStock = getProductStock(product);

      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > availableStock) {
          // Keep maximum available
          return prev.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: availableStock,
                  subtotal: (item.unitPrice * (1 - item.discountPercent / 100)) * availableStock,
                }
              : item
          );
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: nextQty,
                subtotal: (item.unitPrice * (1 - item.discountPercent / 100)) * nextQty,
              }
            : item
        );
      } else {
        const initialQty = Math.min(quantity, Math.max(1, availableStock));
        return [
          ...prev,
          {
            product,
            quantity: initialQty,
            unitPrice: product.salePrice,
            discountPercent: 0,
            subtotal: product.salePrice * initialQty,
            selectedSerials: product.serialNumbers?.slice(0, initialQty) || [],
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const avail = getProductStock(item.product);
          const safeQty = Math.min(quantity, avail > 0 ? avail : 1);
          return {
            ...item,
            quantity: safeQty,
            subtotal: (item.unitPrice * (1 - item.discountPercent / 100)) * safeQty,
          };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const safeDiscount = Math.max(0, Math.min(100, discount));
          return {
            ...item,
            discountPercent: safeDiscount,
            subtotal: (item.unitPrice * (1 - safeDiscount / 100)) * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const applyCartDiscountPercent = (discountPercent: number) => {
    const safeDiscount = Math.max(0, Math.min(100, discountPercent));
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        discountPercent: safeDiscount,
        subtotal: (item.unitPrice * (1 - safeDiscount / 100)) * item.quantity,
      }))
    );
  };

  const updateCartSerials = (productId: string, serials: string[]) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, selectedSerials: serials };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotals = React.useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let itemCount = 0;

    cart.forEach((item) => {
      const lineOriginal = item.unitPrice * item.quantity;
      const lineDiscount = lineOriginal * (item.discountPercent / 100);
      subtotal += lineOriginal;
      discountTotal += lineDiscount;
      itemCount += item.quantity;
    });

    const totalBeforeTax = subtotal - discountTotal;
    // Optional tax calculation (prices in telecom retail often include IVA or add IVA)
    const total = totalBeforeTax;
    const tax = 0; // included

    return {
      subtotal,
      discountTotal,
      tax,
      total,
      itemCount,
    };
  }, [cart]);

  // Process POS Sale
  const processSale = (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string;
    isQuote?: boolean;
    isVipSale?: boolean;
    vipTier?: VipTier;
    vipDiscountPercent?: number;
    vipDiscountAmount?: number;
  }): Sale => {
    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      subtotal: item.subtotal,
      serials: item.selectedSerials,
    }));

    const folioNumber = sales.length + 1;
    const folio = `TEL-${new Date().getFullYear()}-${String(folioNumber).padStart(4, '0')}`;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      folio,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Público en General',
      customerPhone: saleData.customerPhone,
      isVipSale: saleData.isVipSale,
      vipTier: saleData.vipTier,
      vipDiscountPercent: saleData.vipDiscountPercent,
      vipDiscountAmount: saleData.vipDiscountAmount,
      items: saleItems,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      discount: cartTotals.discountTotal,
      total: cartTotals.total,
      paymentMethod: saleData.paymentMethod,
      amountPaid: saleData.amountPaid || cartTotals.total,
      change: Math.max(0, (saleData.amountPaid || cartTotals.total) - cartTotals.total),
      notes: saleData.notes,
      status: saleData.isQuote ? 'COTIZACION' : 'COMPLETADA',
      createdAt: new Date().toISOString(),
    };

    // If actual sale, deduct inventory and register movements
    if (!saleData.isQuote) {
      saleItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const currentStock = product.stockByBranch[currentBranch.id] || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          // Update stock
          setProducts((prev) =>
            prev.map((p) =>
              p.id === item.productId
                ? {
                    ...p,
                    stockByBranch: {
                      ...p.stockByBranch,
                      [currentBranch.id]: newStock,
                    },
                    updatedAt: new Date().toISOString(),
                  }
                : p
            )
          );

          // Movement
          const movement: StockMovement = {
            id: 'mov-' + Date.now() + '-' + item.productId,
            type: 'VENTA',
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            branchId: currentBranch.id,
            branchName: currentBranch.name,
            quantity: item.quantity,
            previousStock: currentStock,
            newStock: newStock,
            reason: `Venta POS Folio ${folio}`,
            referenceDoc: folio,
            user: currentUser.name,
            serials: item.serials,
            createdAt: new Date().toISOString(),
          };

          setMovements((prev) => [movement, ...prev]);
        }
      });
    }

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    setSelectedSaleForTicket(newSale);
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));

    return newSale;
  };

  // Customers & VIP
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  const toggleCustomerVip = (
    customerId: string,
    vipData?: {
      isVip?: boolean;
      vipTier?: VipTier;
      vipDiscountPercent?: number;
      vipSpecialBenefits?: string[];
      vipNotes?: string;
    }
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const nextIsVip = vipData?.isVip !== undefined ? vipData.isVip : !c.isVip;
          return {
            ...c,
            isVip: nextIsVip,
            vipTier: vipData?.vipTier !== undefined ? vipData.vipTier : c.vipTier || (nextIsVip ? 'GOLD' : undefined),
            vipDiscountPercent:
              vipData?.vipDiscountPercent !== undefined
                ? vipData.vipDiscountPercent
                : c.vipDiscountPercent !== undefined
                ? c.vipDiscountPercent
                : nextIsVip
                ? 10
                : 0,
            vipSpecialBenefits:
              vipData?.vipSpecialBenefits !== undefined
                ? vipData.vipSpecialBenefits
                : c.vipSpecialBenefits ||
                  (nextIsVip
                    ? ['Soporte Técnico Prioritario', 'Precios Especiales de Mayoreo']
                    : []),
            vipNotes: vipData?.vipNotes !== undefined ? vipData.vipNotes : c.vipNotes,
            vipAssignedAt: nextIsVip ? c.vipAssignedAt || new Date().toISOString() : undefined,
          };
        }
        return c;
      })
    );
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setCloudSync((prev) => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
  };

  // WhatsApp integrations
  const openWhatsAppSupport = (message?: string, customPhone?: string) => {
    const phone = customPhone
      ? customPhone.replace(/\D/g, '')
      : WHATSAPP_CLEAN_PHONE;

    const defaultMsg =
      `Hola, solicito soporte técnico / información de pedidos de TelecoSys Telecomunicaciones.\n` +
      `Sucursal: ${currentBranch.name}\n` +
      `Usuario: ${currentUser.name}\n` +
      `Teléfono de atención: ${WHATSAPP_SUPPORT_NUMBER}`;

    const text = encodeURIComponent(message || defaultMsg);
    const url = `https://wa.me/${phone.startsWith('52') ? phone : '52' + phone}?text=${text}`;
    window.open(url, '_blank');
  };

  const sendSaleByWhatsApp = (sale: Sale, targetPhone?: string) => {
    const phone = targetPhone
      ? targetPhone.replace(/\D/g, '')
      : sale.customerPhone
      ? sale.customerPhone.replace(/\D/g, '')
      : WHATSAPP_CLEAN_PHONE;

    let itemsList = '';
    sale.items.forEach((it, idx) => {
      itemsList += `${idx + 1}. *${it.productName}*\n   SKU: ${it.sku} | Cant: ${it.quantity} x $${it.unitPrice.toLocaleString('es-MX')} = $${it.subtotal.toLocaleString('es-MX')}\n`;
      if (it.serials && it.serials.length > 0) {
        itemsList += `   S/N: ${it.serials.join(', ')}\n`;
      }
    });

    const vipBanner = sale.isVipSale
      ? `👑 *BENEFICIO CLIENTE VIP ${sale.vipTier || 'PREFERENCIAL'}*\n` +
        `Descuento VIP aplicado: ${sale.vipDiscountPercent || 0}%\n` +
        `--------------------------------\n`
      : '';

    const msg =
      `*TELECOSYS TELECOMUNICACIONES & SISTEMAS*\n` +
      `*COMPROBANTE DE ${sale.status === 'COTIZACION' ? 'COTIZACIÓN' : 'VENTA'}*\n` +
      `--------------------------------\n` +
      vipBanner +
      `📄 *Folio:* ${sale.folio}\n` +
      `🏢 *Sucursal:* ${sale.branchName}\n` +
      `📅 *Fecha:* ${new Date(sale.createdAt).toLocaleString('es-MX')}\n` +
      `👤 *Cliente:* ${sale.customerName}\n` +
      `💼 *Atendió:* ${sale.sellerName}\n` +
      `💳 *Método de Pago:* ${sale.paymentMethod}\n` +
      `--------------------------------\n` +
      `*DETALLE DE PRODUCTOS:*\n` +
      itemsList +
      `--------------------------------\n` +
      `*TOTAL: $${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*\n` +
      `Pagado: $${sale.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })} | Cambio: $${sale.change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}\n\n` +
      `📞 *Soporte Técnico Directo y Seguimiento de Pedidos:* ${WHATSAPP_SUPPORT_NUMBER}\n` +
      `¡Gracias por su preferencia!`;

    const text = encodeURIComponent(msg);
    const cleanPhone = phone.startsWith('52') ? phone : '52' + phone;
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  // Export / Import
  const exportDataBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      branches,
      products,
      customers,
      movements,
      sales,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TelecoSys_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importDataBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
      if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
      if (data.movements && Array.isArray(data.movements)) {
        setMovements(data.movements);
      }
      if (data.sales && Array.isArray(data.sales)) {
        setSales(data.sales);
      }
      setCloudSync((prev) => ({
        ...prev,
        lastSyncTime: 'Restaurado desde copia de seguridad',
        pendingChanges: 0,
      }));
      return true;
    } catch (e) {
      console.error('Error al importar backup:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        availableUsers,
        branches,
        currentBranch,
        setCurrentBranch,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductStock,
        movements,
        registerMovement,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartDiscount,
        applyCartDiscountPercent,
        updateCartSerials,
        clearCart,
        cartTotals,
        sales,
        processSale,
        selectedSaleForTicket,
        setSelectedSaleForTicket,
        customers,
        addCustomer,
        updateCustomer,
        toggleCustomerVip,
        deleteCustomer,
        cloudSync,
        syncNow,
        exportDataBackup,
        importDataBackup,
        openWhatsAppSupport,
        sendSaleByWhatsApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
