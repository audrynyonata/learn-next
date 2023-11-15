// Option 1b: fetch products on the server side
// but with Incremental Static Regeneration (in getStaticProps)
// and timeout-based revalidation

import Head from 'next/head';
import Title from '../components/title';
import { getProducts } from '../lib/products';

export async function getStaticProps() {
  const products = await getProducts();
  return {
    props: {
      products,
      revalidate: 5 * 60,
    },
  };
}

function Home({ products }) {
  console.log('home', products);
  return (
    <>
      <Head>
        <title>Next Shop</title>
      </Head>
      <main className="px-6 py-4">
        <Title>Next Shop</Title>
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.title}</li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default Home;
