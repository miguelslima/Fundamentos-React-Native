import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@cart');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let newList = [];
      if (products.find(p => p.id === product.id)) {
        newList = products.map(item => {
          if (item.id === product.id) {
            item.quantity += 1;
          }
          return item;
        });
      } else {
        newList = [
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      setProducts(newList);

      await AsyncStorage.setItem('@cart', JSON.stringify(newList));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProds = products.map(p => {
        if (p.id === id) {
          p.quantity += 1;
        }
        return p;
      });
      setProducts(incrementProds);

      await AsyncStorage.setItem('@cart', JSON.stringify(incrementProds));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProds = products.map(p => {
        if (p.id === id) {
          if (!(p.quantity - 1)) {
            return p;
          }
          p.quantity -= 1;
        }
        return p;
      });
      setProducts(decrementProds);

      await AsyncStorage.setItem('@cart', JSON.stringify(decrementProds));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
