export interface StoryPlan {
  title: string;
  genre: string;
  language: string; // Target language for the story text
  premise: string;
  characters: string;
  outline: string;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string;
}

export interface StoryState {
  hasPlan: boolean;
  plan: StoryPlan;
  chapters: Chapter[];
  currentChapterIndex: number;
}

export interface SystemPrompts {
  planning: string;
  writing: string;
}

export interface StoryConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  uiLanguage: string;
  theme: "light" | "dark";
}

export const DEFAULT_PROMPTS: SystemPrompts = {
  planning: `You are an expert novelist. Your task is to create a detailed, chapter-by-chapter outline for a novel based on the user's premise.
  
  Output a JSON object with this structure:
  {
    "title": "Novel Title",
    "genre": "Genre",
    "outline": "Chapter 1: ... \nChapter 2: ...",
    "characters": "refined character list"
  }
  
  Make the outline detailed enough to guide the writing process.`,
  writing: `You are a creative fiction writer. Write the requested chapter based on the story plan and previous context.
  
  Focus on showing, not telling. detailed sensory descriptions, and realistic dialogue. 
  Output only the story content (Markdown formatted). Do not include "Here is the chapter" or conversational filler.`,
};

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
];

export const PROMPTS_MAP: Record<string, SystemPrompts> = {
  en: DEFAULT_PROMPTS,
  es: {
    planning: "Eres un novelista experto. Tu tarea es crear un esquema detallado capítulo por capítulo...",
    writing: "Eres un escritor de ficción creativa. Escribe el capítulo solicitado basado en el plan...",
  },
  fr: {
    planning: "Vous êtes un romancier expert. Votre tâche est de créer un plan détaillé...",
    writing: "Vous êtes un écrivain de fiction créative. Écrivez le chapitre demandé...",
  },
  de: {
    planning: "Du bist ein erfahrener Romanautor. Erstelle eine detaillierte Gliederung...",
    writing: "Du bist ein kreativer Schriftsteller. Schreibe das angeforderte Kapitel...",
  },
  zh: {
    planning: "你是一位专家小说家。你的任务是根据用户的前提创建一个详细的逐章大纲...",
    writing: "你是一位创意小说作家。根据故事计划和以前的背景编写请求的章节...",
  },
  ja: {
    planning: "あなたは熟練した小説家です。ユーザーの前提に基づいて、詳細な章ごとのアウトラインを作成してください...",
    writing: "あなたは創造的な小説家です。ストーリープランと以前のコンテキストに基づいて、要求された章を書いてください...",
  },
};

export const UI_LABELS: Record<string, any> = {
  en: { general: "General", api: "API Config", prompts: "Prompts", theme: "Theme", lang: "Language", dark: "Dark", light: "Light", export: "Export Settings", import: "Import Settings" },
  es: { general: "General", api: "Config API", prompts: "Prompts", theme: "Tema", lang: "Idioma", dark: "Oscuro", light: "Claro", export: "Exportar Config", import: "Importar Config" },
  fr: { general: "Général", api: "Config API", prompts: "Prompts", theme: "Thème", lang: "Langue", dark: "Sombre", light: "Clair", export: "Exporter", import: "Importer" },
  de: { general: "Allgemein", api: "API Konfig", prompts: "Prompts", theme: "Thema", lang: "Sprache", dark: "Dunkel", light: "Hell", export: "Einstellungen exportieren", import: "Einstellungen importieren" },
  zh: { general: "常规", api: "API配置", prompts: "提示词", theme: "主题", lang: "语言", dark: "深色", light: "浅色", export: "导出设置", import: "导入设置" },
  ja: { general: "一般", api: "API設定", prompts: "プロンプト", theme: "テーマ", lang: "言語", dark: "ダーク", light: "ライト", export: "設定をエクスポート", import: "設定をインポート" },
};