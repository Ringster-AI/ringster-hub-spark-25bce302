import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookiePreferencesModal } from "./CookiePreferencesModal";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsentBanner = () => {
  const { showBanner, setShowBanner, acceptAll, rejectNonEssential, preferences, saveConsent } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);

  if (!showBanner && !showPreferences) return null;

  if (showPreferences) {
    return (
      <CookiePreferencesModal
        open={showPreferences}
        onOpenChange={setShowPreferences}
        currentPreferences={preferences}
        onSave={saveConsent}
      />
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                We use cookies to enhance your experience
              </p>
              <p className="text-xs text-muted-foreground">
                We use cookies and similar technologies to provide essential functionality, analyze site usage, 
                and deliver personalized content. You can choose to accept all cookies or customize your preferences.
                Learn more in our{" "}
                <Link to="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="text-xs"
            >
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rejectNonEssential}
              className="text-xs"
            >
              Reject Non-Essential
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="text-xs bg-primary hover:bg-primary/90"
            >
              Accept All
            </Button>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 md:static p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
