// Option 2a: fetch products on the client side (in useEffect)
// directly from an external API
import Head from 'next/head';
import Title from '../components/title';
import { getProducts } from '../lib/products';
import { useEffect, useState } from 'react';

function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    // const API_URL = 'http://localhost:1337';
    // async function fetchProducts() {
    //   const res = await fetch(`${API_URL}/products`);
    //   const data = await res.json();
    //   setProducts(data);
    // }
    // fetchProducts();

    // fetch(`${API_URL}/products`)
    //   .then((res) => res.json())
    //   .then((products) => setProducts(products));

    getProducts().then((products) => setProducts(products));
  }, []);

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
