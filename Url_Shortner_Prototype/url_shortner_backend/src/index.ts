import { Env } from './interfaces';
import {handleOptions} from './cors';
import { handleMagicLinkRequest,handleAuthVerification } from './auth';
import handleShorten from './shorten';
import handleRedirect from './redirect';

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
