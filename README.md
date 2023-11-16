## Next Shop

Featuring:

- Create Next App (pages router)
- Tailwind CSS
- Strapi (Headless CMS)
- Data Fetching
- API Routes
- Responsive Design
- Authentication (JWT + cookies)
- React Query

Initial setup:

```
npm install next react react-dom cookie react-query

npx create-next-app next-shop

# TypeScript integration (optional)
npm install --save-dev @types/react
next dev // will automatically create tsconfig.json

# Tailwind CSS integration (optional)
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Backend setup:

```
npx create-strapi-app next-shop-backend --quickstart

npm install
npm run build
npm start

# http://localhost:1337/admin
# email: admin@example.com
# password: Admin123
```

# Next.js vs. CRA

in DevTools > Network Tab (filter: Doc):
| Next | CRA |
| ----| ----|
| Doc contains body + scripts | Doc contains empty html |
| Pre-render in server + Client-render (ReactDOM.hydrate) | Client-render only (ReactDOM.render) |
| Button functionality does not work when js is disabled, client-side navigation will fallback to traditional browser navigation (every Next/Link has &lt;a&gt; under the hood) | Whole site does not work when js is disabled |
| Client-side navigation: has html + json generated at build time, but only served if the route is being requested. Once all routes have been fetched, it will act as a standard SPA | SPA: Client will have entire application bundle at once |
| import Link from Next/Link <br>`<Link href='' />` | import { Link } from react-router <br> `<Link to='' />`|
| Benefits: Faster load pages (not waiting for js execution), Allow crawling, SEO rank |

P.S. : both uses client-side navigation (most known for being used in single page applciation)

- Traditional browser navigation: &lt;a&gt;. Re-request doc.
- Client-side navigation: No new doc request, update window.location & page content using JS only.

## Dev Mode (Fast refresh) vs. Production Mode

Dev mode: Fast refresh. In dev mode there is no difference between Static, SSG, ISR, SSR. they all work in the same way as "getServerSideProps".

- No build time. pre-render on server (every page load) then re-render / hydrate in client (every page load).

Production Mode: support SSG, ISR, SSR rendering strategy

- Static, SSG: pre-render on server (build time) then hydrate in client (every page load).
- ISR:
  - with timeout-based revalidate: pre-render on server (build time), trigger background re-render on server (first request after timeout period), hydrate old-page in client. then on the next requests after that hydrate new-page in client (every page load)
  - with webhooks / on-demand revalidate: pre-render on server (build time), trigger re-render on server (on webhook event), immediately gets new-page and hydrate in client (every page load).
- SSR: pre-render on server (build time), then re-render on server (every page load) and hydrate in client (every page load).

## Pre-rendering and Hydration

1. Server pre-render used default hook value
2. Client render/hydration used actual hook and attach event handler for user interaction (except client-side navigation bcos it already works outside of hydration)
3. No server re-render on page refresh
4. May need client feature detection in server (ex: localStorage, window, etc.) and `suppressHydrationWarning` props (ex: different text in DOM element)

## Data Fetching Options
|     |                                 |                                              | |
| --- | ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **1a**  | Static Generation               | getStaticProps                               | - Data fetched on server at build time <br> - Never updated                                            |
| **1b**  | Incremental Static Regeneration | getStaticProps + revalidate                  | - Data fetched on server at build time <br> - Updated every ${revalidate} seconds or on webhooks event |
| **1c**  | Server-side Rendering           | getServerSideProps                           | - Data fetched on server at runtime <br> - Updated at every request                                    |
| **2a**  | Client-side                     | on component mount / useEffect               | - Data fetched on client <br> - Updated at every request                                               |
| **2b**  | Client-side + API route         | on component mount / useEffect + API handler | - Data fetched on client <br> - Updated at every request                                               |

0\. Static: HTML + JS + assets, React components without getStaticProps

1a. SSG (getStaticProps)

```
export async getStaticPaths()
  return { paths: [{params: a, b, c}], fallback: false/true/blocking}

