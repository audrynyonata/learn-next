## Next Shop

Built using:

- Create Next App
- Tailwind CSS
- Strapi (Headless CMS)
- Incremental Static Regeneration
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

1a. SSG (getStaticProps data fetching)

- server API not need to be exposed, even no need to be available besides build time
- data properties can be filtered, less network usage

* API data can be outdated/obsolete
  -> data fetch at build time
  build time: server render [products], page load: no server render, client render [products] (hydration)
  2a. Static + Client-side data fetching:
* server API must be exposed to public client
* full payload API data, large network usage

- always get latest API data
  build time: server render [], page load: no server render, client render [], client render [products]

1b. ISR (revalidate in getStaticProps data fetching)
getStaticProps(context) return { props: {a,b,c}, revalidate: 5 \* 60} // revalidate every 5 minutes (300 seconds)
-> can no longer use "export" for builds. must be deployed to node js server or serverless platform
-> does not work in dev mode, only production mode
At some point after the "revalidate" period has passed (after 300 seconds), the first request causes Next.js in server to call "getStaticProps" again and fetch new data, but it doesn't wait for the new data to arrive. Instead Next.js returns the old page to the client immediately so what is displayed on the page is still the old one.

In the background it will re-generate the page with the new data. If we reload the page once more this time we'll see the new data displayed in the page.
-> Next.js will do re-fetch & regeneration periodically at regular interval regardless there is an actual changes in data or not.
-> server-side/static HTML advantages but automatically regenerate, does not require manual build

1c. SSR (getServerSideProps data fetching)
-> traditional frameworks such as ruby on rails, PHP
-> does not work in dev mode, only production mode
-> Next.js re-fetch data on server everytime the page is reloaded.
-> server-side rendered but at runtime as opposed to rendered as static HTML on build time.

- always fetch updated API data

* response time is slower
* large network request
  build time: server render [products]. page load: server render [products], client render [products]
  -> In "dev" mode there is no difference between SSR, Static, SSG, ISR. they all work in the same way as "getServerSideProps".

2b. Client side fetching + Internal API route
pages > api > products.js
GET http://localhost:3000/api/products
-> filesystem-based routing
-> triggered on every request, like getServerSideProps function
export async function handler(req, res) {
const response = await fetch('http://localhost:1337/products');
const products = response.json();
res.status(200).json(products);
}

-> BFF: have an intermediate API that adapts the data coming from / proxy calls to an external API (ex: backend CMS API), ex: to only include the fields we need

| --  | ---                             | ----                                         | ---                                                                           |
| --- | ------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| 1a  | Static Generation               | getStaticProps                               | Data fetched on server at build time <br> Never updated                       |
| 1b  | Incremental Static Regeneration | getStaticProps + revalidate                  | Data fetched on server at build time <br> Updated every ${revalidate} seconds |
| 1c  | Server-side Rendering           | getServerSideProps                           | Data fetched on server at runtime <br> Updated at every request               |
| 2a  | Client-side                     | on component mount / useEffect               | Data fetched on client <br> Updated at every request                          |
| 2b  | Client-side + API route         | on component mount / useEffect + API handler | Data fetched on client <br> Updated at every request                          |

Trade-offs:

- build export only supported for 1a, 2a, 2b
- easily indexed by SEO, choose 1a, 1b, 1c bcos rendered at server

Same data for all users?

- Yes. ex: Shop products page
- Can the data change?
- - No: data is fixed. Static Generation
- - Yes: but changes will not show immediately. ISR
- No. ex: User profile page
- API accessibly by all browsers?
- - No: Client-side via API route
- - Yes: Client-side from external API

=====

Nested revalidation: must use same settings so to not confuse users
Something's happened on the server: we can see here that the HomePage was regenerated. But ProductPage was also re-rendered, and with the new data. In fact it re-rendered the ProductPage multiple times, once for each product.

So that's Next.js being clever. Even though we only requested the HomePage, Next.js detected that the HomePage contains links to all the products, so it revalidated the ProductPage as well.

=====

On-demand revalidation:
API route + Webhooks callback
A "webhook" is simply a URL we can call to notify another application when something happens.

- changes are immediately visible, bcos it gets regenerated as soon as we
  call "res.revalidate" in the API handler.

Strapi admin > settings > Create a webhook
name: Revalidate
url: http://localhost:3000/api/revalidate
events: Entry (CRUD, except Read)

export async function handleRevalidate(req, res) {
await res.revalidate('/'); // homepage
res.status(204).end();
}

======

Paths Fallback

when new entry is not included in getStaticPaths list
-fallback: false, Next.js will return 404
-fallback: 'blocking', When no such page is pre-generated, Next js re-render in server and a new page is generated while the client is waiting for the response (response is blocked/request is blocking)
If generate fail for whatever reason (ex: unhandled exception), Next.js will return 500

- with ISR, it's best to use fallback: blocking/true so not to show 404 for newly created entries
- In production mode: when page is open then revalidate: 30 has passed & the request to CMS fails, upon refresh, Next.js will keep displaying previous page to the user.
- In dev mode: be careful in API handling, ISR pages can break when revalidate if there is API error
  -fallback: true

====

img vs Image from 'next/image'
Image Optimization: automatically resize to match the dimensions we use in out pages, convert to modern, efficient format (WebP takes up less space compared to older JPEG), lazy load (loading only those that are currently visible on the screen)
-> on-demand: does not happen at build time
-> will cache generated images after they've been resized on-demand
-> enable to fetch image in next.config.js
const nextConfig = {
images: {
domains: ['localhost'], // CMS_URL
},
};

module.exports = nextConfig;

====
res.setHeaders('Set-Cookie', cookie.serialize('jwt', jwt, {
path: '/',
httpOnly: true,
maxAge: 3 _ 24 _ 3600 \* 1000))
expires: new Date(0) // 1 Jan 1970
.json({}); // 3 days, in milliseconds

httpOnly cookie can not be read from client side
must be on server
====
to push/redirect routes:
import {useRouter} from next/router;
====
SWR
React Hooks library for data fetching
stale-while-revalidate which is a reference to the fact that when you cache some data it will return the old or "stale" data while it refreshes or "revalidates" the data from the server.

in App:
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();
function App() {
return <QueryClientProvider client={queryClient}>
<Components {...props} />
</QueryClientProvider>
}

in Page:
import { useQuery } from 'react-query';
const query = useQuery('user', () => fetch(), {
staleTime: 30000 // milliseconds. default: 0. cache is valid for 30 seconds & expire after that
cacheTime: Infinity // milliseconds. tells when to remove cache to free up memory. ex: will cache the undefined value forever and not make additional request
refetchOnWindowFocus: true // default: true.
});
return query.data;

in custom hook:
import { useMutation } from 'react-query';
const mutation = useMutation((payload) => {
// fetch api
// return something
});

return async() {
await mutation.mutateAsync();
queryClient.setQueryData('user', user);
}

=====

Optimistic update
must avoid mutation
