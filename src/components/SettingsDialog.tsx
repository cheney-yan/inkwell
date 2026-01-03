import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun, Download, Upload, RotateCcw } from "lucide-react";
import { StoryConfig, SystemPrompts, LANGUAGES, UI_LABELS, PROMPTS_MAP, DEFAULT_PROMPTS } from "@/lib/types";
import { toast } from "sonner";
import { useRef } from "react";

interface SettingsDialogProps {
  config: StoryConfig;
  prompts: SystemPrompts;
  onUpdateConfig: (c: StoryConfig) => void;
  onUpdatePrompts: (p: SystemPrompts) => void;
}

export function SettingsDialog({
  config,
  prompts,
  onUpdateConfig,
  onUpdatePrompts,
}: SettingsDialogProps) {
  
  const labels = UI_LABELS[config.uiLanguage] || UI_LABELS["en"];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      config: { ...config, apiKey: "" },
      prompts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inkwell-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Settings exported!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        
        let importedCount = 0;
        if (data.config) {
            onUpdateConfig({ ...config, ...data.config });
            importedCount++;
        }
        if (data.prompts) {
            onUpdatePrompts(data.prompts);
            importedCount++;
        }
        
        if (importedCount > 0) {
            toast.success("Settings imported successfully!");
        } else {
            toast.error("Invalid settings file format.");
        }
        
        e.target.value = "";
      } catch (err) {
        console.error("Failed to parse settings file", err);
        toast.error("Failed to parse settings file");
      }
    };
    reader.readAsText(file);
  };

  const handleResetPrompt = (type: keyof SystemPrompts) => {
    if (confirm(`Reset ${type} prompt to default for current language?`)) {
        const defaults = PROMPTS_MAP[config.uiLanguage] || DEFAULT_PROMPTS;
        onUpdatePrompts({
            ...prompts,
            [type]: defaults[type]
        });
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} prompt reset to default`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-background text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings & Configuration</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{labels.general}</TabsTrigger>
            <TabsTrigger value="api">{labels.api}</TabsTrigger>
            <TabsTrigger value="prompts">{labels.prompts}</TabsTrigger>
          </TabsList>
          
          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-4 pt-4">
             <div className="space-y-2">
              <Label>{labels.theme}</Label>
              <div className="flex gap-2">
                <Button 
                  variant={config.theme === 'light' ? "default" : "outline"} 
                  onClick={() => onUpdateConfig({ ...config, theme: "light" })}
                  className="w-full"
                >
                  <Sun className="mr-2 h-4 w-4" /> {labels.light}
                </Button>
                <Button 
                  variant={config.theme === 'dark' ? "default" : "outline"} 
                  onClick={() => onUpdateConfig({ ...config, theme: "dark" })}
                  className="w-full"
                >
                  <Moon className="mr-2 h-4 w-4" /> {labels.dark}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{labels.lang}</Label>
              <Select 
                value={config.uiLanguage} 
                onValueChange={(val) => onUpdateConfig({ ...config, uiLanguage: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing language will also update the default System Prompts.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> {labels.export}
                    </Button>
                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" /> {labels.import}
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".json" 
                        onChange={handleImportFile}
                    />
                </div>
            </div>
          </TabsContent>

          {/* API CONFIG TAB */}
          <TabsContent value="api" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>OpenAI API Key (Optional)</Label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  onUpdateConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="sk-... (leave empty to use server API)"
              />
              <p className="text-xs text-muted-foreground">
                {labels.serverInfo || "Leave empty to use server-side API. Your key is stored locally."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={config.baseUrl}
                onChange={(e) =>
                  onUpdateConfig({ ...config, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1"
              />
              <p className="text-xs text-muted-foreground">
                Only used when API Key is provided. Useful for local LLMs.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                value={config.model}
                onChange={(e) =>
                  onUpdateConfig({ ...config, model: e.target.value })
                }
                placeholder="gpt-4o"
              />
            </div>
          </TabsContent>

          {/* PROMPTS TAB */}
          <TabsContent value="prompts" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <Label>Planning Prompt</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleResetPrompt("planning")}
                    title="Reset to Default"
                    className="h-6 px-2"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" /> Reset
                  </Button>
              </div>
              <Textarea
                className="font-mono text-xs h-32"
                value={prompts.planning}
                onChange={(e) =>
                  onUpdatePrompts({ ...prompts, planning: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">Used when generating the initial story outline.</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <Label>Writing Prompt</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleResetPrompt("writing")}
                    title="Reset to Default"
                    className="h-6 px-2"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" /> Reset
                  </Button>
              </div>
              <Textarea
                className="font-mono text-xs h-32"
                value={prompts.writing}
                onChange={(e) =>
                  onUpdatePrompts({ ...prompts, writing: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">Used when generating chapters.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}