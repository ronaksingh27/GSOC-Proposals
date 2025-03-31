
import  {Env}  from '../interfaces';
import {corsHeaders} from '../cors';


export default async function getEmail(shrortCode: string, env: Env) {
    if (!shrortCode) {
        return new Response(JSON.stringify({ error: "ShortCode is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    const data = await env.URL_STORE.get(shrortCode);
    console.log("data: ", data);
    if (!data) {
        return new Response(JSON.stringify({ error: "Invalid or Expired ShortCode" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    console.log("data: ", data);

    const { email, expiresAt } = JSON.parse(data);
    if (Date.now() > expiresAt) {
        await env.URL_STORE.delete(shrortCode);
        return new Response(JSON.stringify({ error: "ShortCode Expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    return email;
}