import { Resend } from 'resend';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (adjust as needed)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handleOptions(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function isValidEmail(email: any) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export interface Env {
  URL_STORE: KVNamespace;
  AUTH_TOKENS: KVNamespace;
  RESEND_API_KEY: string;
}

async function sendEmail(to: any, magicLink: string) {

  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['litrunner55@gmail.com'],
    subject: 'Hello World',
    html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Login to Your Account</h2>
          <p>Click the button below to log in:</p>
          <a href="${magicLink}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Log In
          </a>
          <p>If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }

  console.log('Magic Link sent:', data);
  console.log("magiclink: ", magicLink);
  return { success: true, data };
}

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

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    console.log(url);
    const pathname = url.pathname;

    console.log(pathname);

    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    if (request.method === "POST" && pathname === "/auth/request") {
      return handleMagicLinkRequest(request, env);
    }

    if (request.method === "GET" && pathname.startsWith("/auth/")) {
      const token = pathname.split("/auth/")[1];
      console.log(token);
      return handleAuthVerification(token, env);
    }

    if (request.method === "POST" && pathname === "/shorten") {
      return handleShorten(request, env);
    }

    console.log("redirect triggered");
    const shortId = pathname.substring(1);
    return handleRedirect(shortId, env);
  },
};

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

  // Redirect doesn't need CORS headers since it's not an XHR response,
  // but ensure preflight (OPTIONS) works for this endpoint
  return Response.redirect(url, 301);
}

function generateShortCode(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function isValidUrl(str: any) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}