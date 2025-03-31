
import { Env } from './interfaces';
import {corsHeaders} from './cors';

async function handleRedirect(shortCode: any, env: Env) {
    const data = await env.URL_STORE.get(shortCode);
    if (!data) {
      return new Response("URL Not Found", {
        status: 404,
        headers: { ...corsHeaders }, // Add CORS headers here
      });
    }
  
    const { url, expiresAt } = JSON.parse(data);
  
    if (expiresAt && Date.now() > expiresAt) {
      await env.URL_STORE.delete(shortCode);
      return new Response("This URL has expired", {
        status: 410,
        headers: { ...corsHeaders }, // Add CORS headers here
      });
    }

    const clicks : string = await env.CLICKS.get(shortCode) || "0";
    const click_count = clicks ? parseInt(clicks) + 1 : 1;
    await env.CLICKS.put(shortCode,click_count.toString()); 

  
    // Redirect doesn't need CORS headers since it's not an XHR response,
    // but ensure preflight (OPTIONS) works for this endpoint
    return Response.redirect(url, 301);
  }
  
  export default handleRedirect;
  