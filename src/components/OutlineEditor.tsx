import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OutlineItem } from "@/lib/types";
import { ArrowDown, ArrowUp, Plus, Trash2, GripVertical } from "lucide-react";

interface OutlineEditorProps {
  outline: OutlineItem[];
  onChange: (newOutline: OutlineItem[]) => void;
}

export function OutlineEditor({ outline, onChange }: OutlineEditorProps) {
  const handleUpdate = (index: number, field: keyof OutlineItem, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    onChange(newOutline);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === outline.length - 1) return;

    const newOutline = [...outline];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    [newOutline[index], newOutline[targetIndex]] = [newOutline[targetIndex], newOutline[index]];
    onChange(newOutline);
  };

  const handleDelete = (index: number) => {
    const newOutline = outline.filter((_, i) => i !== index);
    onChange(newOutline);
  };

  const handleAdd = () => {
    const newOutline = [
      ...outline, 
      { title: `Chapter ${outline.length + 1}`, description: "" }
    ];
    onChange(newOutline);
  };

  return (
    <div className="space-y-4">
      {outline.map((item, index) => (
        <div key={index} className="flex gap-2 items-start p-3 bg-card border rounded-lg shadow-sm group">
          <div className="flex flex-col gap-1 mt-1 text-muted-foreground">
             <div className="h-6 w-6 flex items-center justify-center cursor-move">
               <span className="text-xs font-mono font-bold text-muted-foreground/50">#{index + 1}</span>
             </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <Input 
              value={item.title} 
              onChange={(e) => handleUpdate(index, "title", e.target.value)}
              className="font-semibold"
              placeholder="Chapter Title"
            />
            <Textarea 
              value={item.description}
              onChange={(e) => handleUpdate(index, "description", e.target.value)}
              className="text-sm min-h-[80px]"
              placeholder="Chapter summary/instructions..."
            />
          </div>

          <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleMove(index, "up")}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleMove(index, "down")}
              disabled={index === outline.length - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={() => handleDelete(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" /> Add Chapter
      </Button>
    </div>
  );
}