import { isValidEmail,generateToken } from './utils';
import sendEmail from './sendEmail';
import  {Env}  from './interfaces';
import {corsHeaders,handleOptions} from './cors';

async function handleMagicLinkRequest(request: Request, env: Env) {
    const { email } = (await request.json()) as { email: any };
    console.log("email : ", email);
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const token = generateToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
  
    await env.AUTH_TOKENS.put(token, JSON.stringify({ email, expiresAt }), { expirationTtl: 900 });
  
    const frontendUrl = `http://localhost:5173/auth/verify?token=${token}`;
    await sendEmail(email, frontendUrl);
  
    return new Response("Magic link sent. Check your email.", {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  
  async function handleAuthVerification(token: any, env: Env) {
    if (!token) {
      return new Response(JSON.stringify({ error: "Token is missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    const data = await env.AUTH_TOKENS.get(token);
    console.log("token : ", token);
    if (!data) {
      return new Response(JSON.stringify({ error: "Invalid or Expired Token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    console.log("data: ", data);
  
    const { email, expiresAt } = JSON.parse(data);
    if (Date.now() > expiresAt) {
      return new Response(JSON.stringify({ error: "Token Expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  
  
  export {handleAuthVerification,handleMagicLinkRequest};