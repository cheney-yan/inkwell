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
import { Switch } from "@/components/ui/switch";
import { Settings, Moon, Sun, Download, Upload, RotateCcw, Server, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StoryConfig, SystemPrompts, LANGUAGES, UI_LABELS, PROMPTS_MAP, DEFAULT_PROMPTS } from "@/lib/types";
import { checkBackendHealth } from "@/lib/openai";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";

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
  
  // Backend health state
  const [backendStatus, setBackendStatus] = useState<{
    checking: boolean;
    available: boolean;
    hasApiKey: boolean;
    model?: string;
  }>({ checking: false, available: false, hasApiKey: false });

  // Check backend health when dialog opens or when useBackendServer changes
  const checkBackend = async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const result = await checkBackendHealth();
    setBackendStatus({
      checking: false,
      available: result.available,
      hasApiKey: result.hasApiKey,
      model: result.model
    });
  };

  useEffect(() => {
    if (config.useBackendServer) {
      checkBackend();
    }
  }, [config.useBackendServer]);

  const handleExport = () => {
    const data = {
      config: { ...config, apiKey: "" }, // Don't export API key
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{labels.general}</TabsTrigger>
            <TabsTrigger value="api">{labels.api}</TabsTrigger>
            <TabsTrigger value="backend">{labels.backendServer}</TabsTrigger>
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
              <Label>OpenAI API Key</Label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  onUpdateConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and never sent to our servers.
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
                Useful for local LLMs (e.g. LM Studio, Ollama) or proxies.
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

          {/* BACKEND SERVER TAB */}
          <TabsContent value="backend" className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-base">{labels.useBackendServer}</Label>
                <p className="text-xs text-muted-foreground">
                  {labels.backendInfo}
                </p>
              </div>
              <Switch
                checked={config.useBackendServer}
                onCheckedChange={(checked) => {
                  onUpdateConfig({ ...config, useBackendServer: checked });
                  if (checked) {
                    checkBackend();
                  }
                }}
              />
            </div>

            {config.useBackendServer && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{labels.backendStatus}</span>
                  <div className="flex items-center gap-2">
                    {backendStatus.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : backendStatus.available ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">{labels.backendAvailable}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">{labels.backendUnavailable}</span>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={checkBackend} disabled={backendStatus.checking}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {backendStatus.available && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Key Configured</span>
                      <span className="text-sm">
                        {backendStatus.hasApiKey ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No - configure in .env</span>
                        )}
                      </span>
                    </div>
                    {backendStatus.model && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{labels.backendModel}</span>
                        <span className="text-sm font-mono">{backendStatus.model}</span>
                      </div>
                    )}
                  </>
                )}

                {!backendStatus.available && !backendStatus.checking && (
                  <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Backend server not running</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      To start the backend server:
                    </p>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-yellow-700 dark:text-yellow-300">
                      <li>Copy <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env.example</code> to <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code></li>
                      <li>Add your OpenAI API key to the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file</li>
                      <li>Run <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">npx tsx server/index.ts</code></li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* PROMPTS DEBUG TAB */}
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