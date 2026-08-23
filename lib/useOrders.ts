"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export interface OrderItem {
  name: string;
  quantity?: number;
  line_price_ngn?: number;
  image_url?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface Order {
  id: string;
  order_identifier: string | null;
  items: OrderItem[];
  total_ngn: number;
  status: string;
  monei_transaction_ref: string | null;
  created_at: string;
}

export interface CheckoutInfoUsed {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  delivery_or_pickup?: string;
  notes?: string;
}

export interface PaymentDetailsUsed {
  bank_name?: string;
  account_number?: string;
  amount_ngn?: number;
  reference?: string;
}

export interface OrderDetail extends Order {
  checkout_info: CheckoutInfoUsed | null;
  payment_details: PaymentDetailsUsed | null;
}

export function useOrders(token: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  return { orders, loading };
}

export function useOrderDetail(token: string | null, orderId: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => data && setOrder(data))
      .finally(() => setLoading(false));
  }, [token, orderId]);

  return { order, loading, notFound };
}