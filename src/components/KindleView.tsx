import { useState, useEffect } from "react";
import { StoryState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, BookOpen, PenTool, Loader2, Edit2, Save, X } from "lucide-react";

interface KindleViewProps {
  story: StoryState;
  onGenerateChapter: (instructions: string) => void;
  onNavigate: (direction: "next" | "prev") => void;
  onEditChapter: (index: number, content: string) => void;
  isGenerating: boolean;
}

export function KindleView({ story, onGenerateChapter, onNavigate, onEditChapter, isGenerating }: KindleViewProps) {
  const [instructions, setInstructions] = useState("");
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const currentChapter = story.chapters[story.currentChapterIndex];
  
  // Reset edit state when chapter changes
  useEffect(() => {
    setIsEditing(false);
    if (currentChapter) {
      setEditContent(currentChapter.content);
    }
  }, [story.currentChapterIndex, currentChapter]);

  // Auto-fill instructions from outline when ready to write next chapter
  useEffect(() => {
    const nextChapterNum = story.chapters.length + 1;
    // Check if we are at the "end" (viewing last chapter) or starting fresh
    const isAtEnd = story.chapters.length === 0 || story.currentChapterIndex === story.chapters.length - 1;
    
    if (isAtEnd && story.plan.outline) {
      // Try to find the specific line in the outline for this chapter
      const outlineLines = story.plan.outline.split('\n').filter(line => line.trim().length > 0);
      
      // Heuristic: Look for lines starting with the number or "Chapter X"
      const regex = new RegExp(`^(?:Chapter\\s+)?${nextChapterNum}[.:\\-]\\s*(.+)`, 'i');
      const matchLine = outlineLines.find(line => regex.test(line));
      
      if (matchLine) {
        const match = matchLine.match(regex);
        if (match && match[1]) {
           setInstructions(match[1].trim());
           return;
        }
      }
      
      // Fallback: If we assume the outline is a simple ordered list, grab by index
      // (Adjusting for 0-based index vs 1-based chapter)
      // This is risky if the outline has a preamble, so we only do it if the line starts with a number
      if (outlineLines[nextChapterNum - 1] && /^\d/.test(outlineLines[nextChapterNum - 1])) {
         setInstructions(outlineLines[nextChapterNum - 1].replace(/^\d+[.:\-]\s*/, "").trim());
      }
    }
  }, [story.chapters.length, story.currentChapterIndex, story.plan.outline]);

  const handleSave = () => {
    onEditChapter(story.currentChapterIndex, editContent);
    setIsEditing(false);
  };

  const progress = story.chapters.length > 0 
    ? Math.round(((story.currentChapterIndex + 1) / story.chapters.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 sm:p-8 bg-[#e0e0e0] text-[#333]">
      {/* OPEN BOOK FRAME */}
      <div className="relative w-full max-w-6xl bg-[#faf9f6] shadow-2xl rounded-md border border-gray-300 overflow-hidden min-h-[85vh] flex flex-col">
        
        {/* HEADER */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-8 bg-[#fdfbf7] sticky top-0 z-10">
          <span className="text-sm font-serif italic text-gray-500 truncate max-w-[300px]">
            {story.plan.title || "Untitled Story"}
          </span>
          <div className="flex items-center gap-4">
            {currentChapter && !isEditing && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" onClick={() => { setIsEditing(true); setEditContent(currentChapter.content); }}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-gray-400 font-mono">
              {story.chapters.length > 0 ? `Page ${story.currentChapterIndex + 1} of ${story.chapters.length}` : "Cover"}
            </span>
          </div>
        </div>

        {/* BOOK CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 font-serif text-lg md:text-xl leading-relaxed text-gray-800 bg-[#faf9f6]">
          {story.chapters.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-gray-400">
              <div className="p-8 rounded-full bg-gray-50 border-4 border-double border-gray-200">
                <BookOpen className="h-16 w-16 opacity-30" />
              </div>
              <div>
                <p className="text-xl font-serif text-gray-600 mb-2">The pages are empty.</p>
                <p className="text-sm">Use the authoring tools below to begin your story.</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700 h-full max-w-none">
              <h2 className="text-3xl font-bold mb-12 text-center font-serif text-gray-900 tracking-wide">{currentChapter.title}</h2>
              {isEditing ? (
                <div className="flex flex-col gap-4 h-full max-w-3xl mx-auto">
                  <Textarea 
                    className="flex-1 min-h-[500px] font-serif text-lg leading-relaxed bg-white border-gray-200 shadow-inner p-6"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 sticky bottom-0 bg-[#faf9f6] py-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // 2-COLUMN LAYOUT FOR DESKTOP
                <div className="prose prose-lg max-w-none md:columns-2 md:gap-16 md:rule-solid md:rule-gray-200 text-justify">
                    <div className="whitespace-pre-wrap">{currentChapter.content}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER / CONTROLS */}
        {!isEditing && (
          <div className="border-t border-gray-200 bg-[#fdfbf7] p-6">
            
            {/* NAVIGATION */}
            {story.chapters.length > 0 && (
              <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
                <Button 
                  variant="outline" 
                  className="w-32"
                  onClick={() => onNavigate("prev")} 
                  disabled={story.currentChapterIndex <= 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                
                <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden sm:block">
                  {progress}% Complete
                </span>
                
                <Button 
                  variant="outline" 
                  className="w-32"
                  onClick={() => onNavigate("next")} 
                  disabled={story.currentChapterIndex >= story.chapters.length - 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* GENERATION CONTROLS (Only show if at the end or empty) */}
            {(story.chapters.length === 0 || story.currentChapterIndex === story.chapters.length - 1) && (
               <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <PenTool className="h-4 w-4 text-indigo-600" />
                    <Label className="text-xs uppercase text-indigo-900 font-bold tracking-wider">
                    Next Chapter Instruction
                    </Label>
                 </div>
                 
                 <div className="grid gap-4">
                    <Textarea
                        placeholder="Specific instructions for what happens next? (Auto-filled from outline)"
                        className="text-sm bg-gray-50 border-gray-200 min-h-[80px]"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        disabled={isGenerating}
                    />
                    <Button 
                        className="w-full sm:w-auto self-end bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.02]" 
                        onClick={() => { onGenerateChapter(instructions); setInstructions(""); }}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing Chapter...
                        </>
                        ) : (
                        <>
                            Write Next Chapter
                        </>
                        )}
                    </Button>
                 </div>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}