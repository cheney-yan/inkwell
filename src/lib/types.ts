export interface StoryPlan {
  title: string;
  genre: string;
  genreValue?: string; // Storing the internal value for logic
  language: string; 
  premise: string;
  characters: string;
  outline: string[]; 
  totalChapters: number;
  customPrompts?: SystemPrompts; // User-defined or genre-specific overrides for this story
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
  useBackendServer: boolean; // New: fallback to backend when no API key
}

export const DEFAULT_PROMPTS: SystemPrompts = {
  planning: `You are an expert novelist. Your task is to create a detailed, chapter-by-chapter outline for a novel based on the user's premise.
  
  IMPORTANT: Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks. The response must start with '{' and end with '}'.
  
  Output a JSON object with this structure:
  {
    "title": "Novel Title",
    "genre": "Genre",
    "outline": [
      "Detailed summary of chapter 1 (synopsis only, NO numbering)",
      "Detailed summary of chapter 2 (synopsis only, NO numbering)"
    ],
    "characters": "refined character list"
  }
  
  The outline array should contain one string per chapter. strictly DO NOT include "Chapter X:", "1.", or any numbering prefixes within the outline strings. The application handles numbering.`,
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
    planning: `Eres un novelista experto. Crea un esquema detallado capítulo por capítulo.
    
    IMPORTANTE: Devuelve SOLO un objeto JSON válido. NO uses bloques markdown.
    
    Estructura JSON requerida:
    {
      "title": "Título",
      "genre": "Género",
      "outline": [
         "Resumen del capítulo 1 (solo sinopsis, SIN numeración)",
         "Resumen del capítulo 2 (solo sinopsis, SIN numeración)"
      ],
      "characters": "lista de personajes"
    }
    
    El array 'outline' debe contener solo el texto de la sinopsis. NO incluyas prefijos como "Capítulo 1", "1.", etc.`,
    writing: "Eres un escritor de ficción creativa. Escribe el capítulo solicitado basado en el plan...",
  },
  fr: {
    planning: `Vous êtes un romancier expert. Créez un plan détaillé.
    
    IMPORTANT : Retournez UNIQUEMENT un objet JSON valide. PAS de markdown.
    
    Structure JSON requise :
    {
      "title": "Titre",
      "genre": "Genre",
      "outline": [
        "Résumé du chapitre 1 (synopsis uniquement, PAS de numérot",
        "Résumé du chapitre 2 (synopsis uniquement, PAS de numérotation)"
      ],
      "characters": "liste des personnages"
    }
    
    Le tableau 'outline' ne doit contenir que le texte. N'incluez PAS de préfixes comme "Chapitre 1", "1.", etc.`,
    writing: "Vous êtes un écrivain de fiction créative. Écrivez le chapitre demandé...",
  },
  de: {
    planning: `Du bist ein erfahrener Romanautor. Erstelle eine detaillierte Gliederung.
    
    WICHTIG: Gib NUR ein gültiges JSON-Objekt zurück. KEIN Markdown.
    
    Benötigte JSON-Struktur:
    {
      "title": "Titel",
      "genre": "Genre",
      "outline": [
        "Zusammenfassung von Kapitel 1 (nur Inhalt, KEINE Nummerierung)",
        "Zusammenfassung von Kapitel 2 (nur Inhalt, KEINE Nummerierung)"
      ],
      "characters": "Charakterliste"
    }
    
    Das 'outline'-Array darf nur den Inhaltstext enthalten. Füge KEINE Präfixe wie "Kapitel 1", "1." usw. hinzu.`,
    writing: "Du bist ein kreativer Schriftsteller. Schreibe das angeforderte Kapitel...",
  },
  zh: {
    planning: `你是一位专家小说家。你的任务是创建一个详细的逐章大纲。
    
    重要：仅返回有效的 JSON 对象。不要使用 markdown 代码块。
    
    JSON结构：
    {
      "title": "标题",
      "genre": "类型",
      "outline": [
        "第一章的摘要内容 (纯文本，不要包含'第一章'等前缀)",
        "第二章的摘要内容 (纯文本，不要包含'第二章'等前缀)"
      ],
      "characters": "角色列表"
    }
    
    outline 数组必须仅包含摘要文本。绝对不要在大纲字符串中包含"第X章"、"1."或任何数字前缀。应用程序会自动处理编号。`,
    writing: "你是一位创意小说作家。根据故事计划和以前的背景编写请求的章节...",
  },
  ja: {
    planning: `あなたは熟練した小説家です。詳細な章ごとのアウトラインを作成してください。
    
    重要：有効なJSONオブジェクトのみを返してください。Markdownは使用しないでください。
    
    必要なJSON構造：
    {
      "title": "タイトル",
      "genre": "ジャンル",
      "outline": [
        "第1章のあらすじ (内容のみ、番号は含めない)",
        "第2章のあらすじ (内容のみ、番号は含めない)"
      ],
      "characters": "キャラクターリスト"
    }
    
    outline配列には、あらすじのテキストのみを含めてください。「第1章」、「1.」などの番号プレフィックスは絶対に入れないでください。`,
    writing: "あなたは創造的な小説家です。ストーリープランと以前のコンテキストに基づいて、要求された章を書いてください...",
  },
};

