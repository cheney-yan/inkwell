import { SystemPrompts } from "./types";

interface GenreDef {
  value: string;
  label: { [key: string]: string };
  planning: string;
  writing: string;
}

export const GENRE_DEFS: GenreDef[] = [
  { 
    value: "fantasy", 
    label: { en: "Fantasy", zh: "奇幻 (Fantasy)" }, 
    planning: "Focus on world-building, magic systems, and epic mythos.", 
    writing: "Use rich, atmospheric descriptions. Employ archaic or elevated diction where appropriate. Focus on the magical and supernatural elements." 
  },
  { 
    value: "scifi", 
    label: { en: "Science Fiction", zh: "科幻 (Sci-Fi)" }, 
    planning: "Focus on speculative technology, future societies, and scientific plausibility.", 
    writing: "Maintain a tone of analytical wonder or dystopic tension. Use precise terminology for technology and setting." 
  },
  { 
    value: "mystery", 
    label: { en: "Mystery", zh: "悬疑 (Mystery)" }, 
    planning: "Focus on clues, red herrings, and the central puzzle. Ensure the plot is tight.", 
    writing: "Build suspense and suspicion. Reveal details gradually. Focus on the detective's observations." 
  },
  { 
    value: "thriller", 
    label: { en: "Thriller", zh: "惊悚 (Thriller)" }, 
    planning: "Focus on high stakes, pacing, and ticking clocks.", 
    writing: "Use short, punchy sentences. Keep the tension high and the pacing fast. Focus on action and immediate danger." 
  },
  { 
    value: "romance", 
    label: { en: "Romance", zh: "言情 (Romance)" }, 
    planning: "Focus on emotional arcs, chemistry, and relationship tropes.", 
    writing: "Focus on internal monologues, emotional reactions, and sensory details of attraction. Prioritize the relationship dynamics." 
  },
  { 
    value: "horror", 
    label: { en: "Horror", zh: "恐怖 (Horror)" }, 
    planning: "Focus on fear, dread, and the uncanny.", 
    writing: "Build dread through atmosphere and sensory details. Focus on the psychological impact of fear and the grotesque." 
  },
  { 
    value: "literary", 
    label: { en: "Literary Fiction", zh: "文学 (Literary)" }, 
    planning: "Focus on themes, character depth, and symbolism over plot mechanics.", 
    writing: "Use sophisticated prose, metaphor, and deep character introspection. Prioritize style and subtext." 
  },
  { 
    value: "comedy", 
    label: { en: "Comedy", zh: "喜剧 (Comedy)" }, 
    planning: "Focus on absurd situations, irony, and humorous misunderstandings.", 
    writing: "Keep the tone light and witty. Focus on comedic timing, dialogue, and humorous observations." 
  },
  { 
    value: "historical", 
    label: { en: "Historical Fiction", zh: "历史 (Historical)" }, 
    planning: "Focus on period accuracy, historical events, and setting.", 
    writing: "Use period-appropriate language and details. Immerse the reader in the specific time and place." 
  },
  { 
    value: "custom", 
    label: { en: "Custom - BYO Prompts", zh: "自定义 (Custom)" }, 
    planning: "", 
    writing: "" 
  },
];

export const getGenres = (lang: string) => {
  // Fallback to 'en' if lang not found in label map
  const langKey = ["en", "zh"].includes(lang) ? lang : "en";
  return GENRE_DEFS.map(g => ({
    value: g.value,
    label: g.label[langKey] || g.label["en"]
  }));
};

export const getGenrePrompts = (genreValue: string, basePrompts: SystemPrompts): SystemPrompts => {
  const genre = GENRE_DEFS.find(g => g.value === genreValue);
  
  if (!genre || genre.value === 'custom') {
    return basePrompts;
  }

  return {
    planning: `${basePrompts.planning}\n\nSTORY GENRE/STYLE: ${genre.label.en}\nINSTRUCTIONS: ${genre.planning}`,
    writing: `${basePrompts.writing}\n\nSTORY GENRE/STYLE: ${genre.label.en}\nINSTRUCTIONS: ${genre.writing}`
  };
};