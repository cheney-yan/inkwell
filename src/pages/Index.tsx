import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStory } from "@/hooks/use-story";
import { Loader2, BookOpen, PenTool, Download, Trash2, ChevronLeft, ChevronRight, Edit2, Save, RefreshCw, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UI_LABELS } from "@/lib/types";
import { extractChapterPlan } from "@/lib/story-utils";

const Index = () => {
  const {
    config,
    updateConfig,
    prompts,
    updatePrompts,
    story,
    generatePlan,
    updatePlan,
    generateChapter,
    editChapter,
    navigateChapter,
    resetStory,
    clearChapters,
    downloadStory,
    isGenerating,
  } = useStory();

  const labels = UI_LABELS[config.uiLanguage] || UI_LABELS["en"];

  // State
  const [premise, setPremise] = useState("");
  const [characters, setCharacters] = useState("");
  const [totalChapters, setTotalChapters] = useState(12);
  const [chapterInstructions, setChapterInstructions] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState("plan");

  // Effect to prefill chapter instructions when plan or chapter count changes
  useEffect(() => {
    if (story.hasPlan) {
      const nextChapterNum = story.chapters.length + 1;
      const instruction = extractChapterPlan(story.plan.outline, nextChapterNum, config.uiLanguage);
      if (instruction) {
        setChapterInstructions(instruction);
      }
    }
  }, [story.hasPlan, story.plan.outline, story.chapters.length, config.uiLanguage]);

  const handleGeneratePlan = () => {
    generatePlan({ premise, characters, totalChapters });
  };

  const handleRegeneratePlan = () => {
    if (confirm("This will overwrite your current outline and character list. Continue?")) {
        generatePlan({ 
            premise: story.plan.premise, 
            characters: story.plan.characters, 
            totalChapters: story.plan.totalChapters 
        });
    }
  };
  
  const handleStartWriting = () => {
      if (story.chapters.length > 0) {
          if (confirm("This will delete all existing chapters and start fresh from Chapter 1. Continue?")) {
              clearChapters();
              setActiveTab("write");
          }
      } else {
          setActiveTab("write");
      }
  };
  
  const handleClearChapters = () => {
      if (confirm("Delete all written chapters? This cannot be undone.")) {
          clearChapters();
      }
  };

  const handleWriteChapter = () => {
    generateChapter(chapterInstructions);
    // Note: We don't clear setChapterInstructions here immediately because 
    // the useEffect will trigger when chapters.length changes and prefill the NEXT chapter.
  };

  const startEdit = () => {
    if (story.currentChapterIndex >= 0 && story.chapters[story.currentChapterIndex]) {
        setEditContent(story.chapters[story.currentChapterIndex].content);
        setIsEditingChapter(true);
    }
  };

  const saveEdit = () => {
    editChapter(story.currentChapterIndex, editContent);
    setIsEditingChapter(false);
  };

  if (!story.hasPlan) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4">
          <SettingsDialog
            config={config}
            prompts={prompts}
            onUpdateConfig={updateConfig}
            onUpdatePrompts={updatePrompts}
          />
        </div>
        
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8" />
              {labels.appTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{labels.premiseLabel}</Label>
              <Textarea
                placeholder={labels.premisePlaceholder}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{labels.charactersLabel}</Label>
              <Textarea
                placeholder={labels.charactersPlaceholder}
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{labels.chaptersLabel}</Label>
              <Input
                type="number"
                value={totalChapters}
                onChange={(e) => setTotalChapters(parseInt(e.target.value))}
                min={1}
                max={50}
              />
            </div>

            <Button 
              onClick={handleGeneratePlan} 
              disabled={isGenerating || !premise}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {labels.generating}
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-4 w-4" />
                  {labels.generateBtn}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapter = story.chapters[story.currentChapterIndex];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b px-6 py-3 flex justify-between items-center bg-card">
        <div className="flex items-center gap-2">
           <BookOpen className="h-5 w-5" />
           <h1 className="font-bold text-lg hidden md:block">{story.plan.title || labels.appTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={downloadStory}>
             <Download className="mr-2 h-4 w-4" /> {labels.downloadBtn}
           </Button>
           <Button variant="outline" size="sm" onClick={resetStory} className="text-destructive hover:text-destructive">
             <Trash2 className="mr-2 h-4 w-4" /> {labels.resetBtn}
           </Button>
           <SettingsDialog
            config={config}
            prompts={prompts}
            onUpdateConfig={updateConfig}
            onUpdatePrompts={updatePrompts}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6 pt-2">
             <TabsList>
                <TabsTrigger value="plan">{labels.planTab}</TabsTrigger>
                <TabsTrigger value="write">{labels.writeTab}</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="plan" className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{labels.storyTitleLabel}</Label>
                  <Input 
                    value={story.plan.title} 
                    onChange={(e) => updatePlan({...story.plan, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{labels.genreLabel}</Label>
                  <Input 
                    value={story.plan.genre} 
                    onChange={(e) => updatePlan({...story.plan, genre: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{labels.charactersLabel}</Label>
                <Textarea 
                   value={story.plan.characters}
                   onChange={(e) => updatePlan({...story.plan, characters: e.target.value})}
                   rows={6}
                />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label>{labels.outlineLabel}</Label>
                    <Button 
                        onClick={handleRegeneratePlan} 
                        disabled={isGenerating} 
                        variant="ghost"
                        size="sm"
                        className="h-8"
                    >
                        {isGenerating ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                        <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        {labels.regeneratePlanBtn}
                    </Button>
                 </div>
                <Textarea 
                   className="font-mono text-sm"
                   value={story.plan.outline}
                   onChange={(e) => updatePlan({...story.plan, outline: e.target.value})}
                   rows={15}
                />
              </div>
              
              <Button 
                onClick={handleStartWriting}
                className="w-full"
                size="lg"
              >
                  <Play className="mr-2 h-4 w-4" />
                  {labels.startWritingBtn}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="write" className="flex-1 flex overflow-hidden">
            {/* Sidebar Chapter List */}
            <div className="w-64 border-r bg-muted/30 flex flex-col">
               <div className="p-4 font-medium text-sm text-muted-foreground border-b flex justify-between items-center">
                 <span>{labels.chapterList}</span>
                 {story.chapters.length > 0 && (
                     <button onClick={handleClearChapters} className="text-destructive hover:bg-destructive/10 p-1 rounded" title={labels.clearChaptersBtn}>
                         <Trash2 className="h-4 w-4" />
                     </button>
                 )}
               </div>
               <ScrollArea className="flex-1">
                 <div className="p-2 space-y-1">
                    {story.chapters.map((chapter, idx) => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                           // Navigation logic would go here if we implemented direct jump
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm truncate ${
                          idx === story.currentChapterIndex 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted cursor-default"
                        }`}
                      >
                        {chapter.title}
                      </button>
                    ))}
                    {story.chapters.length === 0 && (
                        <div className="p-4 text-xs text-muted-foreground text-center">
                            No chapters yet.
                        </div>
                    )}
                 </div>
               </ScrollArea>
            </div>

            {/* Writing Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {currentChapter ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                         <Button 
                           variant="ghost" 
                           onClick={() => navigateChapter("prev")}
                           disabled={story.currentChapterIndex === 0}
                         >
                            <ChevronLeft className="mr-2 h-4 w-4" /> {labels.prevBtn}
                         </Button>
                         <span className="font-semibold">{currentChapter.title}</span>
                         <div className="flex gap-2">
                            {isEditingChapter ? (
                                <Button size="sm" onClick={saveEdit}>
                                    <Save className="mr-2 h-4 w-4" /> {labels.save}
                                </Button>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={startEdit}>
                                    <Edit2 className="mr-2 h-4 w-4" /> {labels.edit}
                                </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              onClick={() => navigateChapter("next")}
                              disabled={story.currentChapterIndex === story.chapters.length - 1}
                            >
                                {labels.nextBtn} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-8 max-w-3xl mx-auto w-full">
                        {isEditingChapter ? (
                            <Textarea 
                                className="min-h-[500px] font-serif text-lg leading-relaxed p-4"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        ) : (
                            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                                {currentChapter.content}
                            </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                     <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                     <p>Ready to write your first chapter?</p>
                  </div>
                )}

                {/* Writing Input */}
                <div className="border-t p-4 bg-card">
                  <div className="max-w-3xl mx-auto flex gap-2">
                    <Input 
                      value={chapterInstructions}
                      onChange={(e) => setChapterInstructions(e.target.value)}
                      placeholder={labels.chapterInstructions}
                      className="flex-1"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                              e.preventDefault();
                              handleWriteChapter();
                          }
                      }}
                    />
                    <Button onClick={handleWriteChapter} disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                            <PenTool className="mr-2 h-4 w-4" />
                            {labels.writeChapterBtn}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;