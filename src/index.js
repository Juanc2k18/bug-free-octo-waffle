export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json();
      const message = body.message;

      if (!message || typeof message !== "string") {
        return new Response(
          JSON.stringify({ error: "Message is required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      if (message.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Message too long" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "Anthropic API error"
          }),
          { status: response.status, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({
          answer: data.content?.[0]?.text || "No response"
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
