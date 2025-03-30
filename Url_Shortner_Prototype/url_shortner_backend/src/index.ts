import { Env } from './interfaces';
import {corsHeaders, handleOptions} from './cors';
import { handleMagicLinkRequest,handleAuthVerification } from './auth';
import handleShorten from './shorten';
import handleRedirect from './redirect';
import deleteAccount from './deleteAccount';

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

    if( request.method === "DELETE" && pathname === "/deleteAccount"){

      //get Email of token User
      const token = pathname.split("/deleteAccount/")[1];
      return deleteAccount(token, env);
    }

    console.log("redirect triggered");
    const shortId = pathname.substring(1);
    return handleRedirect(shortId, env);
  },
};
