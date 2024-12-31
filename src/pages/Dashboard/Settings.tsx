import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordResetForm } from "@/components/settings/PasswordResetForm";

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordResetForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;