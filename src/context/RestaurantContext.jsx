import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTableForDashboard, setSelectedTableForDashboard] = useState(null);

  // Fetch all shared data from unified backend
  const refreshAll = useCallback(async () => {
    try {
      const [resRes, ordersRes, menuRes, offersRes, invRes, reviewsRes] = await Promise.allSettled([
        fetch('/api/reservations').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/menu').then(r => r.json()),
        fetch('/api/offers').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json())
      ]);

      if (resRes.status === 'fulfilled' && resRes.value?.success) {
        setReservations(resRes.value.reservations || resRes.value.contacts || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        setOrders(ordersRes.value.orders || []);
      }
      if (menuRes.status === 'fulfilled' && menuRes.value?.success) {
        setMenuItems(menuRes.value.items || []);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value?.success) {
        setCoupons(offersRes.value.offers || []);
      }
      if (invRes.status === 'fulfilled' && invRes.value?.success) {
        setInventory(invRes.value.items || []);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success) {
        setReviews(reviewsRes.value.reviews || []);
      }
    } catch (err) {
      console.warn('Refresh all warning:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and periodic polling for real-time synchronization (every 8s)
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 8000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // WebSocket real-time events support
  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;
          if (type === 'NEW_ORDER' && data) {
            setOrders(prev => [data, ...prev.filter(o => o.id !== data.id)]);
          } else if (type === 'ORDER_STATUS_CHANGED' && data) {
            setOrders(prev => prev.map(o => o.id === data.id ? { ...o, status: data.status } : o));
          } else if (type === 'NEW_REVIEW' && data) {
            setReviews(prev => [data, ...prev.filter(r => r.id !== data.id)]);
          } else if (type === 'INVENTORY_UPDATED' && data) {
            setInventory(prev => {
              const idx = prev.findIndex(i => i.id === data.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = data;
                return updated;
              }
              return [...prev, data];
            });
          } else if (type === 'RESERVATION_CREATED' && data) {
            setReservations(prev => [data, ...prev.filter(r => r.id !== data.id)]);
          } else if (type === 'RESERVATION_UPDATED' && data) {
            setReservations(prev => prev.map(r => r.id === data.id ? { ...r, ...data } : r));
          } else if (type === 'RESERVATION_DELETED' && data) {
            setReservations(prev => prev.filter(r => r.id !== data.id));
          } else if (type === 'MENU_ITEM_ADDED' && data) {
            setMenuItems(prev => [data, ...prev.filter(m => m.id !== data.id)]);
          } else if (type === 'MENU_ITEM_UPDATED' && data) {
            setMenuItems(prev => prev.map(m => m.id === data.id ? data : m));
          } else if (type === 'MENU_ITEM_DELETED' && data) {
            setMenuItems(prev => prev.filter(m => m.id !== data.id));
          } else if (type === 'OFFERS_UPDATED') {
            fetch('/api/offers').then(r => r.json()).then(d => d.success && setCoupons(d.offers));
          }
        } catch {
          // ignore ws parse error
        }
      };
    } catch {
      // ignore offline ws
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // ----------------------------------------------------
  // PART 1 ACTIONS: RESERVATIONS
  // ----------------------------------------------------
  const createReservation = async (reservationData) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create reservation');
      }
      const created = data.reservation || data.contact;
      if (created) {
        setReservations(prev => [created, ...prev.filter(r => r.id !== created.id)]);
      }
      return { success: true, reservation: created };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateReservation = async (id, updateData) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update reservation');
      }
      const updated = data.reservation || data.contact;
      setReservations(prev => prev.map(r => r.id === Number(id) ? { ...r, ...updated } : r));
      return { success: true, reservation: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const cancelReservation = async (id) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel reservation');
      }
      setReservations(prev => prev.filter(r => r.id !== Number(id)));
      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // PART 2 ACTIONS: MENU, COUPONS, INVENTORY & REVIEWS
  // ----------------------------------------------------
  const addMenuItem = async (itemData) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add menu item');
      }
      setMenuItems(prev => [data.item, ...prev.filter(i => i.id !== data.item.id)]);
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateMenuItem = async (id, itemData) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update menu item');
      }
      setMenuItems(prev => prev.map(i => i.id === id ? data.item : i));
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete menu item');
      }
      setMenuItems(prev => prev.filter(i => i.id !== id));
      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createCoupon = async (couponData) => {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create coupon');
      }
      setCoupons(prev => [data.offer, ...prev.filter(c => c.id !== data.offer.id)]);
      return { success: true, offer: data.offer };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCoupon = async (id) => {
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete coupon');
      }
      setCoupons(prev => prev.filter(c => c.id !== id));
      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addInventoryItem = async (invData) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add inventory item');
      }
      setInventory(prev => [data.item, ...prev.filter(i => i.id !== data.item.id)]);
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateInventoryItem = async (id, invData) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update inventory item');
      }
      setInventory(prev => prev.map(i => i.id === id ? data.item : i));
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const restockInventory = async (id, addAmount) => {
    try {
      const res = await fetch(`/api/inventory/${id}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_amount: addAmount })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to restock item');
      }
      setInventory(prev => prev.map(i => i.id === id ? data.item : i));
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete inventory item');
      }
      setInventory(prev => prev.filter(i => i.id !== id));
      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const submitReview = async (reviewData) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }
      if (data.review) {
        setReviews(prev => [data.review, ...prev.filter(r => r.id !== data.review.id)]);
      }
      return { success: true, review: data.review };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const placeTableOrder = async (orderPayload) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }
      if (data.order) {
        setOrders(prev => [data.order, ...prev.filter(o => o.id !== data.order.id)]);
        // Also refresh inventory as stock may have decremented
        fetch('/api/inventory').then(r => r.json()).then(inv => inv.success && setInventory(inv.items));
      }
      return { success: true, order: data.order };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      return { success: true, orderId, status: newStatus };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    reservations,
    orders,
    menuItems,
    coupons,
    inventory,
    reviews,
    loading,
    error,
    refreshAll,
    selectedTableForDashboard,
    setSelectedTableForDashboard,
    createReservation,
    updateReservation,
    cancelReservation,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createCoupon,
    deleteCoupon,
    addInventoryItem,
    updateInventoryItem,
    restockInventory,
    deleteInventoryItem,
    submitReview,
    placeTableOrder,
    updateOrderStatus
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
