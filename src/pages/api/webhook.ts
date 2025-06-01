// curl -i -H "X-Webhook-Secret: sample-secret" http://localhost:4321/api/webhook -d '{"tags": ["test"]}'
// curl -i -H "X-Webhook-Secret: sample-secret" http://localhost:4321/api/webhook -d '{"tags": ["trumps-endorsement-didnt-help-these-candidates-one-bit"]}'

import { purgeCache } from "@netlify/functions";

export async function POST({ request }) {
  const body = await request.json();

  // See below for information on webhook security
  console.log(import.meta.env.WEBHOOK_SECRET);
  console.log(request.headers.get("X-Webhook-Secret"));
  if (request.headers.get("X-Webhook-Secret") !== import.meta.env.WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const options = { siteID: import.meta.env.NETLIFY_SITE_ID, token: import.meta.env.NETLIFY_API_TOKEN, tags: body.tags };

  // console.log(options)

  await purgeCache(options);

  return new Response(`Revalidated entry with tags ${body.tags}`, { status: 200 });
}