export async getStaticProps(context)
  return { props: a, b, c, revalidate: 30 // (optional) ISR: 30 seconds }
```

(+) external API do not need to be exposed, even don't need to be available besides build time  
(+) data properties can be filtered, less network usage  
(-) API data can be outdated/obsolete because using data fetched at build time

1b. ISR (getStaticProps with revalidate)  
(-) can no longer use "export" for builds. must be deployed to node js server or serverless platform  
(-) timeout-based revalidate does not reflects changes instantly. When server does revalidate it doesn't wait for the new data to arrive. Instead it returns the old page to the client immediately while in the background it re-generate the page with the new data. If we reload the page once more this time we'll see the new data displayed in the page.  
(-) Next.js will do re-fetch and regeneration periodically at regular interval regardless there is an actual changes in data or not.  
(+) server-side/static HTML advantages but automatically regenerate, does not require manual build

1c. SSR (getServerSideProps)

```
export async getServerSideProps(context)
  return { props: a, b, c }
```

-> works like traditional frameworks such as ruby on rails, PHP  
-> server-side rendered but at runtime as opposed to rendered as static HTML on build time.  
-> Next.js re-fetch data everytime the page is reloaded.  
(-) heavier load on server  
(-) response time is slower  
(-) large network request  
(+) always fetch updated data

2a. Client-side data fetching + External API:  
(-) server API must be exposed to public client  
(-) full API payload, large network usage  
(+) always get latest API data

2b. Client side fetching + Internal API routes  
-> Backend-for-frontend approach / BFF: have an intermediate API that acts as adapter (ex: to only include the fields we need) for data coming from / to an external API (ex: backend CMS API)  
(+) server API do not need to be exposed to public client  
(+) data properties can be filtered, less network usage  
(+) always get latest API data

Trade-offs:

- Build mode=export only supported for 1a / 2a / 2b
- To be easily indexed by SEO choose 1a / 1b / 1c

Decision making:

```
Is same data for all users?
  | Yes. ex: Shop products page
  | Can the data change?
      |-> No, data is fixed: 1a. Static Generation
      |-> Yes, but changes will not show immediately: 1b. ISR
  | No. ex: User profile page
  | Is API accessibly by all browsers?
      |-> No: 2b. Client-side + API route
      |-> Yes: 2a. Client-side + external API
```

## Incremental Static Regeneration

Nested revalidation:

- Nested pages (pages showing data of the same collection) must use same revalidate settings so not to confuse users.
- When client tries to open homepage and Next.js revalidate it on the server, all the product page is also re-rendered with new data, because the HomePage contains links to all of the ProductPage, so it revalidated them as well.

On-demand revalidation: API route + Webhooks callback

- A "webhook" is simply a URL we can call to notify another application when something happens.
- Strapi admin > settings > Create a webhook
  - name: Revalidate
  - url: http://localhost:3000/api/revalidate
  - events: Entry (CRUD, except Read)
- Changes are immediately visible, it regenerated as soon as we call `res.revalidate` in the API handler.

```
export async function handleRevalidate(req, res) {
    await res.revalidate('/'); // homepage
    res.status(204).end();
}
```

## Paths Fallback

When new entry is not included in getStaticPaths list / no such page is pre-generated.

- fallback: false, Next.js will return 404 page.
- fallback: 'blocking'

  - response is blocked/request is blocking. Next.js will re-render in server and generate a new page, client will wait and get the newly generated page.
  - If generate fail for whatever reason (ex: unhandled exception), Next.js will return 500 page.

- fallback: true. Next.js will return the “fallback” version of a page.
  - the page’s props will be empty.
  - router.isFallback will be true if the fallback version is being rendered.

P.S. :

- With ISR, it's best to use fallback: blocking/true so not to show 404 for newly added entries.
- In dev mode: error in API can cause ISR pages to break on next revalidate.
- In production mode: If page is open successfully once, then the next revalidate fails (ex: response error from CMS), Next.js will keep displaying previous page to the user.

## Deployment

| Deployment                    | Support Next.js full features? | Example                                                                                         | Notes                                                                                                                                                 |
| ----------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js platform (Serverless) | ✔️                             | Vercel, Netifly                                                                                 | Open platform & sign up using GitHub                                                                                                                  |
| Run on Node server            | ✔️                             | - Cloud: Amazon EC2, GCP, Microsoft Azure, DigitalOcean <br>- On Premise: ssh to some remote IP | Install node & run next app<br><br>npx next start -p 80 // node server                                                                                |
| Static host                   | Static export only             | Firebase, Amazon S3, Google Cloud Storage                                                       | Upload exported html assets via sftp                                                                                                                  |
| Run on web server             | Static export only             | nginx, caddy                                                                                    | Build & serve<br><br> npm run build<br> npx next export -o dist // no longer work in Next v14. export distDir in nextConfig instead<br>npx serve dist |

P.S. : Statically built & exported website (output: 'export'): means no SSR / ISR, no revalidate, no image optimization, and `fallback: 'blocking' / true` is not supported.

## API Routes

- filesystem-based routing
- triggered on every request, like getServerSideProps function

in pages > api > products.js:

```
// GET http://localhost:3000/api/products

async function handler(req, res) {
  const response = await fetch('http://localhost:1337/products');
  const products = response.json();
  res.status(200).json(products);
}

export default handler;
```

## &lt;img&gt; vs Image from 'next/image'

Image Optimization:

1. Automatically resize to match the dimensions we use in our pages
2. Convert to modern, efficient format (WebP takes up less space compared to older format JPEG)
3. Lazy load (loading only those that are currently visible on the screen)

P.S. :

- Specify width and height
- On-demand: image optimization does not happen at build time
- Will cache generated images after they've been resized on-demand
- Need to configure enable fetch image in next.config.js

```
module.exports = {
  images: { domains: ['localhost'] // CMS_URL },
};
```

## Cookie

Setting cookie string is not trivial. Use `cookie.serialize`.

P.S. : `httpOnly` cookie can not be read from client side, so requests using this cookie must be on server. use API routes for this.

```
res.setHeaders('Set-Cookie', cookie.serialize('jwt', jwt, {
    path: '/',
    httpOnly: true,
    maxAge: 3 * 24 * 3600 * 1000, // milliseconds. ex: 3 days
    expires: new Date(0) // 1 Jan 1970
  })
).json({});
```

## Next Router

To push/redirect routes:

```
import { useRouter } from next/router;
const router = useRouter();

router.push('/'); // replace, reload, etc.
```

## SWR (Stale-While-Revalidate)

Stale-while-revalidate: cache will return old or "stale" data while it refreshes or "revalidates" the data from the server. ex: SWR, react-query.

in \_app.js:

```
import { QueryClient, QueryClientProvider } from 'react-query';

function App() {
const queryClient = new QueryClient();
return (
    <QueryClientProvider client={queryClient}>
        <Components {...props} />
    </QueryClientProvider>
  );
}
```

in some page:

```
import { useQuery } from 'react-query';

const query = useQuery('user', async () => {
  // await fetch api
  // return data
  // or return promise (without async/await)
  }, {
    staleTime: 30000 // milliseconds. default: 0. cache is valid for 30 seconds & expire after that
    cacheTime: Infinity // milliseconds. tells when to remove cache to free up memory. ex: will cache value=undefined forever and not make additional request
    refetchOnWindowFocus: true // default: true
  });

return query.data;
```

in custom hook:

```

import { useMutation } from 'react-query';
const mutation = useMutation((payload) => {
  // fetch api
  // return promise
});

return async() {
  await mutation.mutateAsync(payload);
  // optimistic update (optional)
}

```

## Optimistic update

For after API calls finished. Avoid direct mutation.

- ex: Append item / push

```
queryClient.setQueryData('cartItems', (old) =>
[...old, new]
);
```

- ex: Update item / insert into index

```
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
```

- ex: Remove item

```
queryClient.setQueryData('cartItems', (old) =>
  old.filter((item) => item.id !== itemId)
);
```
