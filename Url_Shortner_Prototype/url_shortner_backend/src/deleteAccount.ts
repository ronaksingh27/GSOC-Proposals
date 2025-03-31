import {Env} from "./interfaces";
import { corsHeaders } from "./cors";

export default async function deleteAccount(authToken: string, env: Env) {
    try {
        const tokenObj = await env.AUTH_TOKENS.get(authToken);
        console.log("token obj ",tokenObj);
        if (!tokenObj) {
            return new Response(JSON.stringify({ error: "Invalid or Expired Token" }), {
                status: 401,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const userEmail = JSON.parse(tokenObj).email;

        // Fetch the user's URLs
        const userData = await env.USER_DETAILS.get(userEmail);
        if (!userData) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        // Delete user-related data
        await env.USER_DETAILS.delete(userEmail);
        await env.AUTH_TOKENS.delete(authToken);

        // Parse the list of shortened URLs in URL_STORE and delete them
        const userObj = JSON.parse(userData);
        const shortenedCodes = userObj.map((user: any) => user.shortCode);

        await Promise.all(shortenedCodes.map(async (shortUrl: string) => {
            await env.URL_STORE.delete(shortUrl);
            await env.CLICKS.delete(shortUrl);
        }));

        return new Response(JSON.stringify({ message: "Account and all associated data deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }
}
