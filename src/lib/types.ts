export interface StoryConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface SystemPrompts {
  planning: string;
  writing: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string; // Used for context in next chapters
}

export interface StoryPlan {
  title: string;
  genre: string;
  language: string;
  premise: string;
  characters: string;
  outline: string;
  totalChapters: number;
}

export interface StoryState {
  hasPlan: boolean;
  plan: StoryPlan;
  chapters: Chapter[];
  currentChapterIndex: number;
}

export const DEFAULT_PROMPTS: SystemPrompts = {
  planning: `You are an expert novelist and editor. Your task is to take a user's rough ideas and structure them into a comprehensive novel plan. 
Return the response as a valid JSON object with the following structure:
{
  "title": "Novel Title",
  "outline": "Detailed chapter-by-chapter outline...",
  "characters": "Refined character list with arcs...",
  "genre": "Genre",
  "language": "Language of the novel"
}
Ensure the outline provides enough narrative drive for a full book.`,
  writing: `You are a best-selling author. Write the next chapter of the novel based on the provided Plan and Previous Chapter Summary.
Style: Immersive, show-don't-tell, engaging prose.
Output ONLY the story content for this chapter. Do not include the title or "Chapter X".
Format with markdown for emphasis (*italics*, **bold**) if needed.`,
};