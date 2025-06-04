// lib/openrouter.js
export async function generateQCMWithOpenRouter(userPrompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const systemPrompt = `You are an AI QCM (multiple-choice question) generator. Your only job is to generate QCMs based on the user's instructions. If the user asks for anything else, politely refuse and say: 'Sorry, I can only generate QCMs.'

When generating a QCM, strictly follow this format for each question:

1. <Question text>
A) <Option 1>
B) <Option 2>
C) <Option 3>
D) <Option 4>
Answer: <A/B/C/D>

If the user requests code snippets, include them in Markdown code blocks (triple backticks) inside the question text. Do not add explanations or extra text. Only output the QCM in the above format.`;

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from OpenRouter API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
