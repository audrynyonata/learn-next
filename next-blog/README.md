#### next-blog

https://audrynyonata-next-blog.netlify.app/

Node version: v18  
Next.js version: 14 (using pages router)

## Next.js vs. CRA

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

Dev mode: Fast refresh. (This acts same as getServerSideProps)

- No build time. 1x pre-render on server (every page load) + 1x render in client (every page load).

Prod mode:

- Static, SSG: 1x pre-render on server (build time) + 1x render in client (every page load).
- ISG:
  - with timeout-based revalidate: 1x pre-render on server (build time + 1x re-render on server (first request after timeout period) + 1x render old-page in client (every page load). 1x render new-page in client (every page load) happen on the next requests after the first and onwards.
  - with webhooks / on-demand revalidate: 1x pre-render on server (build time) + 1x re-render new-page on server (on webhook event) + 1x render new-page in client (every page load).
- SSR: 1x pre-render on server (build time) + 1x pre-render on server (every page load) + 1x render in client (every page load).

## Static vs SSG vs SSG + Client-side rendering

1. Static: HTML, CSS, JS, React components without getStaticPaths & getStaticProps
2. SSG:

   ```
   export async getStaticPaths()
     return { paths: [{params: a, b, c}], fallback: false/true/blocking}

   export async getStaticProps(context)
     return { props: a, b, c, revalidate: 30 // (optional) ISR: 30 seconds }
   ```

3. Client-side:
   - Server pre-render: use default hook value
   - Client render: hydration. use actual hook and attach event handler for user interaction (except client-side navigation bcos it already works outside of hydration)
   - No server re-render on page refresh
   - May need client feature detection in server (ex: localStorage, window, etc.) and `suppressHydrationWarning` props (ex: different text in DOM element)

## Deployment

| Deployment                    | Full features?     | Example                                                                                         | Notes                                                                                                                                                 |
| ----------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js platform (Serverless) | ✔️                 | Vercel, Netifly                                                                                 | Open platform & sign up using GitHub                                                                                                                  |
| Run on Node server            | ✔️                 | - Cloud: Amazon EC2, GCP, Microsoft Azure, DigitalOcean <br>- On Premise: ssh to some remote IP | Install node & run next app<br><br>npx next start -p 80 // node server                                                                                |
| Static host                   | Static export only | Firebase, Amazon S3, Google Cloud Storage                                                       | Upload exported html assets via sftp                                                                                                                  |
| Run on web server             | Static export only | nginx, caddy                                                                                    | Build & serve<br><br> npm run build<br> npx next export -o dist // no longer work in Next v14. export distDir in nextConfig instead<br>npx serve dist |

P.S. : Statically built & exported website: means no SSR / ISR, no revalidate, fallback: true is not supported when using output: 'export'.
