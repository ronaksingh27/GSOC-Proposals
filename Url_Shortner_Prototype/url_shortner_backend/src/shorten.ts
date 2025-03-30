import { Env } from './interfaces';
import {corsHeaders} from './cors';
import {isValidUrl,generateShortCode} from './utils';


async function handleShorten(request: Request, env: Env) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Invalid Authentication", {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const token = authHeader.split("Bearer ")[1];
    const authData = await env.AUTH_TOKENS.get(token);
    if (!authData) {
      return new Response("Invalid Authentication", {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const body = (await request.json()) as { url: string; expiresIn: number };
    const url = body.url;
    const expiresIn = body.expiresIn;
  
    if (!url || !isValidUrl(url)) {
      return new Response("Invalid URL", {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const existingShortCode = await env.URL_STORE.get(`long:${url}`);
    if (existingShortCode) {
      return new Response(JSON.stringify({ shortUrl: `https://short-it.litrunner55.workers.dev/${existingShortCode}` }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const shortCode = generateShortCode();
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
  
    const data = JSON.stringify({ url, expiresAt });
    await env.URL_STORE.put(shortCode, data);
  
    return new Response(JSON.stringify({ shortUrl: `https://short-it.litrunner55.workers.dev/${shortCode}`, expiresAt }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }


  export default handleShorten;