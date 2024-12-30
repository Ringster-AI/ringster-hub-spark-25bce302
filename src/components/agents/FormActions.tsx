import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  disabled?: boolean;
}

export const FormActions = ({ onCancel, disabled }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 sticky bottom-0 bg-background py-4 border-t">
      <Button variant="outline" onClick={onCancel} type="button">
        Cancel
      </Button>
      <Button type="submit" disabled={disabled}>
        Create Agent
      </Button>
    </div>
  );
};