export interface StoryPlan {
  title: string;
  genre: string;
  language: string; // Target language for the story text
  premise: string;
  characters: string;
  outline: string[]; // Changed from string to string[]
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
  
  IMPORTANT: Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks. The response must start with '{' and end with '}'.
  
  Output a JSON object with this structure:
  {
    "title": "Novel Title",
    "genre": "Genre",
    "outline": [
      "Detailed summary of chapter 1...",
      "Detailed summary of chapter 2..."
    ],
    "characters": "refined character list"
  }
  
  The outline array should contain one string per chapter. Do NOT include "Chapter X:" or numbering prefixes in the outline strings. The application handles numbering automatically.`,
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
    
    IMPORTANTE: Devuelve SOLO un objeto JSON válido. NO uses bloques markdown.
    
    Estructura JSON requerida:
    {
      "title": "Título",
      "genre": "Género",
      "outline": [
         "Resumen del capítulo 1...",
         "Resumen del capítulo 2..."
      ],
      "characters": "lista de personajes"
    }
    
    NO incluyas prefijos como "Capítulo X:" en las cadenas del esquema.`,
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
        "Résumé du chapitre 1...",
        "Résumé du chapitre 2..."
      ],
      "characters": "liste des personnages"
    }
    
    N'incluez PAS de préfixes "Chapitre X :" dans les chaînes du plan.`,
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
        "Zusammenfassung von Kapitel 1...",
        "Zusammenfassung von Kapitel 2..."
      ],
      "characters": "Charakterliste"
    }
    
    Füge KEINE Präfixe wie "Kapitel X:" in die Gliederungsstrings ein.`,
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
        "第一章的摘要内容...",
        "第二章的摘要内容..."
      ],
      "characters": "角色列表"
    }
    
    outline 数组应包含每一章的字符串。请勿在大纲字符串中包含“第X章：”或数字前缀。系统会自动编号。`,
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
        "第1章のあらすじ...",
        "第2章のあらすじ..."
      ],
      "characters": "キャラクターリスト"
    }
    
    アウトラインの文字列に「第X章:」などのプレフィックスを含めないでください。`,
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
    writeChapterBtn: "Write Chapter",
    nextBtn: "Next",
    prevBtn: "Previous",
    downloadBtn: "Download",
    resetBtn: "Reset Story",
    chapterInstructions: "Instructions for this chapter (optional)...",
    generating: "Generating...",
    save: "Save",
    edit: "Edit",
    regeneratePlanBtn: "Regenerate Plan",
    startWritingBtn: "Start Writing (Resets Chapters)",
    clearChaptersBtn: "Clear All Chapters"
  },
  es: { 
    general: "General", api: "Config API", prompts: "Prompts", theme: "Tema", lang: "Idioma", dark: "Oscuro", light: "Claro", export: "Exportar Config", import: "Importar Config",
    appTitle: "Inkwell",
    premiseLabel: "Premisa de la Historia",
    premisePlaceholder: "Un detective descubre un reloj que cuenta hacia atrás...",
    charactersLabel: "Personajes Clave",
    charactersPlaceholder: "Detective Miller: brusco pero amable...",
    chaptersLabel: "Aprox. Capítulos",
    generateBtn: "Generar Plan",
    planTab: "Plan",
    writeTab: "Escribir",
    outlineLabel: "Esquema",
    storyTitleLabel: "Título",
    genreLabel: "Género",
    chapterList: "Capítulos",
    writeChapterBtn: "Escribir Capítulo",
    nextBtn: "Siguiente",
    prevBtn: "Anterior",
    downloadBtn: "Descargar",
    resetBtn: "Reiniciar",
    chapterInstructions: "Instrucciones para este capítulo (opcional)...",
    generating: "Generando...",
    save: "Guardar",
    edit: "Editar",
    regeneratePlanBtn: "Regenerar Plan",
    startWritingBtn: "Empezar a Escribir (Reinicia Capítulos)",
    clearChaptersBtn: "Borrar Capítulos"
  },
  fr: { 
    general: "Général", api: "Config API", prompts: "Prompts", theme: "Thème", lang: "Langue", dark: "Sombre", light: "Clair", export: "Exporter", import: "Importer",
    appTitle: "Inkwell",
    premiseLabel: "Prémisse de l'histoire",
    premisePlaceholder: "Un détective découvre une horloge qui compte à rebours...",
    charactersLabel: "Personnages Clés",
    charactersPlaceholder: "Détective Miller : bourru mais gentil...",
    chaptersLabel: "Chapitres approx.",
    generateBtn: "Générer le Plan",
    planTab: "Plan",
    writeTab: "Écrire",
    outlineLabel: "Plan",
    storyTitleLabel: "Titre",
    genreLabel: "Genre",
    chapterList: "Chapitres",
    writeChapterBtn: "Écrire le Chapitre",
    nextBtn: "Suivant",
    prevBtn: "Précédent",
    downloadBtn: "Télécharger",
    resetBtn: "Réinitialiser",
    chapterInstructions: "Instructions pour ce chapitre (facultatif)...",
    generating: "Génération...",
    save: "Enregistrer",
    edit: "Éditer",
    regeneratePlanBtn: "Régénérer le Plan",
    startWritingBtn: "Commencer à écrire (Réinitialise les chapitres)",
    clearChaptersBtn: "Effacer les chapitres"
  },
  de: { 
    general: "Allgemein", api: "API Konfig", prompts: "Prompts", theme: "Thema", lang: "Sprache", dark: "Dunkel", light: "Hell", export: "Einstellungen exportieren", import: "Einstellungen importieren",
    appTitle: "Inkwell",
    premiseLabel: "Handlung",
    premisePlaceholder: "Ein Detektiv entdeckt eine Uhr, die rückwärts zählt...",
    charactersLabel: "Hauptcharaktere",
    charactersPlaceholder: "Detektiv Miller: schroff aber freundlich...",
    chaptersLabel: "Anzahl Kapitel",
    generateBtn: "Plan generieren",
    planTab: "Plan",
    writeTab: "Schreiben",
    outlineLabel: "Gliederung",
    storyTitleLabel: "Titel",
    genreLabel: "Genre",
    chapterList: "Kapitel",
    writeChapterBtn: "Kapitel schreiben",
    nextBtn: "Weiter",
    prevBtn: "Zurück",
    downloadBtn: "Herunterladen",
    resetBtn: "Zurücksetzen",
    chapterInstructions: "Anweisungen für dieses Kapitel (optional)...",
    generating: "Generiere...",
    save: "Speichern",
    edit: "Bearbeiten",
    regeneratePlanBtn: "Plan neu generieren",
    startWritingBtn: "Schreiben starten (Kapitel zurücksetzen)",
    clearChaptersBtn: "Kapitel löschen"
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
    writeChapterBtn: "撰写章节",
    nextBtn: "下一章",
    prevBtn: "上一章",
    downloadBtn: "下载",
    resetBtn: "重置",
    chapterInstructions: "本章的具体指令（可选）...",
    generating: "生成中...",
    save: "保存",
    edit: "编辑",
    regeneratePlanBtn: "重新生成大纲",
    startWritingBtn: "开始写作 (重置所有章节)",
    clearChaptersBtn: "清空章节"
  },
  ja: { 
    general: "一般", api: "API設定", prompts: "プロンプト", theme: "テーマ", lang: "言語", dark: "ダーク", light: "ライト", export: "設定をエクスポート", import: "設定をインポート",
    appTitle: "Inkwell",
    premiseLabel: "ストーリーの前提",
    premisePlaceholder: "探偵が逆算する時計を発見する...",
    charactersLabel: "主要キャラクター",
    charactersPlaceholder: "ミラー刑事：無骨だが優しい...",
    chaptersLabel: "およその章数",
    generateBtn: "プランを作成",
    planTab: "プラン",
    writeTab: "執筆",
    outlineLabel: "アウトライン",
    storyTitleLabel: "タイトル",
    genreLabel: "ジャンル",
    chapterList: "章一覧",
    writeChapterBtn: "章を書く",
    nextBtn: "次へ",
    prevBtn: "前へ",
    downloadBtn: "ダウンロード",
    resetBtn: "リセット",
    chapterInstructions: "この章の指示（オプション）...",
    generating: "生成中...",
    save: "保存",
    edit: "編集",
    regeneratePlanBtn: "プランを再生成",
    startWritingBtn: "執筆開始（章をリセット）",
    clearChaptersBtn: "章をクリア"
  },
};