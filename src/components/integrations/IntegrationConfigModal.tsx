
import { useState } from "react";
import { Integration } from "@/types/integrations/index";
import { IntegrationRegistry } from "@/services/integrations/IntegrationRegistry";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IntegrationConfigModalProps {
  integration: Integration;
  onSave: (integration: Integration, configuration: Record<string, any>) => void;
  onClose: () => void;
}

export function IntegrationConfigModal({
  integration,
  onSave,
  onClose
}: IntegrationConfigModalProps) {
  const [configuration, setConfiguration] = useState(integration.configuration || {});

  const integrationType = IntegrationRegistry.getTypeByKey(integration.integration_type);
  const schema = integrationType?.configurationSchema || {};

  const handleSave = () => {
    onSave(integration, configuration);
  };

  const renderField = (key: string, field: any) => {
    const value = configuration[key] ?? field.default;

    switch (field.type) {
      case 'string':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Input
              id={key}
              value={value || ''}
              onChange={(e) => setConfiguration(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={field.description}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) => setConfiguration(prev => ({ 
                ...prev, 
                [key]: parseInt(e.target.value) || field.default 
              }))}
              min={field.min}
              max={field.max}
              placeholder={field.description}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={key}>{field.label}</Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={key}
              checked={value || false}
              onCheckedChange={(checked) => setConfiguration(prev => ({ ...prev, [key]: checked }))}
            />
          </div>
        );

      case 'time':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Input
              id={key}
              type="time"
              value={value || ''}
              onChange={(e) => setConfiguration(prev => ({ ...prev, [key]: e.target.value }))}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'array':
        if (field.items?.enum) {
          return (
            <div key={key} className="space-y-2">
              <Label>{field.label}</Label>
              <div className="grid grid-cols-2 gap-2">
                {field.items.enum.map((enumValue: any, index: number) => (
                  <div key={enumValue} className="flex items-center space-x-2">
                    <Switch
                      id={`${key}-${enumValue}`}
                      checked={(value || []).includes(enumValue)}
                      onCheckedChange={(checked) => {
                        const currentArray = value || [];
                        const newArray = checked
                          ? [...currentArray, enumValue]
                          : currentArray.filter((v: any) => v !== enumValue);
                        setConfiguration(prev => ({ ...prev, [key]: newArray }));
                      }}
                    />
                    <Label htmlFor={`${key}-${enumValue}`} className="text-sm">
                      {field.items.enumNames?.[index] || enumValue}
                    </Label>
                  </div>
                ))}
              </div>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
          );
        }
        break;

      case 'textarea':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Textarea
              id={key}
              value={value || ''}
              onChange={(e) => setConfiguration(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={field.description}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {integration.display_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(schema).map(([key, field]) => renderField(key, field))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
