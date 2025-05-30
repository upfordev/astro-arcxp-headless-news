export async function GET({ request }) {
  const { searchParams } = new URL(request.url);

  const imageUrl = searchParams.get('url');
  const width = parseInt(searchParams.get('width') || '768', 10);
  const quality = parseInt(searchParams.get('quality') || '80', 10);

  if (!imageUrl || !imageUrl.startsWith('https://')) {
    return new Response('Invalid or missing `url` parameter. Must be a full HTTPS URL.', {
      status: 400,
    });
  }

  try {
    const imageRes = await fetch(imageUrl, {
      cf: {
        image: {
          width,
          quality,
          fit: 'cover',
        },
      },
    });

    if (!imageRes.ok) {
      return new Response(`Failed to fetch image: ${imageRes.status}`, {
        status: 502,
      });
    }

    // Clone the response so we can read headers + stream body
    const headers = new Headers(imageRes.headers);
    headers.set('Cache-Control', 'public, max-age=604800, immutable'); // 7 days

    return new Response(imageRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response('Unexpected error fetching image.', {
      status: 500,
    });
  }
}
