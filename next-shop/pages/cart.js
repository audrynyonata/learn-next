import CartTable from '../components/CartTable';
import Page from '../components/Page';
import { useCartItems } from '../hooks/cart';

function CartPage() {
  const cartItems = useCartItems();
  return (
    <Page title="Cart">{cartItems && <CartTable cartItems={cartItems} />}</Page>
  );
}

export default CartPage;
