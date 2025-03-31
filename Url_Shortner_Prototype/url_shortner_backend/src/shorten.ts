import { Env } from './interfaces';
import {corsHeaders} from './cors';
import {isValidUrl,generateShortCode} from './utils';
import { CLOUDFLARE_URL } from './urls';


async function handleShorten(request: Request, env: Env) {

    //Checks for Header
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
  
    //Promise is an object that represents the eventual result of an async operation
    //HERE IDK
    const body = (await request.json()) as { url: string; expiresIn: number };
    const longUrl = body.url;
    const expiresIn = body.expiresIn;
  
    if (!longUrl || !isValidUrl(longUrl)) {
      return new Response("Invalid URL", {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const existingShortCode = await env.URL_STORE.get(`long:${longUrl}`);
    const shortUrl = `${CLOUDFLARE_URL}/${existingShortCode}`;
    if (existingShortCode) {
      return new Response(JSON.stringify({ shortUrl }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const shortCode = generateShortCode();
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
    
    //update URL_STORE
    const urlStoreData = JSON.stringify({ longUrl, expiresAt });
    await env.URL_STORE.put(shortCode, urlStoreData);

    const userEmail = await env.AUTH_TOKENS.get(token);
    if (!userEmail) {
      return new Response("User email not found", {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const userDetailsData = JSON.stringify({shortCode,shortUrl, longUrl});
    await env.USER_DETAILS.put(userEmail, userDetailsData);

    //initialize CLICKS
    await env.CLICKS.put(shortCode, JSON.stringify({ clicks: "0" }));
  
    return new Response(JSON.stringify({ shortUrl, expiresAt }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }


  export default handleShorten;