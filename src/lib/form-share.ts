import type { FormTemplate } from "./types"

/**
 * Encodes a form template into a base64 string for URL sharing.
 * This allows the form to be shared via URL without needing server-side storage.
 */
export function encodeFormForURL(form: FormTemplate): string {
  const payload = {
    id: form.id,
    name: form.name,
    questions: form.questions,
  }
  const json = JSON.stringify(payload)
  // Use encodeURIComponent to handle unicode then btoa for base64
  return btoa(encodeURIComponent(json))
}

/**
 * Decodes a base64 form payload from a URL back into a partial FormTemplate.
 * Returns null if decoding fails.
 */
export function decodeFormFromURL(
  encoded: string
): Pick<FormTemplate, "id" | "name" | "questions"> | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const parsed = JSON.parse(json)
    if (parsed && parsed.id && parsed.name && Array.isArray(parsed.questions)) {
      return {
        id: parsed.id,
        name: parsed.name,
        questions: parsed.questions,
      }
    }
    return null
  } catch {
    return null
  }
}
