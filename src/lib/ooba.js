// Oobabooga API helper for QCM generation (calls backend API route)

/**
 * Generate QCM using oobabooga API (via backend)
 * @param {string} prompt - The prompt describing the QCM to generate
 * @returns {Promise<string>} - The raw text response from oobabooga
 */
export async function generateQCMWithOoba(prompt) {
  const res = await fetch('/api/generate-qcm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate QCM with oobabooga');
  }
  const data = await res.json();
  return data.text || '';
} 