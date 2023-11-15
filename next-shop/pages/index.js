// Final option: fetch products on the server side
// but with Incremental Static Regeneration (in getStaticProps)
// and on-demand / webhook revalidation

import Page from '../components/Page';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../lib/products';

// const products = [
//   { id: 1, title: 'First Product' },
//   { id: 2, title: 'Second Product' },
// ];

export async function getStaticProps() {
  const products = await getProducts();
  return {
    props: {
      products,
    },
    // revalidate: parseInt(process.env.REVALIDATE_SECONDS)
  };
}

function Home({ products }) {
  return (
    <Page title="Indoor Plants">
      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Page>
  );
}

export default Home;
