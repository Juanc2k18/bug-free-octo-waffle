export default {
  async fetch(request, env) {
    // CORS
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers
      });
    }

    try {
      const { message } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: "Message required" }), {
          status: 400,
          headers
        });
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

      return new Response(
        JSON.stringify({
          answer: data.content?.[0]?.text || "No response"
        }),
        { headers }
      );

    } catch (err) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers
      });
    }
  }
};
