
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormActionsProps {
  isSubmitting: boolean;
  isEdit: boolean;
  isUserAuthenticated: boolean;
}

const FormActions = ({ isSubmitting, isEdit, isUserAuthenticated }: FormActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <Button type="submit" disabled={isSubmitting || !isUserAuthenticated}>
        {isEdit ? "Update" : "Create"} Post
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/dashboard/blog")}
      >
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
