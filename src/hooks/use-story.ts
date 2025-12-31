import { useState, useEffect } from "react";
import { StoryConfig, StoryState, SystemPrompts, DEFAULT_PROMPTS, Chapter, StoryPlan, PROMPTS_MAP } from "@/lib/types";
import { generateCompletion } from "@/lib/openai";
import { toast } from "sonner";

const STORAGE_KEY_STORY = "inkwell-story";
const STORAGE_KEY_CONFIG = "inkwell-config";
const STORAGE_KEY_PROMPTS = "inkwell-prompts-v3";

export const useStory = () => {
  // Configuration State
  const [config, setConfig] = useState<StoryConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    const defaults = { 
        apiKey: "", 
        baseUrl: "https://api.openai.com/v1", 
        model: "gpt-4o",
        uiLanguage: "en",
        theme: "light" as const
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  // System Prompts State (Debug Mode)
  const [prompts, setPrompts] = useState<SystemPrompts>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROMPTS);
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  // Story Content State
  const [story, setStory] = useState<StoryState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STORY);
    return saved
      ? JSON.parse(saved)
      : {
          hasPlan: false,
          plan: {
            title: "",
            genre: "",
            language: "English",
            premise: "",
            characters: "",
            outline: "",
            totalChapters: 12,
          },
          chapters: [],
          currentChapterIndex: -1,
        };
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)), [config]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts)), [prompts]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_STORY, JSON.stringify(story)), [story]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(config.theme);
  }, [config.theme]);

  // Actions
  const updateConfig = (newConfig: StoryConfig) => {
    if (newConfig.uiLanguage !== config.uiLanguage) {
        const newPrompts = PROMPTS_MAP[newConfig.uiLanguage] || DEFAULT_PROMPTS;
        setPrompts(newPrompts);
        toast.info(`Language changed to ${newConfig.uiLanguage.toUpperCase()}`);
    }
    setConfig(newConfig);
  };

  const updatePrompts = (newPrompts: SystemPrompts) => setPrompts(newPrompts);

  const generatePlan = async (inputs: Partial<StoryPlan>) => {
    setIsGenerating(true);
    try {
      const targetLanguage = config.uiLanguage; 
      
      const userPrompt = `
        Premise: ${inputs.premise}
        Desired Characters: ${inputs.characters}
        Target Language: ${targetLanguage}
        Approximate Chapters: ${inputs.totalChapters}
      `;

      const result = await generateCompletion(config, [
        { role: "system", content: prompts.planning },
        { role: "user", content: userPrompt },
      ]);

      let jsonString = result;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonString);

      setStory((prev) => ({
        ...prev,
        hasPlan: true,
        plan: { ...prev.plan, ...inputs, ...parsed, language: targetLanguage },
      }));
      toast.success("Story plan generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to parse plan. Check API key or Model output.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePlan = (newPlan: StoryPlan) => {
    setStory((prev) => ({ ...prev, plan: newPlan }));
  };

  const generateChapter = async (instructions: string) => {
    setIsGenerating(true);
    try {
      const chapterNum = story.chapters.length + 1;
      const context = story.chapters.slice(-2).map(c => `Chapter ${c.id} Summary: ${c.summary}`).join("\n");
      
      const userPrompt = `
        Plan Context:
        Title: ${story.plan.title}
        Characters: ${story.plan.characters}
        Outline: ${story.plan.outline}
        
        Previous Context:
        ${context}

        Task: Write Chapter ${chapterNum}.
        Specific Instructions for this chapter: ${instructions || "Follow the outline."}
      `;

      const content = await generateCompletion(config, [
        { role: "system", content: prompts.writing },
        { role: "user", content: userPrompt },
      ]);

      const summary = content.substring(0, 300) + "..."; 

      const newChapter: Chapter = {
        id: chapterNum.toString(),
        title: `Chapter ${chapterNum}`,
        content: content,
        summary: summary,
      };

      setStory((prev) => ({
        ...prev,
        chapters: [...prev.chapters, newChapter],
        currentChapterIndex: prev.chapters.length, // Point to the new chapter
      }));
      toast.success(`Chapter ${chapterNum} written!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to write chapter");
    } finally {
      setIsGenerating(false);
    }
  };

  const editChapter = (index: number, newContent: string) => {
    setStory((prev) => {
      const updatedChapters = [...prev.chapters];
      if (updatedChapters[index]) {
        updatedChapters[index] = {
          ...updatedChapters[index],
          content: newContent,
        };
      }
      return { ...prev, chapters: updatedChapters };
    });
  };

  const navigateChapter = (direction: "next" | "prev") => {
    setStory((prev) => {
      let nextIndex = prev.currentChapterIndex + (direction === "next" ? 1 : -1);
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= prev.chapters.length) nextIndex = prev.chapters.length - 1;
      return { ...prev, currentChapterIndex: nextIndex };
    });
  };

  const resetStory = () => {
    if (confirm("Are you sure? This will delete the current story.")) {
        setStory({
            hasPlan: false,
            plan: {
              title: "",
              genre: "",
              language: "English",
              premise: "",
              characters: "",
              outline: "",
              totalChapters: 12,
            },
            chapters: [],
            currentChapterIndex: -1,
        });
        toast.success("Story reset.");
    }
  };

  const clearChapters = () => {
      setStory(prev => ({
          ...prev,
          chapters: [],
          currentChapterIndex: -1
      }));
      toast.success("Chapters cleared. Ready to start writing from scratch.");
  };

  const downloadStory = () => {
    const { title, characters, outline } = story.plan;
    let text = `# ${title}\n\n`;
    text += `## Characters\n${characters}\n\n`;
    text += `## Outline\n${outline}\n\n`;
    text += `---\n\n`;

    story.chapters.forEach((chapter) => {
      text += `## ${chapter.title}\n\n${chapter.content}\n\n`;
    });

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_") || "story"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Story downloaded!");
  };

  return {
    config,
    updateConfig,
    prompts,
    updatePrompts,
    story,
    updatePlan,
    generatePlan,
    generateChapter,
    editChapter,
    navigateChapter,
    resetStory,
    clearChapters,
    downloadStory,
    isGenerating,
  };
};