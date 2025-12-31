export interface OutlineItem {
  id: string;
  title: string;
  description: string;
}

export interface StoryPlan {
  title: string;
  genre: string;
  language: string; 
  premise: string;
  characters: string;
  outline: string; // Kept as string for compatibility
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
  
  IMPORTANT: Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks.
  
  Output a JSON object with this structure:
  {
    "title": "Novel Title",
    "genre": "Genre",
    "outline": "Chapter 1: Summary...\\nChapter 2: Summary...",
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
    planning: `Eres un novelista experto. Crea un esquema detallado.
    IMPORTANTE: Devuelve SOLO un objeto JSON válido.
    
    Estructura JSON:
    {
      "title": "Título",
      "genre": "Género",
      "outline": "Capítulo 1: ...\\nCapítulo 2: ...",
      "characters": "lista de personajes"
    }`,
    writing: "Eres un escritor de ficción creativa...",
  },
  fr: {
    planning: `Vous êtes un romancier expert.
    Structure JSON :
    {
      "title": "Titre",
      "genre": "Genre",
      "outline": "Chapitre 1 : ...\\nChapitre 2 : ...",
      "characters": "liste des personnages"
    }`,
    writing: "Vous êtes un écrivain de fiction créative...",
  },
  de: {
    planning: `Du bist ein erfahrener Romanautor.
    JSON-Struktur:
    {
      "title": "Titel",
      "genre": "Genre",
      "outline": "Kapitel 1: ...\\nKapitel 2: ...",
      "characters": "Charakterliste"
    }`,
    writing: "Du bist ein kreativer Schriftsteller...",
  },
  zh: {
    planning: `你是一位专家小说家。
    JSON结构：
    {
      "title": "标题",
      "genre": "类型",
      "outline": "第一章：...\\n第二章：...",
      "characters": "角色列表"
    }`,
    writing: "你是一位创意小说作家...",
  },
  ja: {
    planning: `あなたは熟練した小説家です。
    JSON構造：
    {
      "title": "タイトル",
      "genre": "ジャンル",
      "outline": "第1章：...\\n第2章：...",
      "characters": "キャラクターリスト"
    }`,
    writing: "あなたは創造的な小説家です...",
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
    clearChaptersBtn: "Clear All Chapters",
    addChapterBtn: "Add Chapter",
    deleteBtn: "Delete",
    moveUp: "Move Up",
    moveDown: "Move Down"
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
    clearChaptersBtn: "Borrar Capítulos",
    addChapterBtn: "Añadir Capítulo",
    deleteBtn: "Borrar",
    moveUp: "Subir",
    moveDown: "Bajar"
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
    clearChaptersBtn: "Effacer les chapitres",
    addChapterBtn: "Ajouter un chapitre",
    deleteBtn: "Supprimer",
    moveUp: "Monter",
    moveDown: "Descendre"
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
<dyad-problem-report summary="2 problems">
<problem file="src/components/KindleView.tsx" line="41" column="47" code="2339">Property 'split' does not exist on type 'OutlineItem[]'.</problem>
<problem file="src/components/PlanningView.tsx" line="87" column="19" code="2322">Type 'OutlineItem[]' is not assignable to type 'string | number | readonly string[]'.
  Type 'OutlineItem[]' is not assignable to type 'readonly string[]'.
    Type 'OutlineItem' is not assignable to type 'string'.</problem>
</dyad-problem-report>I will revert the `outline` type to `string` to ensure compatibility with existing components like `KindleView` and `PlanningView`. I will then implement utility functions to convert between the string storage format and the array format required by the new `OutlineEditor` UI.

<dyad-write path="src/lib/types.ts" description="Reverting outline to string type for backward compatibility">
export interface OutlineItem {
  id: string;
  title: string;
  description: string;
}

export interface StoryPlan {
  title: string;
  genre: string;
  language: string; 
  premise: string;
  characters: string;
  outline: string; // Reverted to string to fix type errors in other components
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
  planning: `You are an expert novelist. Create a detailed, chapter-by-chapter outline.
  
  IMPORTANT: Return ONLY a valid JSON object.
  
  Output JSON structure:
  {
    "title": "Novel Title",
    "genre": "Genre",
    "outline": [
      { "title": "Chapter 1", "description": "Summary..." }
    ],
    "characters": "refined character list"
  }`,
  writing: `You are a creative fiction writer. Write the requested chapter based on the story plan and previous context.
  Output only the story content (Markdown formatted).`,
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
    planning: `Eres un novelista experto.
    Estructura JSON:
    {
      "title": "Título",
      "genre": "Género",
      "outline": [ { "title": "Capítulo 1", "description": "..." } ],
      "characters": "..."
    }`,
    writing: "Eres un escritor de ficción creativa...",
  },
  fr: {
    planning: `Vous êtes un romancier expert.
    Structure JSON:
    {
      "title": "Titre",
      "genre": "Genre",
      "outline": [ { "title": "Chapitre 1", "description": "..." } ],
      "characters": "..."
    }`,
    writing: "Vous êtes un écrivain de fiction créative...",
  },
  de: {
    planning: `Du bist ein erfahrener Romanautor.
    JSON-Struktur:
    {
      "title": "Titel",
      "genre": "Genre",
      "outline": [ { "title": "Kapitel 1", "description": "..." } ],
      "characters": "..."
    }`,
    writing: "Du bist ein kreativer Schriftsteller...",
  },
  zh: {
    planning: `你是一位专家小说家。
    JSON结构：
    {
      "title": "标题",
      "genre": "类型",
      "outline": [ { "title": "第一章", "description": "..." } ],
      "characters": "..."
    }`,
    writing: "你是一位创意小说作家...",
  },
  ja: {
    planning: `あなたは熟練した小説家です。
    JSON構造：
    {
      "title": "タイトル",
      "genre": "ジャンル",
      "outline": [ { "title": "第1章", "description": "..." } ],
      "characters": "..."
    }`,
    writing: "あなたは創造的な小説家です...",
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
    clearChaptersBtn: "Clear All Chapters",
    addChapterBtn: "Add Chapter",
    deleteBtn: "Delete",
    moveUp: "Move Up",
    moveDown: "Move Down"
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
    clearChaptersBtn: "Borrar Capítulos",
    addChapterBtn: "Añadir Capítulo",
    deleteBtn: "Borrar",
    moveUp: "Subir",
    moveDown: "Bajar"
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
    clearChaptersBtn: "Effacer les chapitres",
    addChapterBtn: "Ajouter un chapitre",
    deleteBtn: "Supprimer",
    moveUp: "Monter",
    moveDown: "Descendre"
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
    clearChaptersBtn: "Kapitel löschen",
    addChapterBtn: "Kapitel hinzufügen",
    deleteBtn: "Löschen",
    moveUp: "Nach oben",
    moveDown: "Nach unten"
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
    clearChaptersBtn: "清空章节",
    addChapterBtn: "添加章节",
    deleteBtn: "删除",
    moveUp: "上移",
    moveDown: "下移"
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
    clearChaptersBtn: "章をクリア",
    addChapterBtn: "章を追加",
    deleteBtn: "削除",
    moveUp: "上へ",
    moveDown: "下へ"
  },
};