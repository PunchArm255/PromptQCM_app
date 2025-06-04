// lib/openrouter.js
export async function generateQCMWithOpenRouter(prompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://promptqcm.vercel.app",
      "X-Title": "PromptQCM",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from OpenRouter API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
