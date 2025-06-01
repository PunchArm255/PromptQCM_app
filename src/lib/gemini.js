// Gemini API helper for QCM generation (calls backend API route)

/**
 * Generate QCM using Gemini API (via backend)
 * @param {string} prompt - The prompt describing the QCM to generate
 * @returns {Promise<string>} - The raw text response from Gemini
 */
export async function generateQCMWithGemini(prompt) {
  const res = await fetch('/api/generate-qcm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate QCM with Gemini');
  }
  const data = await res.json();
  return data.text || '';
} 