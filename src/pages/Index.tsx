import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStory } from "@/hooks/use-story";
import { Loader2, BookOpen, PenTool, Download, Trash2, ChevronLeft, ChevronRight, Edit2, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UI_LABELS } from "@/lib/types";

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
    downloadStory,
    isGenerating,
  } = useStory();

  const labels = UI_LABELS[config.uiLanguage] || UI_LABELS["en"];

  const [premise, setPremise] = useState("");
  const [characters, setCharacters] = useState("");
  const [totalChapters, setTotalChapters] = useState(12);
  const [chapterInstructions, setChapterInstructions] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editContent, setEditContent] = useState("");

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

  const handleWriteChapter = () => {
    generateChapter(chapterInstructions);
    setChapterInstructions("");
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
        <Tabs defaultValue="write" className="flex-1 flex flex-col">
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
                <Label>{labels.outlineLabel}</Label>
                <Textarea 
                   className="font-mono text-sm"
                   value={story.plan.outline}
                   onChange={(e) => updatePlan({...story.plan, outline: e.target.value})}
                   rows={15}
                />
              </div>
              
              <Button 
                onClick={handleRegeneratePlan} 
                disabled={isGenerating} 
                variant="secondary"
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {labels.regeneratePlanBtn}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="write" className="flex-1 flex overflow-hidden">
            {/* Sidebar Chapter List */}
            <div className="w-64 border-r bg-muted/30 flex flex-col">
               <div className="p-4 font-medium text-sm text-muted-foreground border-b">
                 {labels.chapterList}
               </div>
               <ScrollArea className="flex-1">
                 <div className="p-2 space-y-1">
                    {story.chapters.map((chapter, idx) => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                            // Can't directly set index via hook, but we can navigate 
                            // by calculating difference, or just relying on Next/Prev buttons as per current design
                            // For this simple UI, we'll keep it simple or implement a 'jumpTo' if needed later.
                            // Currently the hook doesn't expose a 'setIndex' directly to the outside in the snippet provided previously,
                            // but we can add it if needed. For now, this list is visual primarily.
                            // If we want to make it clickable, we'd need to update use-story.
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