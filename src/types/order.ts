export type OrderPlan = 'numerology' | 'love' | 'full' | 'shop' | 'consultation' | string;

export type OrderStatus = 'pending' | 'active' | 'rejected';

export interface MysticOrder {
  id: string; // e.g. "MYS-8391"
  userName: string;
  userEmail: string;
  userPhone: string;
  planId: OrderPlan;
  planName: string;
  amount: number;
  bankName: string;
  transferNote: string;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
  productDetails?: string;
  consumed?: boolean;
  consumedAt?: string;
  consumedReadingId?: string;
}

const STORAGE_KEY = 'mystic_orders_list';

// Sample initial seed orders with pending status for testing admin approval
const INITIAL_ORDERS: MysticOrder[] = [
  {
    id: 'MYS-4091',
    userName: 'Ариунболд Д.',
    userEmail: 'ariunbold@gmail.com',
    userPhone: '99112233',
    planId: 'love',
    planName: 'LOVE READING',
    amount: 9900,
    bankName: 'Хаан банк',
    transferNote: 'MYS-4091 Ариунболд',
    status: 'pending',
    createdAt: '2026-10-11 18:40',
  },
  {
    id: 'MYS-3812',
    userName: 'Болормаа Э.',
    userEmail: 'bolormaa@gmail.com',
    userPhone: '88019922',
    planId: 'full',
    planName: 'FULL READING',
    amount: 19900,
    bankName: 'Голомт банк',
    transferNote: 'MYS-3812 Болормаа',
    status: 'pending',
    createdAt: '2026-10-11 16:15',
  },
];

export function getOrders(): MysticOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrder(order: MysticOrder): void {
  const current = getOrders();
  const updated = [order, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Save device order associations
  try {
    localStorage.setItem('mystic_last_order_id', order.id);
    const existing = JSON.parse(localStorage.getItem('mystic_my_order_ids') || '[]');
    if (Array.isArray(existing) && !existing.includes(order.id)) {
      existing.unshift(order.id);
      localStorage.setItem('mystic_my_order_ids', JSON.stringify(existing));
    }
  } catch {}

  // Dispatch to server backend for persistent store and Webhook/Telegram/Email notification
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mystic_orders_updated'));
  }
}

export async function fetchServerOrders(): Promise<MysticOrder[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const local = getOrders();
        const mergedMap = new Map<string, MysticOrder>();
        // Add server orders first (authoritative)
        data.orders.forEach((o: MysticOrder) => {
          if (o && o.id) mergedMap.set(o.id, o);
        });
        // Add local ones not on server
        local.forEach((o: MysticOrder) => {
          if (o && o.id && !mergedMap.has(o.id)) {
            mergedMap.set(o.id, o);
          }
        });
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch orders from server:', e);
  }
  return getOrders();
}

export async function updateOrderStatusServer(orderId: string, status: OrderStatus): Promise<MysticOrder[]> {
  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'mystic2026',
      },
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    console.warn('Failed to update order status on server:', e);
  }
  return updateOrderStatus(orderId, status);
}

export async function deleteOrderServer(orderId: string): Promise<MysticOrder[]> {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': 'mystic2026',
      },
    });
  } catch {}

  const current = getOrders();
  const updated = current.filter((o) => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mystic_orders_updated'));
  }
  return updated;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): MysticOrder[] {
  const current = getOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        status,
        approvedAt: status === 'active' ? new Date().toLocaleString('mn-MN') : ord.approvedAt,
      };
    }
    return ord;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  const activatedOrder = updated.find((o) => o.id === orderId && o.status === 'active');
  if (activatedOrder) {
    localStorage.setItem('mystic_current_user_email', activatedOrder.userEmail);
    localStorage.setItem('mystic_active_plan', activatedOrder.planId);
  } else if (status === 'rejected') {
    const active = getUserActivePlan();
    if (!active) {
      localStorage.removeItem('mystic_active_plan');
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mystic_orders_updated'));
  }
  return updated;
}

export function getDeviceOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  const ids: string[] = [];
  try {
    const lastId = localStorage.getItem('mystic_last_order_id');
    if (lastId) ids.push(lastId.trim());
    const rawList = localStorage.getItem('mystic_my_order_ids');
    if (rawList) {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => {
          if (id && !ids.includes(id.trim())) ids.push(id.trim());
        });
      }
    }
  } catch {}
  return ids;
}

export function getUserActivePlan(email?: string | null): OrderPlan | null {
  if (typeof window === 'undefined') return null;

  let effectiveEmail = email?.trim() || null;
  if (!effectiveEmail) {
    const savedEmail = localStorage.getItem('mystic_current_user_email');
    if (savedEmail) effectiveEmail = savedEmail.trim();
  }
  if (!effectiveEmail) {
    try {
      const savedAccount = localStorage.getItem('mystic_user_account');
      if (savedAccount) {
        const parsed = JSON.parse(savedAccount);
        if (parsed.email) effectiveEmail = parsed.email.trim();
      }
    } catch {}
  }

  const deviceIds = getDeviceOrderIds();
  const orders = getOrders();

  // Find active unconsumed orders strictly matching this user's email or orders placed on this device
  const myActiveOrders = orders.filter((o) => {
    if (o.status !== 'active' || o.consumed) return false;
    const emailMatch = !!(effectiveEmail && o.userEmail?.toLowerCase() === effectiveEmail.toLowerCase());
    const idMatch = deviceIds.includes(o.id);
    return emailMatch || idMatch;
  });

  if (myActiveOrders.some((o) => o.planId === 'full')) return 'full';
  if (myActiveOrders.some((o) => o.planId === 'love')) return 'love';
  if (myActiveOrders.some((o) => o.planId === 'numerology')) return 'numerology';

  // No active verified orders found
  return null;
}

