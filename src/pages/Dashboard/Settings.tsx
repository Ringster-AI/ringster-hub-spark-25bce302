import { useEffect, useState } from "react";
import { PasswordResetForm } from "@/components/settings/PasswordResetForm";
import { Integrations } from "@/components/settings/Integrations";
import { CalendarSettings } from "@/components/settings/CalendarSettings";
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

const Settings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabParam || "security");

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam !== activeTab) {
      navigate(`/dashboard/settings?tab=${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate, tabParam]);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam && ["security", "integrations", "calendar", "account"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="max-w-3xl space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="calendar" className="space-y-6">
            <CalendarSettings />
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
