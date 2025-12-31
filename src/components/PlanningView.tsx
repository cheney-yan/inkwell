import { useState, useEffect } from "react";
import { StoryPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PlanningViewProps {
  plan: StoryPlan;
  onGenerate: (inputs: Partial<StoryPlan>) => void;
  onUpdate: (plan: StoryPlan) => void;
  isGenerating: boolean;
  hasPlan: boolean;
}

export function PlanningView({ plan, onGenerate, onUpdate, isGenerating, hasPlan }: PlanningViewProps) {
  // Local state for the inputs before generation, or editing the plan after
  const [formData, setFormData] = useState<StoryPlan>(plan);

  // Update local state when the parent plan changes (e.g., after AI generation)
  useEffect(() => {
    setFormData(plan);
  }, [plan]);

  const handleChange = (field: keyof StoryPlan, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (hasPlan) {
      onUpdate(updated);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Novel Planner</CardTitle>
          <CardDescription>
            {hasPlan ? "Review and refine your novel's plan before writing." : "Define the core elements of your story and let AI build the outline."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Language</Label>
              <Input 
                value={formData.language} 
                onChange={(e) => handleChange("language", e.target.value)}
                placeholder="English, Spanish, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Approx. Chapters</Label>
              <Input 
                type="number" 
                value={formData.totalChapters} 
                onChange={(e) => handleChange("totalChapters", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Core Premise / Intro Idea</Label>
            <Textarea 
              className="min-h-[100px]"
              placeholder="A detective discovers a clock that counts backwards..."
              value={formData.premise}
              onChange={(e) => handleChange("premise", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Key Characters</Label>
            <Textarea 
              className="min-h-[80px]"
              placeholder="John: A tired cop. Mary: A mysterious clockmaker..."
              value={formData.characters}
              onChange={(e) => handleChange("characters", e.target.value)}
            />
          </div>

          {/* Fields that are usually populated by AI but editable */}
          {hasPlan && (
            <>
              <div className="space-y-2">
                <Label className="text-primary font-bold">Generated Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold">Generated Outline</Label>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm"
                  value={formData.outline}
                  onChange={(e) => handleChange("outline", e.target.value)}
                />
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end">
            {!hasPlan ? (
              <Button onClick={() => onGenerate(formData)} disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Plan
              </Button>
            ) : (
               <Button variant="outline" className="cursor-default bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                Plan Ready. Switch to Reader to Write.
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}