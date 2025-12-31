import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface ChapterPlanListProps {
  outline: string[];
  onChange: (newOutline: string[]) => void;
}

export function ChapterPlanList({ outline, onChange }: ChapterPlanListProps) {
  
  const handleEdit = (index: number, val: string) => {
      const newOutline = [...outline];
      newOutline[index] = val;
      onChange(newOutline);
  };

  const handleDelete = (index: number) => {
      const newOutline = outline.filter((_, i) => i !== index);
      onChange(newOutline);
  };

  const handleAdd = () => {
      onChange([...outline, "New Chapter Plan..."]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === outline.length - 1) return;

      const newOutline = [...outline];
      const temp = newOutline[index];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      
      newOutline[index] = newOutline[swapIndex];
      newOutline[swapIndex] = temp;
      onChange(newOutline);
  };

  return (
    <div className="space-y-4">
        {outline.map((item, index) => (
            <div key={index} className="flex gap-2 items-start group">
                <div className="flex flex-col gap-1 pt-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 cursor-grab active:cursor-grabbing" 
                        disabled // Drag n Drop is complex, simple arrows for now? Or just visual handle if no dnd lib.
                        // Actually let's just use simple up/down buttons or keep it simple
                    >
                        <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
                    </Button>
                </div>
                
                <Textarea 
                    value={item}
                    onChange={(e) => handleEdit(index, e.target.value)}
                    className="flex-1 min-h-[80px] text-sm"
                />

                <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                     >
                        ↑
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === outline.length - 1}
                        title="Move Down"
                     >
                        ↓
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(index)}
                        title="Delete"
                     >
                        <Trash2 className="h-4 w-4" />
                     </Button>
                </div>
            </div>
        ))}
        <Button variant="outline" onClick={handleAdd} className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Chapter
        </Button>
    </div>
  );
}