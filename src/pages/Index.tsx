import { useState } from "react";
import { useStory } from "@/hooks/use-story";
import { SettingsDialog } from "@/components/SettingsDialog";
import { PlanningView } from "@/components/PlanningView";
import { KindleView } from "@/components/KindleView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Feather, Trash2, Download } from "lucide-react";

const Index = () => {
  const {
    config,
    updateConfig,
    prompts,
    updatePrompts,
    story,
    updatePlan,
    generatePlan,
    generateChapter,
    editChapter,
    navigateChapter,
    resetStory,
    downloadStory,
    isGenerating,
  } = useStory();

  const [activeTab, setActiveTab] = useState("plan");

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Bar */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Feather className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Inkwell</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {story.hasPlan && (
             <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadStory}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          )}
          {story.hasPlan && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={resetStory}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
          <SettingsDialog
            config={config}
            prompts={prompts}
            onUpdateConfig={updateConfig}
            onUpdatePrompts={updatePrompts}
          />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="plan">Plan & Outline</TabsTrigger>
              <TabsTrigger value="write" disabled={!story.hasPlan}>Reader & Writer</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plan" className="mt-0">
            <PlanningView
              plan={story.plan}
              hasPlan={story.hasPlan}
              onGenerate={(inputs) => {
                generatePlan(inputs);
                // We stay on plan tab to let them review it, but we could switch
              }}
              onUpdate={updatePlan}
              isGenerating={isGenerating}
            />
          </TabsContent>

          <TabsContent value="write" className="mt-0">
            <KindleView
              story={story}
              onGenerateChapter={generateChapter}
              onEditChapter={editChapter}
              onNavigate={navigateChapter}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <MadeWithDyad />
    </div>
  );
};

export default Index;