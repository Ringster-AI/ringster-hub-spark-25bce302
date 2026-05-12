import { useEffect, useState } from "react";
import { PasswordResetForm } from "@/components/settings/PasswordResetForm";
import { Integrations } from "@/components/settings/Integrations";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from "react-router-dom";

const VALID_TABS = ["security", "integrations", "account"] as const;

const Settings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab");
  // Redirect deprecated "calendar" tab to integrations
  const initialTab =
    tabParam === "calendar"
      ? "integrations"
      : VALID_TABS.includes(tabParam as any)
      ? (tabParam as string)
      : "security";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (tabParam !== activeTab) {
      navigate(`/dashboard/settings?tab=${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate, tabParam]);

  useEffect(() => {
    if (tabParam === "calendar") {
      setActiveTab("integrations");
    } else if (tabParam && VALID_TABS.includes(tabParam as any)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
      <div className="max-w-3xl space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-4">
            <TabsList className="w-max md:w-auto">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordResetForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Integrations />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <DeleteAccountSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
