import { SystemPrompts } from "./types";

export const GENRES = [
  { value: "fantasy", label: "Fantasy", planning: "Focus on world-building, magic systems, and epic mythos.", writing: "Use rich, atmospheric descriptions. Employ archaic or elevated diction where appropriate. Focus on the magical and supernatural elements." },
  { value: "scifi", label: "Science Fiction", planning: "Focus on speculative technology, future societies, and scientific plausibility.", writing: "Maintain a tone of analytical wonder or dystopic tension. Use precise terminology for technology and setting." },
  { value: "mystery", label: "Mystery", planning: "Focus on clues, red herrings, and the central puzzle. Ensure the plot is tight.", writing: "Build suspense and suspicion. Reveal details gradually. Focus on the detective's observations." },
  { value: "thriller", label: "Thriller", planning: "Focus on high stakes, pacing, and ticking clocks.", writing: "Use short, punchy sentences. Keep the tension high and the pacing fast. Focus on action and immediate danger." },
  { value: "romance", label: "Romance", planning: "Focus on emotional arcs, chemistry, and relationship tropes.", writing: "Focus on internal monologues, emotional reactions, and sensory details of attraction. Prioritize the relationship dynamics." },
  { value: "horror", label: "Horror", planning: "Focus on fear, dread, and the uncanny.", writing: "Build dread through atmosphere and sensory details. Focus on the psychological impact of fear and the grotesque." },
  { value: "literary", label: "Literary Fiction", planning: "Focus on themes, character depth, and symbolism over plot mechanics.", writing: "Use sophisticated prose, metaphor, and deep character introspection. Prioritize style and subtext." },
  { value: "comedy", label: "Comedy", planning: "Focus on absurd situations, irony, and humorous misunderstandings.", writing: "Keep the tone light and witty. Focus on comedic timing, dialogue, and humorous observations." },
  { value: "historical", label: "Historical Fiction", planning: "Focus on period accuracy, historical events, and setting.", writing: "Use period-appropriate language and details. Immerse the reader in the specific time and place." },
  { value: "custom", label: "Custom - BYO Prompts", planning: "", writing: "" },
];

export const getGenreSpecificPrompts = (genreValue: string, basePrompts: SystemPrompts): SystemPrompts => {
  const genre = GENRES.find(g => g.value === genreValue);
  
  if (!genre || genre.value === 'custom') {
    return basePrompts;
  }

  // We append the genre instructions to the base prompts.
  // This works reasonably well even if the base prompt is in another language, 
  // as modern LLMs can handle mixed instructions (e.g., "Write in Spanish. Style: Fantasy").
  
  return {
    planning: `${basePrompts.planning}\n\nSTORY GENRE/STYLE: ${genre.label}\nINSTRUCTIONS: ${genre.planning}`,
    writing: `${basePrompts.writing}\n\nSTORY GENRE/STYLE: ${genre.label}\nINSTRUCTIONS: ${genre.writing}`
  };
};