import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
}

export const FormActions = ({ onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 sticky bottom-0 bg-background py-4 border-t">
      <Button variant="outline" onClick={onCancel} type="button">
        Cancel
      </Button>
      <Button type="submit">Create Agent</Button>
    </div>
  );
};