export interface UserOrderStatusInfo {
  status: 'none' | 'pending' | 'active' | 'rejected' | 'consumed';
  order?: MysticOrder;
}

export function getUserOrderStatus(
  planId: 'numerology' | 'love' | 'full',
  email?: string | null
): UserOrderStatusInfo {
  if (typeof window === 'undefined') return { status: 'none' };

  let effectiveEmail = email?.trim() || null;
  if (!effectiveEmail) {
    const savedEmail = localStorage.getItem('mystic_current_user_email');
    if (savedEmail) effectiveEmail = savedEmail.trim();
  }
  if (!effectiveEmail) {
    try {
      const savedAccount = localStorage.getItem('mystic_user_account');
      if (savedAccount) {
        const parsed = JSON.parse(savedAccount);
        if (parsed.email) effectiveEmail = parsed.email.trim();
      }
    } catch {}
  }

  const deviceIds = getDeviceOrderIds();
  const orders = getOrders();

  const myOrders = orders.filter((o) => {
    const emailMatch = !!(effectiveEmail && o.userEmail?.toLowerCase() === effectiveEmail.toLowerCase());
    const idMatch = deviceIds.includes(o.id);
    return emailMatch || idMatch;
  });

  // Check active unconsumed for target plan or full plan
  const activeOrder = myOrders.find(
    (o) => o.status === 'active' && !o.consumed && (o.planId === planId || o.planId === 'full')
  );
  if (activeOrder) return { status: 'active', order: activeOrder };

  // Check pending for target plan or full plan
  const pendingOrder = myOrders.find(
    (o) => o.status === 'pending' && (o.planId === planId || o.planId === 'full')
  );
  if (pendingOrder) return { status: 'pending', order: pendingOrder };

  // Check consumed
  const consumedOrder = myOrders.find(
    (o) => o.status === 'active' && o.consumed && (o.planId === planId || o.planId === 'full')
  );
  if (consumedOrder) return { status: 'consumed', order: consumedOrder };

  // Check rejected
  const rejectedOrder = myOrders.find(
    (o) => o.status === 'rejected' && (o.planId === planId || o.planId === 'full')
  );
  if (rejectedOrder) return { status: 'rejected', order: rejectedOrder };

  return { status: 'none' };
}

export function hasPlanAccess(requiredPlan: 'free' | 'numerology' | 'love' | 'full', email?: string | null): boolean {
  if (requiredPlan === 'free') return true;
  const statusInfo = getUserOrderStatus(requiredPlan, email);
  return statusInfo.status === 'active';
}

export function consumePlanOrder(
  planId: 'numerology' | 'love' | 'full',
  readingId?: string,
  email?: string | null
): MysticOrder | null {
  if (typeof window === 'undefined') return null;

  let effectiveEmail = email?.trim() || null;
  let effectivePhone: string | null = null;
  if (!effectiveEmail) {
    const savedEmail = localStorage.getItem('mystic_current_user_email');
    if (savedEmail) effectiveEmail = savedEmail.trim();
  }
  try {
    const savedAccount = localStorage.getItem('mystic_user_account');
    if (savedAccount) {
      const parsed = JSON.parse(savedAccount);
      if (!effectiveEmail && parsed.email) effectiveEmail = parsed.email.trim();
      if (parsed.phone) effectivePhone = String(parsed.phone).trim();
    }
  } catch {}

  const deviceIds = getDeviceOrderIds();
  const orders = getOrders();

  // Prefer consuming exact plan match first, then fallback to 'full'
  let targetIndex = orders.findIndex((o) => {
    if (o.status !== 'active' || o.consumed || o.planId !== planId) return false;
    const emailMatch = !!(effectiveEmail && o.userEmail?.toLowerCase() === effectiveEmail.toLowerCase());
    const idMatch = deviceIds.includes(o.id);
    return emailMatch || idMatch;
  });

  if (targetIndex === -1) {
    targetIndex = orders.findIndex((o) => {
      if (o.status !== 'active' || o.consumed || o.planId !== 'full') return false;
      const emailMatch = !!(effectiveEmail && o.userEmail?.toLowerCase() === effectiveEmail.toLowerCase());
      const idMatch = deviceIds.includes(o.id);
      return emailMatch || idMatch;
    });
  }

  let consumedOrder: MysticOrder | null = null;
  const nowStr = new Date().toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (targetIndex !== -1) {
    orders[targetIndex] = {
      ...orders[targetIndex],
      consumed: true,
      consumedAt: nowStr,
      consumedReadingId: readingId,
    };
    consumedOrder = orders[targetIndex];
    saveOrders(orders);
  }

  // Also sync consumption with backend server
  fetch('/api/orders/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: consumedOrder?.id,
      plan: planId,
      userEmail: effectiveEmail,
      userPhone: effectivePhone,
      readingId,
    }),
  }).catch(() => {});

  window.dispatchEvent(new Event('mystic_orders_updated'));
  return consumedOrder;
}


