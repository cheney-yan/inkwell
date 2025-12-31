import { OutlineItem } from "./types";

export const extractChapterPlan = (outline: OutlineItem[] | string, chapterNum: number, lang: string): string => {
  // Handle Legacy String format
  if (typeof outline === 'string') {
     return extractLegacyChapterPlan(outline, chapterNum);
  }

  // Handle Structured Array format
  if (Array.isArray(outline)) {
      // 1-based index to 0-based
      const index = chapterNum - 1;
      if (index >= 0 && index < outline.length) {
          const item = outline[index];
          return `${item.title}: ${item.description}`;
      }
  }

  return "";
};

// Legacy string parsing logic (kept for backward compatibility during migration)
const extractLegacyChapterPlan = (outline: string, chapterNum: number): string => {
  if (!outline) return "";
  const num = Math.floor(chapterNum);
  const patterns = [
    new RegExp(`(?:Chapter|Capítulo|Chapitre|Kapitel)\\s+${num}[:\\.]\\s*([\\s\\S]*?)(?=(?:Chapter|Capítulo|Chapitre|Kapitel)\\s+\\d+|$)`, 'i'),
    new RegExp(`^${num}\\.\\s*([\\s\\S]*?)(?=(?:^|\\n)\\d+\\.|$)`, 'm'),
    new RegExp(`(?:第)\\s*${num}\\s*(?:章)[:\\uff1a]\\s*([\\s\\S]*?)(?=(?:第)\\s*\\d+\\s*(?:章)|$)`, 'i'),
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

export const parseLegacyOutline = (outline: string): OutlineItem[] => {
    if (!outline) return [];
    
    // Very basic splitter for legacy text blocks to attempt migration
    // Splits by "Chapter X" or just newlines if that fails
    const items: OutlineItem[] = [];
    const lines = outline.split('\n').filter(l => l.trim().length > 0);
    
    // Simple heuristic: treat every non-empty line as a potential chapter if no clear markers
    lines.forEach((line, idx) => {
        items.push({
            id: crypto.randomUUID(),
            title: `Chapter ${idx + 1}`,
            description: line.trim()
        });
    });
    
    return items;
};

function getChineseNumeral(num: number): string {
  const map: Record<number, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
  return map[num] || num.toString();
}

function getAllChineseNumerals(): string {
  return "一二三四五六七八九十";
}