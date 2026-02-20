const BLOCKED_WORDS = [
  "merda",
  "porra",
  "caralho",
  "puta",
  "fdp",
  "filho da puta",
  "desgraca",
  "arrombado",
  "vagabundo",
  "idiota",
  "imbecil",
  "burro",
  "otario",
  "cuzao",
  "babaca",
  "viado",
  "bosta",
  "foda-se",
  "foder",
  "piranha",
]

export function containsProfanity(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  return BLOCKED_WORDS.some((word) => {
    const normalizedWord = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    return normalized.includes(normalizedWord)
  })
}

export function filterProfanity(text: string): string {
  let filtered = text
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  BLOCKED_WORDS.forEach((word) => {
    const normalizedWord = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    const regex = new RegExp(normalizedWord, "gi")
    if (regex.test(normalized)) {
      const originalRegex = new RegExp(word, "gi")
      filtered = filtered.replace(originalRegex, "*".repeat(word.length))
    }
  })

  return filtered
}
