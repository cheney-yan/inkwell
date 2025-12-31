import { OutlineItem } from "./types";

export const extractChapterPlan = (outline: OutlineItem[], chapterNum: number, lang: string): string => {
  if (!outline || !Array.isArray(outline)) return "";

  // chapterNum is 1-based, array is 0-based
  const index = chapterNum - 1;
  
  if (index >= 0 && index < outline.length) {
    const item = outline[index];
    // Return a combination of title and description
    return `${item.title}: ${item.description}`;
  }

  return "";
};