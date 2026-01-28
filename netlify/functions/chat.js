export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Who is Kanan Pandit?\n\nUser question:\n${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        raw: data
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
}
