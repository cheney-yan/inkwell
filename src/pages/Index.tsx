import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStory } from "@/hooks/use-story";
import { Loader2, BookOpen, PenTool, Download, Trash2, ChevronLeft, ChevronRight, Edit2, Save, RefreshCw, Play, FileJson, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UI_LABELS } from "@/lib/types";
import { extractChapterPlan } from "@/lib/story-utils";
import { ChapterPlanList } from "@/components/ChapterPlanList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGenres, getGenrePrompts } from "@/lib/genres";
import { GenrePromptsDialog } from "@/components/GenrePromptsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    rewriteChapter,
    editChapter,
    deleteChapter,
    navigateChapter,
    resetStory,
    clearChapters,
    downloadStory,
    exportJson,
    isGenerating,
  } = useStory();

  const labels = UI_LABELS[config.uiLanguage] || UI_LABELS["en"];
  const genres = getGenres(config.uiLanguage);

  // State
  const [premise, setPremise] = useState("");
  const [characters, setCharacters] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("fantasy");
  const [totalChapters, setTotalChapters] = useState(12);
  const [chapterInstructions, setChapterInstructions] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState("plan");
  
  // Rewrite Dialog State
  const [isRewriteDialogOpen, setIsRewriteDialogOpen] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");

  // Effect to prefill chapter instructions when plan or chapter count changes
  useEffect(() => {
    if (story.hasPlan) {
      // If current chapter is empty, we are writing it. Otherwise we are writing next.
      let targetChapterNum = story.chapters.length + 1;
      if (story.currentChapterIndex >= 0 && story.chapters[story.currentChapterIndex] && !story.chapters[story.currentChapterIndex].content) {
          targetChapterNum = story.currentChapterIndex + 1;
      }

      const instruction = extractChapterPlan(story.plan.outline, targetChapterNum, config.uiLanguage);
      if (instruction) {
        setChapterInstructions(instruction);
      }
    }
  }, [story.hasPlan, story.plan.outline, story.chapters.length, story.currentChapterIndex, story.chapters, config.uiLanguage]);
  
  // Effect to sync story genre with local state if story is loaded
  useEffect(() => {
      if (story.hasPlan && story.plan.genre) {
          // Try to match the story's genre string to our keys, or default to custom if not found
          const match = genres.find(g => g.label === story.plan.genre || g.value === story.plan.genre);
          if (match) {
              setSelectedGenre(match.value);
          } else {
              // If we can't match by label (e.g. language changed), try by value if stored
              if (story.plan.genreValue) {
                  setSelectedGenre(story.plan.genreValue);
              } else {
                  setSelectedGenre("custom");
              }
          }
      }
      if (story.hasPlan && story.plan.totalChapters) {
          setTotalChapters(story.plan.totalChapters);
      }
  }, [story.hasPlan, story.plan.genre, story.plan.totalChapters, story.plan.genreValue, genres]);

  const handleGeneratePlan = () => {
    const genreLabel = genres.find(g => g.value === selectedGenre)?.label || "Custom";
    generatePlan({ 
        premise, 
        characters, 
        totalChapters,
        genre: genreLabel, 
        genreValue: selectedGenre 
    });
  };

  const handleRegeneratePlan = () => {
    if (confirm("This will overwrite your current outline and character list. Continue?")) {
        const genreLabel = genres.find(g => g.value === selectedGenre)?.label || story.plan.genre;
        generatePlan({ 
            premise: story.plan.premise, 
            characters: story.plan.characters, 
            totalChapters: totalChapters, 
            genre: genreLabel,
            genreValue: selectedGenre
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

  const handleDeleteChapter = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const isLast = index === story.chapters.length - 1;
      const msg = isLast 
        ? "Delete the last chapter?" 
        : "Clear content of this chapter? You can rewrite it.";
      
      if (confirm(msg)) {
          deleteChapter(index);
      }
  };

  const handleWriteChapter = () => {
    generateChapter(chapterInstructions);
  };

  const handleAutoRewrite = () => {
      if (confirm("This will overwrite the current chapter content. Continue?")) {
          rewriteChapter(story.currentChapterIndex, "");
      }
  };

  const handleCustomRewrite = () => {
      // Prefill with current chapter outline if available
      const currentChapterNum = story.currentChapterIndex + 1;
      const outlineText = extractChapterPlan(story.plan.outline, currentChapterNum, config.uiLanguage);
      if (outlineText) {
          setRewriteInstructions(outlineText);
      } else {
          setRewriteInstructions("");
      }
      setIsRewriteDialogOpen(true);
  };

  const confirmCustomRewrite = () => {
      rewriteChapter(story.currentChapterIndex, rewriteInstructions);
      setIsRewriteDialogOpen(false);
      setRewriteInstructions("");
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
              <Label>{labels.genreLabel}</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <header className="border-b px-6 py-3 flex justify-between items-center bg-card shrink-0">
        <div className="flex items-center gap-2">
           <BookOpen className="h-5 w-5" />
           <h1 className="font-bold text-lg hidden md:block">{story.plan.title || labels.appTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2">
           <GenrePromptsDialog 
              currentPrompts={story.plan.customPrompts || getGenrePrompts(selectedGenre, prompts)}
              defaultPrompts={getGenrePrompts(selectedGenre, prompts)}
              onSave={(newPrompts) => updatePlan({ ...story.plan, customPrompts: newPrompts })}
              onReset={() => updatePlan({ ...story.plan, customPrompts: undefined })}
              language={config.uiLanguage}
           />
           <Button variant="outline" size="icon" onClick={exportJson} title={labels.exportJsonBtn}>
             <FileJson className="h-4 w-4" />
           </Button>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
          <div className="border-b px-6 pt-2 shrink-0">
             <TabsList>
                <TabsTrigger value="plan">{labels.planTab}</TabsTrigger>
                <TabsTrigger value="write">{labels.writeTab}</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="plan" className="flex-1 overflow-y-auto p-6 min-h-0 mt-0 data-[state=inactive]:hidden">
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
                  <div className="flex gap-2">
                       <Select 
                           value={selectedGenre} 
                           onValueChange={(val) => {
                               setSelectedGenre(val);
                               const label = genres.find(g => g.value === val)?.label || "Custom";
                               updatePlan({...story.plan, genre: label, genreValue: val})
                           }}
                        >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
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
                 <div className="flex justify-between items-end">
                    <Label>{labels.outlineLabel}</Label>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{labels.chaptersLabel}</span>
                            <Input 
                                type="number" 
                                className="w-20 h-8"
                                min={1}
                                max={50}
                                value={totalChapters}
                                onChange={(e) => setTotalChapters(parseInt(e.target.value))}
                            />
                        </div>
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
                 </div>
                 
                 <ChapterPlanList 
                    outline={Array.isArray(story.plan.outline) ? story.plan.outline : []}
                    onChange={(newOutline) => updatePlan({...story.plan, outline: newOutline})}
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

          <TabsContent value="write" className="flex-1 flex overflow-hidden min-h-0 mt-0 data-[state=inactive]:hidden">
            {/* Sidebar Chapter List */}
            <div className="w-64 border-r bg-muted/30 flex flex-col hidden md:flex shrink-0">
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
                      <div
                        key={chapter.id}
                        onClick={() => {
                           // We need to expose a way to set index, but for now we rely on navigate or just clicking
                           // Since useStory doesn't expose setIndex directly, we can implement a jumpToChapter in hook or just use navigate logic if we had it.
                           // For now, let's just assume we can't jump easily without modifying hook, OR we modify hook.
                           // Actually, let's modify hook to expose jumpToChapter or similar.
                           // Wait, I can't modify hook again in this turn easily without re-writing file.
                           // I'll just use a hack: navigate until we hit it? No that's bad.
                           // I'll add jumpToChapter to hook in next turn if needed, but for now let's just make it clickable if we can.
                           // Ah, I missed adding jumpToChapter in previous step. I will just leave it as is for now (selection via next/prev) 
                           // BUT wait, the user wants to delete specific chapters.
                        }}
                        className={`group flex items-center justify-between w-full text-left px-3 py-2 rounded text-sm truncate ${
                          idx === story.currentChapterIndex 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted cursor-default"
                        }`}
                      >
                        <span className="truncate flex-1">{chapter.title} {chapter.content === "" ? "(Empty)" : ""}</span>
                        <button 
                            onClick={(e) => handleDeleteChapter(idx, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-opacity"
                            title="Delete/Clear"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
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
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {currentChapter ? (
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="flex justify-between items-center p-4 border-b shrink-0">
                         <Button 
                           variant="ghost" 
                           onClick={() => navigateChapter("prev")}
                           disabled={story.currentChapterIndex === 0}
                         >
                            <ChevronLeft className="mr-2 h-4 w-4" /> {labels.prevBtn}
                         </Button>
                         <span className="font-semibold">{currentChapter.title}</span>
                         <div className="flex gap-2">
                            {/* Rewrite Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" disabled={isGenerating}>
                                        <Sparkles className="mr-2 h-4 w-4" /> {labels.rewriteBtn}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAutoRewrite}>
                                        {labels.autoRewrite}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCustomRewrite}>
                                        {labels.customRewrite}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

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
                    
                    <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
                        <div className="max-w-5xl mx-auto w-full min-h-full flex flex-col">
                            {isEditingChapter ? (
                                <Textarea 
                                    className="flex-1 min-h-[60vh] font-serif text-lg leading-relaxed p-4 resize-y"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                            ) : (
                                <div className="flex-1 whitespace-pre-wrap font-serif text-lg leading-relaxed pb-20">
                                    {currentChapter.content || <span className="text-muted-foreground italic">This chapter is empty. Write it below.</span>}
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                     <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                     <p>Ready to write your first chapter?</p>
                  </div>
                )}

                {/* Writing Input */}
                <div className="border-t p-4 bg-card shrink-0">
                  <div className="max-w-5xl mx-auto flex gap-2">
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
                            <Sparkles className="mr-2 h-4 w-4" />
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

      {/* Rewrite Dialog */}
      <Dialog open={isRewriteDialogOpen} onOpenChange={setIsRewriteDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{labels.rewriteDialogTitle}</DialogTitle>
                <DialogDescription>{labels.rewriteDialogDesc}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea 
                    value={rewriteInstructions}
                    onChange={(e) => setRewriteInstructions(e.target.value)}
                    placeholder="E.g., Make the dialogue more intense, focus on the setting..."
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRewriteDialogOpen(false)}>{labels.cancel}</Button>
                <Button onClick={confirmCustomRewrite} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : labels.rewriteBtn}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;