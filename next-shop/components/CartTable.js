import { useMutation, useQueryClient } from 'react-query';
import Button from './Button';
import { fetchJson } from '../lib/api';

function formatCurrency(value) {
  return '$' + value.toFixed(2);
}

function buildCart(cartItems) {
  let total = 0;
  const items = [];
  for (const cartItem of cartItems) {
    const itemTotal = cartItem.product.price * cartItem.quantity;
    total += itemTotal;
    items.push({ ...cartItem, total: itemTotal });
  }
  return { items, total };
}

function CartTable({ cartItems }) {
  const queryClient = useQueryClient();
  const cart = buildCart(cartItems);

  const removeMutation = useMutation(({ itemId }) =>
    fetchJson('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId }),
    })
  );

  const updateMutation = useMutation(({ itemId, quantity }) =>
    fetchJson('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, quantity }),
    })
  );

  const handleUpdateQuantity = async (itemId, quantity) => {
    await updateMutation.mutateAsync({ itemId, quantity });
    queryClient.setQueryData('cartItems', (old) => {
      const findIndex = old.findIndex((item) => item.id === itemId);
      return [
        ...old.slice(0, findIndex),
        {
          ...old[findIndex],
          quantity,
        },
        ...old.slice(findIndex + 1),
      ];
    });
  };

  const handleRemoveItem = async (itemId) => {
    await removeMutation.mutateAsync({ itemId });
    queryClient.setQueryData('cartItems', (old) =>
      old.filter((item) => item.id !== itemId)
    );
  };

  return (
    <table>
      <thead>
        <tr>
          <th className="px-4 py-2">Product</th>
          <th className="px-4 py-2">Price</th>
          <th className="px-4 py-2">Quantity</th>
          <th className="px-4 py-2">Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {cart.items.map((cartItem) => (
          <tr key={cartItem.id}>
            <td className="px-4 py-2">{cartItem.product.title}</td>
            <td className="px-4 py-2 text-right">
              {formatCurrency(cartItem.product.price)}
            </td>
            <td className="px-4 py-2 text-right">
              <input
                type="number"
                min="1"
                className="border rounded px-3 py-1 mr-2 w-16 text-right"
                value={cartItem.quantity.toString()}
                onChange={(e) =>
                  handleUpdateQuantity(cartItem.id, parseInt(e.target.value))
                }
              />
            </td>
            <td className="px-4 py-2 text-right">
              {formatCurrency(cartItem.total)}
            </td>
            <td className="px-4 py-2 text-right">
              {removeMutation.isLoading ? (
                <p>Loading...</p>
              ) : (
                <Button onClick={() => handleRemoveItem(cartItem.id)}>
                  Remove
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th className="px-4 py-2 text-left">Total</th>
          <th></th>
          <th></th>
          <th className="px-4 py-2 text-right">{formatCurrency(cart.total)}</th>
        </tr>
      </tfoot>
    </table>
  );
}

export default CartTable;
