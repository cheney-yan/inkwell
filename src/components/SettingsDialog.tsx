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
import { Settings } from "lucide-react";
import { StoryConfig, SystemPrompts } from "@/lib/types";

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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings & Debug</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="prompts">System Prompts (Debug)</TabsTrigger>
          </TabsList>
          
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

          {/* PROMPTS DEBUG TAB */}
          <TabsContent value="prompts" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Planning Prompt</Label>
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
              <Label>Writing Prompt</Label>
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