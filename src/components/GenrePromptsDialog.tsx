import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, RotateCcw } from "lucide-react";
import { SystemPrompts, UI_LABELS } from "@/lib/types";
import { useState, useEffect } from "react";

interface GenrePromptsDialogProps {
  currentPrompts: SystemPrompts;
  defaultPrompts: SystemPrompts;
  onSave: (prompts: SystemPrompts) => void;
  onReset: () => void;
  language: string;
}

export function GenrePromptsDialog({
  currentPrompts,
  defaultPrompts,
  onSave,
  onReset,
  language
}: GenrePromptsDialogProps) {
  const [prompts, setPrompts] = useState<SystemPrompts>(currentPrompts);
  const [isOpen, setIsOpen] = useState(false);
  
  const labels = UI_LABELS[language] || UI_LABELS["en"];

  // Sync state when props change or dialog opens
  useEffect(() => {
    if (isOpen) {
        setPrompts(currentPrompts);
    }
  }, [isOpen, currentPrompts]);

  const handleSave = () => {
    onSave(prompts);
    setIsOpen(false);
  };

  const handleReset = () => {
    setPrompts(defaultPrompts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title={labels.promptsMenu}>
          <ScrollText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labels.promptsTitle}</DialogTitle>
          <DialogDescription>
            {labels.promptsDesc}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{labels.planningPrompt}</Label>
            <Textarea
              className="font-mono text-xs h-40"
              value={prompts.planning}
              onChange={(e) => setPrompts({ ...prompts, planning: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{labels.writingPrompt}</Label>
            <Textarea
              className="font-mono text-xs h-40"
              value={prompts.writing}
              onChange={(e) => setPrompts({ ...prompts, writing: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-between">
            <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
                <RotateCcw className="mr-2 h-4 w-4" /> {labels.resetPrompts}
            </Button>
            <Button onClick={handleSave}>{labels.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}