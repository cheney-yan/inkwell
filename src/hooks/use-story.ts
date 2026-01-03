import { useState, useEffect } from "react";
import { StoryConfig, StoryState, SystemPrompts, DEFAULT_PROMPTS, Chapter, StoryPlan, PROMPTS_MAP } from "@/lib/types";
import { generateCompletion } from "@/lib/openai";
import { toast } from "sonner";
import { getGenrePrompts } from "@/lib/genres";

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

  // System Prompts State (Global Defaults)
  const [prompts, setPrompts] = useState<SystemPrompts>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROMPTS);
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  // Story Content State
  const [story, setStory] = useState<StoryState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STORY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure outline is an array
      if (parsed.plan && typeof parsed.plan.outline === 'string') {
        parsed.plan.outline = parsed.plan.outline.split('\n').filter((line: string) => line.trim().length > 0);
      }
      return parsed;
    }
    return {
      hasPlan: false,
      plan: {
        title: "",
        genre: "",
        genreValue: "custom",
        language: "English",
        premise: "",
        characters: "",
        outline: [],
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
      const genreValue = inputs.genreValue || "custom";
      
      // Determine prompts: Use custom if set, otherwise derive from genre + global defaults
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const userPrompt = `
        Premise: ${inputs.premise}
        Desired Characters: ${inputs.characters}
        Target Language: ${targetLanguage}
        Genre: ${inputs.genre}
        Approximate Chapters: ${inputs.totalChapters}
      `;

      const result = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.planning },
        { role: "user", content: userPrompt },
      ]);

      let jsonString = result;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonString);

      // Ensure outline is array and clean up prefixes
      if (typeof parsed.outline === 'string') {
          parsed.outline = parsed.outline.split('\n').filter((l:string) => l.trim().length > 0);
      }
      
      if (Array.isArray(parsed.outline)) {
         parsed.outline = parsed.outline.map((line: string) => {
            return line.replace(/^\s*(?:(?:Chapter|Part|Cap[ií]tulo|Chapitre|Kapitel)\s+\d+|第\s*\d+\s*[章回]|\d+)\s*[.:：\-]?\s*/i, "");
         });
      }

      setStory((prev) => ({
        ...prev,
        hasPlan: true,
        plan: { ...prev.plan, ...inputs, ...parsed, language: targetLanguage, genreValue },
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
      // Determine if we are writing a new chapter or re-writing an empty one
      let targetIndex = story.chapters.length;
      let chapterNum = story.chapters.length + 1;
      
      // If current chapter is empty, we overwrite it
      if (story.currentChapterIndex >= 0 && story.chapters[story.currentChapterIndex] && !story.chapters[story.currentChapterIndex].content) {
          targetIndex = story.currentChapterIndex;
          chapterNum = targetIndex + 1;
      }

      const context = story.chapters.slice(Math.max(0, targetIndex - 2), targetIndex).map(c => `Chapter ${c.id} Summary: ${c.summary}`).join("\n");
      const genreValue = story.plan.genreValue || "custom";
      
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const outlineStr = Array.isArray(story.plan.outline) 
          ? story.plan.outline.map((item, idx) => `Chapter ${idx + 1}: ${item}`).join('\n')
          : story.plan.outline;

      const userPrompt = `
        Plan Context:
        Title: ${story.plan.title}
        Genre: ${story.plan.genre}
        Characters: ${story.plan.characters}
        Outline:
        ${outlineStr}
        
        Previous Context:
        ${context}

        Task: Write Chapter ${chapterNum}.
        Specific Instructions for this chapter: ${instructions || "Follow the outline."}
      `;

      const content = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.writing },
        { role: "user", content: userPrompt },
      ]);

      const summary = content.substring(0, 300) + "..."; 

      const newChapter: Chapter = {
        id: chapterNum.toString(),
        title: `Chapter ${chapterNum}`,
        content: content,
        summary: summary,
      };

      setStory((prev) => {
          const newChapters = [...prev.chapters];
          if (targetIndex < newChapters.length) {
              newChapters[targetIndex] = newChapter;
          } else {
              newChapters.push(newChapter);
          }
          return {
            ...prev,
            chapters: newChapters,
            currentChapterIndex: targetIndex,
          };
      });
      toast.success(`Chapter ${chapterNum} written!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to write chapter");
    } finally {
      setIsGenerating(false);
    }
  };

  const rewriteChapter = async (index: number, instructions: string) => {
    setIsGenerating(true);
    try {
      const chapterNum = index + 1;
      const context = story.chapters.slice(Math.max(0, index - 2), index).map(c => `Chapter ${c.id} Summary: ${c.summary}`).join("\n");
      const genreValue = story.plan.genreValue || "custom";
      
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const outlineStr = Array.isArray(story.plan.outline) 
          ? story.plan.outline.map((item, idx) => `Chapter ${idx + 1}: ${item}`).join('\n')
          : story.plan.outline;

      const userPrompt = `
        Plan Context:
        Title: ${story.plan.title}
        Genre: ${story.plan.genre}
        Characters: ${story.plan.characters}
        Outline:
        ${outlineStr}
        
        Previous Context:
        ${context}

        Task: REWRITE Chapter ${chapterNum}.
        Specific Instructions for this rewrite: ${instructions || "Follow the outline, but improve the prose."}
      `;

      const content = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.writing },
        { role: "user", content: userPrompt },
      ]);

      const summary = content.substring(0, 300) + "..."; 

      const newChapter: Chapter = {
        id: chapterNum.toString(),
        title: `Chapter ${chapterNum}`,
        content: content,
        summary: summary,
      };

      setStory((prev) => {
          const newChapters = [...prev.chapters];
          newChapters[index] = newChapter;
          return {
            ...prev,
            chapters: newChapters,
          };
      });
      toast.success(`Chapter ${chapterNum} rewritten!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to rewrite chapter");
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

  const deleteChapter = (index: number) => {
    setStory((prev) => {
      const isLast = index === prev.chapters.length - 1;
      
      if (isLast) {
         const newChapters = prev.chapters.slice(0, -1);
         let newIndex = prev.currentChapterIndex;
         if (newIndex >= newChapters.length) {
             newIndex = Math.max(-1, newChapters.length - 1);
         }
         return {
             ...prev,
             chapters: newChapters,
             currentChapterIndex: newIndex
         };
      } else {
          const newChapters = [...prev.chapters];
          newChapters[index] = {
              ...newChapters[index],
              content: "",
              summary: "" 
          };
          return {
              ...prev,
              chapters: newChapters
          };
      }
    });
    toast.success(index === story.chapters.length - 1 ? "Last chapter deleted." : "Chapter content cleared.");
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
              genreValue: "custom",
              language: "English",
              premise: "",
              characters: "",
              outline: [],
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
    
    text += `## Outline\n`;
    if (Array.isArray(outline)) {
        outline.forEach((item, idx) => {
            text += `${idx + 1}. ${item}\n`;
        });
    } else {
        text += outline + "\n";
    }
    text += `\n---\n\n`;

    story.chapters.forEach((chapter) => {
      text += `## ${chapter.title}\n\n${chapter.content}\n\n`;
    });

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_") || "story"}.md`;
    document.body.appendChild(<dyad-problem-report summary="2 problems">
<problem file="src/hooks/use-story.ts" line="302" column="22" code="1005">',' expected.</problem>
<problem file="src/hooks/use-story.ts" line="302" column="14" code="18004">No value exists in scope for the shorthand property 'current'. Either declare one or provide an initializer.</problem>
</dyad-problem-report><dyad-write path="src/hooks/use-story.ts" description="Fixed typo: 'current ChapterIndex' to 'currentChapterIndex'">
import { useState, useEffect } from "react";
import { StoryConfig, StoryState, SystemPrompts, DEFAULT_PROMPTS, Chapter, StoryPlan, PROMPTS_MAP } from "@/lib/types";
import { generateCompletion } from "@/lib/openai";
import { toast } from "sonner";
import { getGenrePrompts } from "@/lib/genres";

const STORAGE_KEY_STORY = "inkwell-story";
const STORAGE_KEY_CONFIG = "inkwell-config";
const STORAGE_KEY_PROMPTS = "inkwell-prompts-v3";

export const useStory = () => {
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

  const [prompts, setPrompts] = useState<SystemPrompts>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROMPTS);
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  const [story, setStory] = useState<StoryState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STORY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.plan && typeof parsed.plan.outline === 'string') {
        parsed.plan.outline = parsed.plan.outline.split('\n').filter((line: string) => line.trim().length > 0);
      }
      return parsed;
    }
    return {
      hasPlan: false,
      plan: {
        title: "",
        genre: "",
        genreValue: "custom",
        language: "English",
        premise: "",
        characters: "",
        outline: [],
        totalChapters: 12,
      },
      chapters: [],
      currentChapterIndex: -1,
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)), [config]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts)), [prompts]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_STORY, JSON.stringify(story)), [story]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(config.theme);
  }, [config.theme]);

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
      const genreValue = inputs.genreValue || "custom";
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const userPrompt = `
        Premise: ${inputs.premise}
        Desired Characters: ${inputs.characters}
        Target Language: ${targetLanguage}
        Genre: ${inputs.genre}
        Approximate Chapters: ${inputs.totalChapters}
      `;

      const result = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.planning },
        { role: "user", content: userPrompt },
      ]);

      let jsonString = result;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonString);

      if (typeof parsed.outline === 'string') {
          parsed.outline = parsed.outline.split('\n').filter((l:string) => l.trim().length > 0);
      }
      
      if (Array.isArray(parsed.outline)) {
         parsed.outline = parsed.outline.map((line: string) => {
            return line.replace(/^\s*(?:(?:Chapter|Part|Cap[ií]tulo|Chapitre|Kapitel)\s+\d+|第\s*\d+\s*[章回]|\d+)\s*[.:：\-]?\s*/i, "");
         });
      }

      setStory((prev) => ({
        ...prev,
        hasPlan: true,
        plan: { ...prev.plan, ...inputs, ...parsed, language: targetLanguage, genreValue },
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
      let targetIndex = story.chapters.length;
      let chapterNum = story.chapters.length + 1;
      
      if (story.currentChapterIndex >= 0 && story.chapters[story.currentChapterIndex] && !story.chapters[story.currentChapterIndex].content) {
          targetIndex = story.currentChapterIndex;
          chapterNum = targetIndex + 1;
      }

      const context = story.chapters.slice(Math.max(0, targetIndex - 2), targetIndex).map(c => `Chapter ${c.id} Summary: ${c.summary}`).join("\n");
      const genreValue = story.plan.genreValue || "custom";
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const outlineStr = Array.isArray(story.plan.outline) 
          ? story.plan.outline.map((item, idx) => `Chapter ${idx + 1}: ${item}`).join('\n')
          : story.plan.outline;

      const userPrompt = `
        Plan Context:
        Title: ${story.plan.title}
        Genre: ${story.plan.genre}
        Characters: ${story.plan.characters}
        Outline:
        ${outlineStr}
        
        Previous Context:
        ${context}

        Task: Write Chapter ${chapterNum}.
        Specific Instructions for this chapter: ${instructions || "Follow the outline."}
      `;

      const content = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.writing },
        { role: "user", content: userPrompt },
      ]);

      const summary = content.substring(0, 300) + "..."; 

      const newChapter: Chapter = {
        id: chapterNum.toString(),
        title: `Chapter ${chapterNum}`,
        content: content,
        summary: summary,
      };

      setStory((prev) => {
          const newChapters = [...prev.chapters];
          if (targetIndex < newChapters.length) {
              newChapters[targetIndex] = newChapter;
          } else {
              newChapters.push(newChapter);
          }
          return {
            ...prev,
            chapters: newChapters,
            currentChapterIndex: targetIndex,
          };
      });
      toast.success(`Chapter ${chapterNum} written!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to write chapter");
    } finally {
      setIsGenerating(false);
    }
  };

  const rewriteChapter = async (index: number, instructions: string) => {
    setIsGenerating(true);
    try {
      const chapterNum = index + 1;
      const context = story.chapters.slice(Math.max(0, index - 2), index).map(c => `Chapter ${c.id} Summary: ${c.summary}`).join("\n");
      const genreValue = story.plan.genreValue || "custom";
      const effectivePrompts = story.plan.customPrompts || getGenrePrompts(genreValue, prompts);
      
      const outlineStr = Array.isArray(story.plan.outline) 
          ? story.plan.outline.map((item, idx) => `Chapter ${idx + 1}: ${item}`).join('\n')
          : story.plan.outline;

      const userPrompt = `
        Plan Context:
        Title: ${story.plan.title}
        Genre: ${story.plan.genre}
        Characters: ${story.plan.characters}
        Outline:
        ${outlineStr}
        
        Previous Context:
        ${context}

        Task: REWRITE Chapter ${chapterNum}.
        Specific Instructions for this rewrite: ${instructions || "Follow the outline, but improve the prose."}
      `;

      const content = await generateCompletion(config, [
        { role: "system", content: effectivePrompts.writing },
        { role: "user", content: userPrompt },
      ]);

      const summary = content.substring(0, 300) + "..."; 

      const newChapter: Chapter = {
        id: chapterNum.toString(),
        title: `Chapter ${chapterNum}`,
        content: content,
        summary: summary,
      };

      setStory((prev) => {
          const newChapters = [...prev.chapters];
          newChapters[index] = newChapter;
          return {
            ...prev,
            chapters: newChapters,
          };
      });
      toast.success(`Chapter ${chapterNum} rewritten!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to rewrite chapter");
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

  const deleteChapter = (index: number) => {
    setStory((prev) => {
      const isLast = index === prev.chapters.length - 1;
      
      if (isLast) {
         const newChapters = prev.chapters.slice(0, -1);
         let newIndex = prev.currentChapterIndex;
         if (newIndex >= newChapters.length) {
             newIndex = Math.max(-1, newChapters.length - 1);
         }
         return {
             ...prev,
             chapters: newChapters,
             currentChapterIndex: newIndex
         };
      } else {
          const newChapters = [...prev.chapters];
          newChapters[index] = {
              ...newChapters[index],
              content: "",
              summary: "" 
          };
          return {
              ...prev,
              chapters: newChapters
          };
      }
    });
    toast.success(index === story.chapters.length - 1 ? "Last chapter deleted." : "Chapter content cleared.");
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
              genreValue: "custom",
              language: "English",
              premise: "",
              characters: "",
              outline: [],
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
    
    text += `## Outline\n`;
    if (Array.isArray(outline)) {
        outline.forEach((item, idx) => {
            text += `${idx + 1}. ${item}\n`;
        });
    } else {
        text += outline + "\n";
    }
    text += `\n---\n\n`;

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

  const exportJson = () => {
    const data = {
        story,
        config: { ...config, apiKey: "" }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.plan.title.replace(/\s+/g, "_") || "story"}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Story data exported!");
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
    rewriteChapter,
    editChapter,
    deleteChapter,
    navigateChapter,
    resetStory,
    clearChapters,
    downloadStory,
    exportJson,
    isGenerating,
  };
};