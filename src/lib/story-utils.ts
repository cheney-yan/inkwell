export const extractChapterPlan = (outline: string, chapterNum: number, lang: string): string => {
  if (!outline) return "";

  // normalized chapter number (ensure it's an integer)
  const num = Math.floor(chapterNum);

  // Define regex patterns for different languages
  const patterns = [
    // Standard "Chapter 1:", "Capítulo 1:", etc.
    new RegExp(`(?:Chapter|Capítulo|Chapitre|Kapitel)\\s+${num}[:\\.]\\s*([\\s\\S]*?)(?=(?:Chapter|Capítulo|Chapitre|Kapitel)\\s+\\d+|$)`, 'i'),
    // "1. ", "2. " format
    new RegExp(`^${num}\\.\\s*([\\s\\S]*?)(?=(?:^|\\n)\\d+\\.|$)`, 'm'),
    // Chinese/Japanese "第1章" or "第一章" (handling basic 1-10 mapping for chinese numerals if needed, but keeping it simple for now)
    new RegExp(`(?:第)\\s*${num}\\s*(?:章)[:\\uff1a]\\s*([\\s\\S]*?)(?=(?:第)\\s*\\d+\\s*(?:章)|$)`, 'i'),
    // Fallback for Chinese numerals (1-10)
    new RegExp(`(?:第)\\s*[${getChineseNumeral(num)}]\\s*(?:章)[:\\uff1a]\\s*([\\s\\S]*?)(?=(?:第)\\s*[${getAllChineseNumerals()}]\\s*(?:章)|$)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = outline.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
};

function getChineseNumeral(num: number): string {
  const map: Record<number, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
  return map[num] || num.toString();
}

function getAllChineseNumerals(): string {
  return "一二三四五六七八九十";
}