const redirectToRandomOgImage: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const image = crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? 1 : 2;
  url.pathname = `/og/call-practice-${image}.png`;
  url.search = "";

  return new Response(null, {
    status: 302,
    headers: {
      location: url.toString(),
      "cache-control": "no-store, max-age=0",
    },
  });
};

export const onRequestGet = redirectToRandomOgImage;
export const onRequestHead = redirectToRandomOgImage;
