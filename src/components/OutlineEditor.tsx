import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OutlineItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface OutlineEditorProps {
  items: OutlineItem[];
  onChange: (items: OutlineItem[]) => void;
  labels: any;
}

interface SortableItemProps {
  item: OutlineItem;
  onUpdate: (id: string, field: "title" | "description", value: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

function SortableItem({ item, onUpdate, onDelete, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-md p-3 mb-2 flex items-start gap-2 shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex gap-2 items-center">
            <span className="text-xs font-mono text-muted-foreground w-6 pt-1">
                #{index + 1}
            </span>
            <Input
            value={item.title}
            onChange={(e) => onUpdate(item.id, "title", e.target.value)}
            className="font-semibold h-8"
            placeholder="Chapter Title"
            />
        </div>
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate(item.id, "description", e.target.value)}
          className="text-sm min-h-[60px]"
          placeholder="Chapter Description"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.id)}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 mt-1"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function OutlineEditor({ items, onChange, labels }: OutlineEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleUpdate = (id: string, field: "title" | "description", value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    const newItem: OutlineItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
    };
    onChange([...items, newItem]);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="outline" onClick={handleAdd} className="w-full border-dashed">
        <Plus className="mr-2 h-4 w-4" /> {labels.addChapterBtn}
      </Button>
    </div>
  );
}