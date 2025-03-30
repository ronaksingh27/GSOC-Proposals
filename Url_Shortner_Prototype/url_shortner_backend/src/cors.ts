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
  

  export  {corsHeaders,handleOptions};