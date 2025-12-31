export const extractChapterPlan = (outline: string[], chapterNum: number, lang: string): string => {
  if (!outline || !Array.isArray(outline)) return "";

  // Adjust for 0-based index
  const index = Math.floor(chapterNum) - 1;
  
  if (index >= 0 && index < outline.length) {
    return outline[index];
  }

  return "";
};