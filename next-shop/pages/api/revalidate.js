async function handleRevalidate(req, res) {
  // console.log('/api/revalidate received:', req.body);
  const event = req.body;
  if (event.model === 'product') {
    const { id } = event.entry;

    // sequential
    // await res.revalidate('/'); // homepage
    // await res.revalidate(`/products/${id}`); // product detail page

    // parallel
    await Promise.all([res.revalidate('/'), res.revalidate(`/products/${id}`)]);
  }
  res.status(204).end();
}

export default handleRevalidate;
