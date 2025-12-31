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
  
  IMPORTANT: Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks (e.g. \`\`\`json ... \`\`\`). Do NOT include any intro or outro text. The response must start with '{' and end with '}'.
  
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
    planning: `Eres un novelista experto. Tu tarea es crear un esquema detallado capítulo por capítulo.
    
    IMPORTANTE: Devuelve SOLO un objeto JSON válido. NO lo envuelvas en bloques de código markdown (ej. \`\`\`json ... \`\`\`). NO incluyas texto de introducción o conclusión. La respuesta debe empezar con '{' y terminar con '}'.
    
    Estructura JSON requerida:
    {
      "title": "Título",
      "genre": "Género",
      "outline": "Capítulo 1: ...",
      "characters": "lista de personajes"
    }`,
    writing: "Eres un escritor de ficción creativa. Escribe el capítulo solicitado basado en el plan...",
  },
  fr: {
    planning: `Vous êtes un romancier expert. Votre tâche est de créer un plan détaillé.
    
    IMPORTANT : Retournez UNIQUEMENT un objet JSON valide. NE PAS l'entourer de blocs de code markdown (ex. \`\`\`json ... \`\`\`). N'incluez AUCUN texte d'intro ou de conclusion. La réponse doit commencer par '{' et finir par '}'.
    
    Structure JSON requise :
    {
      "title": "Titre",
      "genre": "Genre",
      "outline": "Chapitre 1 : ...",
      "characters": "liste des personnages"
    }`,
    writing: "Vous êtes un écrivain de fiction créative. Écrivez le chapitre demandé...",
  },
  de: {
    planning: `Du bist ein erfahrener Romanautor. Erstelle eine detaillierte Gliederung.
    
    WICHTIG: Gib NUR ein gültiges JSON-Objekt zurück. Packe es NICHT in Markdown-Codeblöcke (z.B. \`\`\`json ... \`\`\`). Füge KEINEN Einleitungs- oder Schluss-Text hinzu. Die Antwort muss mit '{' beginnen und mit '}' enden.
    
    Benötigte JSON-Struktur:
    {
      "title": "Titel",
      "genre": "Genre",
      "outline": "Kapitel 1: ...",
      "characters": "Charakterliste"
    }`,
    writing: "Du bist ein kreativer Schriftsteller. Schreibe das angeforderte Kapitel...",
  },
  zh: {
    planning: `你是一位专家小说家。你的任务是创建一个详细的逐章大纲。
    
    重要：仅返回有效的 JSON 对象。不要将其包含在 markdown 代码块中（例如 \`\`\`json ... \`\`\`）。不要包含任何介绍或结尾文本。响应必须以 '{' 开头并以 '}' 结尾。
    
    JSON结构：
    {
      "title": "标题",
      "genre": "类型",
      "outline": "第一章：...",
      "characters": "角色列表"
    }`,
    writing: "你是一位创意小说作家。根据故事计划和以前的背景编写请求的章节...",
  },
  ja: {
    planning: `あなたは熟練した小説家です。詳細な章ごとのアウトラインを作成してください。
    
    重要：有効なJSONオブジェクトのみを返してください。Markdownコードブロック（例：\`\`\`json ... \`\`\`）で囲まないでください。導入テキストや終了テキストを含めないでください。レスポンスは '{' で始まり '}' で終わる必要があります。
    
    必要なJSON構造：
    {
      "title": "タイトル",
      "genre": "ジャンル",
      "outline": "第1章：...",
      "characters": "キャラクターリスト"
    }`,
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