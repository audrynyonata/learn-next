import { useMutation, useQuery } from 'react-query';
import { fetchJson } from '../lib/api';

const CART_ITEMS_QUERY_KEY = 'cartItems';

export function useCartItems() {
  const query = useQuery(CART_ITEMS_QUERY_KEY, () => fetchJson('/api/cart'));
  return query.data;
}

export function useAddToCart() {
  const mutation = useMutation(({ productId, quantity }) => {
    return fetchJson('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });
  });
  return {
    addToCart: async (productId, quantity) => {
      await mutation.mutateAsync({ productId, quantity });
    },
    addToCartError: mutation.isError,
    addToCartLoading: mutation.isLoading,
  };
}
