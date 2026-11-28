// vanessagershbein.com/learn: serves the Learning Hub on this domain.
//
// The hub lives in its own repo (vanessagershbein-123/learning-hub) and deploys on its own to
// vanessa-learning-hub.netlify.app. This Cloudflare Pages Function fetches each hub page from there and
// serves it under /learn/, so the address bar stays on vanessagershbein.com. The hub only uses relative
// links, so it works under /learn/ unchanged.
//
// Pages are cached at Cloudflare's edge for 5 minutes, so a hub update shows up here within about
// 5 minutes of going live on Netlify, and repeat visits don't count against Netlify's bandwidth.

const HUB = "https://vanessa-learning-hub.netlify.app";
const CACHE_SECONDS = 300;

export async function onRequest({ request }) {
  const url = new URL(request.url);

  // /learn -> /learn/ so the hub's relative links resolve from the right folder.
  if (url.pathname === "/learn") {
    return Response.redirect(`${url.origin}/learn/${url.search}`, 301);
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const path = url.pathname.slice("/learn".length) || "/";
  const upstream = await fetch(HUB + path + url.search, {
    method: request.method,
    redirect: "manual",
    cf: { cacheEverything: true, cacheTtl: CACHE_SECONDS },
  });

  // Keep any redirect from the hub inside /learn on this domain.
  const location = upstream.headers.get("Location");
  if (location) {
    const target = new URL(location, HUB);
    const to = target.origin === HUB ? `${url.origin}/learn${target.pathname}${target.search}` : target.href;
    const status = [301, 302, 303, 307, 308].includes(upstream.status) ? upstream.status : 302;
    return Response.redirect(to, status);
  }

  const res = new Response(upstream.body, upstream);
  res.headers.delete("set-cookie");
  return res;
}
