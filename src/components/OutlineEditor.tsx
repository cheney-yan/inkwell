import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OutlineItem, UI_LABELS } from "@/lib/types";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface OutlineEditorProps {
  outline: OutlineItem[];
  onChange: (newOutline: OutlineItem[]) => void;
  uiLanguage: string;
}

export const OutlineEditor = ({ outline, onChange, uiLanguage }: OutlineEditorProps) => {
  const labels = UI_LABELS[uiLanguage] || UI_LABELS["en"];

  const handleUpdate = (index: number, field: keyof OutlineItem, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    onChange(newOutline);
  };

  const handleDelete = (index: number) => {
    const newOutline = outline.filter((_, i) => i !== index);
    onChange(newOutline);
  };

  const handleAdd = () => {
    const newOutline = [
      ...outline, 
      { 
        id: crypto.randomUUID(), 
        title: `Chapter ${outline.length + 1}`, 
        description: "" 
      }
    ];
    onChange(newOutline);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === outline.length - 1) return;

    const newOutline = [...outline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newOutline[index], newOutline[targetIndex]] = [newOutline[targetIndex], newOutline[index]];
    onChange(newOutline);
  };

  return (
    <div className="space-y-4">
      {outline.map((item, index) => (
        <div key={item.id} className="flex gap-2 items-start border p-3 rounded-lg bg-card/50">
           <div className="flex flex-col gap-1 pt-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                title={labels.moveUp}
              >
                  <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                disabled={index === outline.length - 1}
                onClick={() => handleMove(index, 'down')}
                title={labels.moveDown}
              >
                  <ArrowDown className="h-4 w-4" />
              </Button>
           </div>
           
           <div className="flex-1 space-y-2">
              <Input 
                value={item.title}
                onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                className="font-semibold"
                placeholder="Chapter Title"
              />
              <Textarea
                value={item.description}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                placeholder="Chapter description..."
                rows={3}
                className="text-sm resize-none"
              />
           </div>
           
           <Button 
             variant="ghost" 
             size="icon" 
             className="text-destructive hover:text-destructive hover:bg-destructive/10"
             onClick={() => handleDelete(index)}
             title={labels.deleteBtn}
           >
              <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      ))}
      
      <Button onClick={handleAdd} variant="outline" className="w-full border-dashed">
        <Plus className="mr-2 h-4 w-4" /> {labels.addChapterBtn}
      </Button>
    </div>
  );
};