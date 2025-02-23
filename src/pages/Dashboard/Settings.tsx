
import { PasswordResetForm } from "@/components/settings/PasswordResetForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="max-w-2xl space-y-6">
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
      </div>
    </div>
  );
};

export default Settings;
