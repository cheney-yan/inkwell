# Inkwell

Inkwell is an AI-powered creative writing assistant designed to help authors plan, draft, and refine their novels. It leverages Large Language Models (like OpenAI's GPT-4) to generate detailed outlines, character sheets, and full story chapters based on your unique premise.

## Features

- **Smart Planning**: Input your premise and characters, and let Inkwell generate a comprehensive chapter-by-chapter outline.
- **AI Drafting**: Write chapters one by one, with the AI maintaining context from your outline and previous chapters.
- **Interactive Editing**: Edit generated text directly, or use AI to rewrite specific sections with custom instructions.
- **Multi-Language Support**: Interface and generation support for English, Spanish, French, German, Chinese, and Japanese.
- **Customizable**: Configure API settings (OpenAI, local LLMs via compatible endpoints), system prompts, and themes (Light/Dark).
- **Privacy Focused**: Your API keys are stored locally in your browser. No data is collected by the application itself.
- **Export & Import**: Save your progress as JSON or download your full story as a Markdown file.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks & Local Storage
- **AI Integration**: OpenAI API (compatible with other OpenAI-format endpoints)

## Getting Started

1.  Open the application.
2.  Click the Settings icon to configure your OpenAI API Key (or compatible endpoint).
3.  Enter your story premise, characters, and select a genre.
4.  Generate a plan, then switch to the "Write" tab to start drafting your novel.

## Disclaimer

This tool is for experimental and creative purposes. The quality of generated text depends on the underlying AI model. Please review all generated content.