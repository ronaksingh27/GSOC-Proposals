import {Env} from "./interfaces";
import { corsHeaders } from "./cors";

export default async function deleteAccount(authToken : string, env : Env){

    const tokenObj = await env.AUTH_TOKENS.get(authToken);
    if( !tokenObj ){
      return new Response(JSON.stringify({ error: "Invalid or Expired Token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
        ...corsHeaders
      });
    }
    const userEmail = JSON.parse(tokenObj).email;

    //Fetch the details of the user
    const userData = await env.USER_SHORTENED_URLS.get(userEmail);
    if( !userData )
    {
        throw new Error("User not found");
    }

    //Delete the user
    await env.USER_SHORTENED_URLS.delete(userEmail);
    
    //Delete Auth Tokesn , shortened urls and the clicks 
    const userObj = JSON.parse(userData);
    const shortenedUrls = userObj.map((user: any) =>{
        return user.shortCode;
    })
    await env.AUTH_TOKENS.delete(authToken);

    await Promise.all(shortenedUrls.map(async (shortUrl: string) => {
        await env.URL_STORE.delete(shortUrl);
        await env.CLICKS.delete(shortUrl);
    }));


}

