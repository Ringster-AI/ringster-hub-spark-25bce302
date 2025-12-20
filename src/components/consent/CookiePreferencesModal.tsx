import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cookie, BarChart3, Target, Shield } from "lucide-react";
import type { CookiePreferences } from "@/hooks/useCookieConsent";

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPreferences: CookiePreferences | null;
  onSave: (preferences: CookiePreferences) => void;
}

export const CookiePreferencesModal = ({
  open,
  onOpenChange,
  currentPreferences,
  onSave,
}: CookiePreferencesModalProps) => {
  const [analytics, setAnalytics] = useState(currentPreferences?.analytics ?? false);
  const [marketing, setMarketing] = useState(currentPreferences?.marketing ?? false);

  useEffect(() => {
    if (currentPreferences) {
      setAnalytics(currentPreferences.analytics);
      setMarketing(currentPreferences.marketing);
    }
  }, [currentPreferences]);

  const handleSave = () => {
    onSave({
      essential: true,
      analytics,
      marketing,
    });
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    onSave({
      essential: true,
      analytics: true,
      marketing: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Essential Cookies */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <Label className="font-medium">Essential Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Required for the website to function properly. These cannot be disabled.
                  They handle things like authentication, security, and basic functionality.
                </p>
              </div>
            </div>
            <Switch checked={true} disabled className="opacity-50" />
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="analytics" className="font-medium cursor-pointer">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. Includes Google Analytics and Google Tag Manager.
                </p>
              </div>
            </div>
            <Switch
              id="analytics"
              checked={analytics}
              onCheckedChange={setAnalytics}
            />
          </div>

          {/* Marketing Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="marketing" className="font-medium cursor-pointer">
                  Marketing Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Used to track visitors across websites to display relevant advertisements.
                  Includes Meta (Facebook) Pixel for ad targeting and measurement.
                </p>
              </div>
            </div>
            <Switch
              id="marketing"
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            Save Preferences
          </Button>
          <Button onClick={handleAcceptAll}>
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