export const UI_LABELS: Record<string, any> = {
  en: { 
    general: "General", api: "API Config", prompts: "Prompts", theme: "Theme", lang: "Language", dark: "Dark", light: "Light", export: "Export Settings", import: "Import Settings",
    appTitle: "Inkwell",
    premiseLabel: "Story Premise",
    premisePlaceholder: "A detective discovers a clock that counts backwards...",
    charactersLabel: "Key Characters",
    charactersPlaceholder: "Detective Miller: gruff but kind...",
    chaptersLabel: "Approx. Chapters",
    generateBtn: "Generate Plan",
    planTab: "Plan",
    writeTab: "Write",
    outlineLabel: "Outline",
    storyTitleLabel: "Title",
    genreLabel: "Genre",
    chapterList: "Chapters",
    writeChapterBtn: "AI Write Next Chapter",
    nextBtn: "Next",
    prevBtn: "Previous",
    downloadBtn: "Download MD",
    exportJsonBtn: "Export JSON",
    resetBtn: "Reset Story",
    chapterInstructions: "Instructions for this chapter (optional)...",
    generating: "Generating...",
    save: "Save",
    edit: "Edit",
    regeneratePlanBtn: "Regenerate Plan",
    startWritingBtn: "Start Writing (Resets Chapters)",
    clearChaptersBtn: "Clear All Chapters",
    promptsMenu: "Prompts",
    promptsTitle: "Story Prompts",
    promptsDesc: "Customize the AI instructions for this specific story.",
    planningPrompt: "Planning Prompt",
    writingPrompt: "Writing Prompt",
    resetPrompts: "Reset to Genre Defaults",
    rewriteBtn: "Rewrite",
    autoRewrite: "Auto-Rewrite (Follow Plan)",
    customRewrite: "Rewrite with Instructions...",
    rewriteDialogTitle: "Rewrite Chapter",
    rewriteDialogDesc: "Provide specific instructions for rewriting this chapter. This will overwrite the current content.",
    cancel: "Cancel",
    backendServer: "Backend Server",
    useBackendServer: "Use Backend Server (no API key needed)",
    backendStatus: "Backend Status",
    backendAvailable: "Available",
    backendUnavailable: "Unavailable",
    backendModel: "Backend Model",
    backendInfo: "When enabled, requests go through the backend server configured via .env file. No API key needed in browser."
  },
  zh: { 
    general: "常规", api: "API配置", prompts: "提示词", theme: "主题", lang: "语言", dark: "深色", light: "浅色", export: "导出设置", import: "导入设置",
    appTitle: "Inkwell (墨水池)",
    premiseLabel: "故事前提",
    premisePlaceholder: "侦探发现了一个倒计时的时钟...",
    charactersLabel: "主要角色",
    charactersPlaceholder: "米勒侦探：粗鲁但善良...",
    chaptersLabel: "预计章节数",
    generateBtn: "生成大纲",
    planTab: "大纲",
    writeTab: "写作",
    outlineLabel: "大纲概览",
    storyTitleLabel: "标题",
    genreLabel: "类型",
    chapterList: "章节列表",
    writeChapterBtn: "AI撰写下一章",
    nextBtn: "下一章",
    prevBtn: "上一章",
    downloadBtn: "下载 MD",
    exportJsonBtn: "导出 JSON",
    resetBtn: "重置",
    chapterInstructions: "本章的具体指令（可选）...",
    generating: "生成中...",
    save: "保存",
    edit: "编辑",
    regeneratePlanBtn: "重新生成大纲",
    startWritingBtn: "开始写作 (重置所有章节)",
    clearChaptersBtn: "清空章节",
    promptsMenu: "提示词",
    promptsTitle: "故事提示词",
    promptsDesc: "自定义此故事的 AI 指令。",
    planningPrompt: "大纲生成提示词",
    writingPrompt: "章节写作提示词",
    resetPrompts: "重置为类型默认值",
    rewriteBtn: "重写",
    autoRewrite: "自动重写 (遵循大纲)",
    customRewrite: "带指令重写...",
    rewriteDialogTitle: "重写章节",
    rewriteDialogDesc: "为重写本章提供具体指令。这将覆盖当前内容。",
    cancel: "取消",
    backendServer: "后端服务器",
    useBackendServer: "使用后端服务器（无需API密钥）",
    backendStatus: "后端状态",
    backendAvailable: "可用",
    backendUnavailable: "不可用",
    backendModel: "后端模型",
    backendInfo: "启用后，请求将通过.env文件配置的后端服务器发送。浏览器中无需API密钥。"
  },
};