import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

// الحد الأقصى للكمية = قيمة stock المخزّنة مع المنتج (لو غير موجودة نعتبرها بلا حد)
function getStock(item) {
  return typeof item.stock === "number" ? item.stock : Infinity;
}

// قراءة آمنة من localStorage: لو البيانات تالفة أو ليست مصفوفة نرجع [] بدل ما يتعطل التطبيق
function readStoredArray(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Ignoring corrupted "${key}" data in localStorage`, error);
    return [];
  }
}

function CartProvider({ children }) {
  // Favorites
  const [favorites, setFavorites] = useState(() =>
    readStoredArray("favoritesItems"),
  );

  const addToFavorites = (item) => {
    setFavorites((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  useEffect(() => {
    localStorage.setItem("favoritesItems", JSON.stringify(favorites));
  }, [favorites]);

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((i) => i.id !== id));
  };

  // cart
  const [cartItems, setCartItems] = useState(() =>
    readStoredArray("cartItems"),
  );

  // increaseQuantity
  const increaseQuantity = (id) => {
    const current = cartItems.find((item) => item.id === id);

    if (current && current.quantity >= getStock(current)) {
      toast.error(`Only ${getStock(current)} of ${current.title} left in stock`);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        return item.quantity < getStock(item)
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      }),
    );
  };

  // decreaseQuantity
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const addToCart = (item) => {
    const stock = getStock(item);

    if (stock <= 0) {
      toast.error(`${item.title} is out of stock`);
      return false;
    }

    const existingItem = cartItems.find((i) => i.id === item.id);

    if (existingItem && existingItem.quantity >= stock) {
      toast.error(`Only ${stock} of ${item.title} left in stock`);
      return false;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === item.id);

      if (existing) {
        if (existing.quantity >= getStock(existing)) return prevItems;

        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });

    return true;
  };

  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        addToFavorites,
        favorites,
        removeFromFavorites,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export default CartProvider;
