import { useState } from "react";
import { StoryState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, BookOpen, PenTool, Loader2 } from "lucide-react";

interface KindleViewProps {
  story: StoryState;
  onGenerateChapter: (instructions: string) => void;
  onNavigate: (direction: "next" | "prev") => void;
  isGenerating: boolean;
}

export function KindleView({ story, onGenerateChapter, onNavigate, isGenerating }: KindleViewProps) {
  const [instructions, setInstructions] = useState("");
  const [showControls, setShowControls] = useState(false);

  const currentChapter = story.chapters[story.currentChapterIndex];
  const isLastChapter = story.currentChapterIndex === story.chapters.length - 1;
  // If we have no chapters yet, or we are at the very end and want to write the next one
  const showWriteMode = story.chapters.length === 0 || (isLastChapter && !isGenerating); 

  // Calculate progress
  const progress = story.chapters.length > 0 
    ? Math.round(((story.currentChapterIndex + 1) / story.chapters.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 bg-[#f5f5f5] text-[#333]">
      {/* KINDLE DEVICE FRAME */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm border border-gray-300 overflow-hidden min-h-[80vh] flex flex-col">
        
        {/* HEADER */}
        <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <span className="text-xs font-serif italic text-gray-500 truncate max-w-[200px]">
            {story.plan.title || "Untitled Story"}
          </span>
          <span className="text-xs text-gray-400">
            {story.chapters.length > 0 ? `Loc ${story.currentChapterIndex + 1} / ${story.chapters.length}` : "Start"}
          </span>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 font-serif text-lg leading-relaxed text-gray-800 bg-[#faf9f6]">
          {story.chapters.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <BookOpen className="h-12 w-12 opacity-20" />
              <p>Your story hasn't started yet.</p>
              <p className="text-sm">Use the controls below to write the first chapter.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              <h2 className="text-2xl font-bold mb-8 text-center">{currentChapter.title}</h2>
              <div className="whitespace-pre-wrap">{currentChapter.content}</div>
            </div>
          )}
        </div>

        {/* FOOTER / CONTROLS */}
        <div className="border-t border-gray-100 bg-white p-4 space-y-4">
          
          {/* NAVIGATION */}
          {story.chapters.length > 0 && (
            <div className="flex justify-between items-center px-4 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate("prev")} 
                disabled={story.currentChapterIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-xs text-gray-400">{progress}%</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate("next")} 
                disabled={story.currentChapterIndex >= story.chapters.length - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* GENERATION CONTROLS (Only show if at the end or empty) */}
          {(story.chapters.length === 0 || story.currentChapterIndex === story.chapters.length - 1) && (
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
               <Label className="text-xs uppercase text-gray-400 font-bold mb-2 block">
                 Write Next Chapter
               </Label>
               <Textarea
                 placeholder="Specific instructions for what happens next? (Optional - leave blank to follow outline)"
                 className="mb-3 text-sm bg-white"
                 value={instructions}
                 onChange={(e) => setInstructions(e.target.value)}
                 disabled={isGenerating}
               />
               <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                onClick={() => onGenerateChapter(instructions)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing...
                  </>
                ) : (
                  <>
                    <PenTool className="mr-2 h-4 w-4" /> Generate Chapter
                  </>
                )}
              </Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}