import { OutlineItem } from "./types";

export const extractChapterPlan = (outline: OutlineItem[], chapterNum: number): string => {
  if (!outline || !Array.isArray(outline)) return "";

  // chapterNum is 1-based index (e.g. Chapter 1 is index 0)
  const index = Math.floor(chapterNum) - 1;

  if (index >= 0 && index < outline.length) {
      const item = outline[index];
      return `${item.title}: ${item.description}`;
  }

  return "";
};