// lib/openrouter.js
export async function generateQCMWithOpenRouter(userPrompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const systemPrompt = `You are a multilingual AI QCM (multiple-choice question) generator, specialized for SMI (Sciences Mathématiques et Informatique) university students. Your only job is to generate QCMs based on the user's instructions, in the language of the user's prompt. The user can ask for a QCM in natural language, in French, English, or Arabic, and you must understand and respond accordingly. If the user asks for anything else, politely refuse and say: 'Sorry, I can only generate QCMs.' (in the user's language).

You are highly familiar with SMI modules such as: Analyse 1/2/3, Python, Algorithmique, Java, Systèmes d'exploitation, Probabilités, Algèbre, Recherche Opérationnelle, and all other SMI program modules. Generate QCMs that are accurate and relevant to these subjects, with realistic questions and options.

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
      model: "meta-llama/llama-3.1-8b-instruct:free",
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
