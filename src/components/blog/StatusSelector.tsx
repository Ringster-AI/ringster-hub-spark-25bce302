
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { BlogPostFormData } from "@/types/blog";

interface StatusSelectorProps {
  control: Control<BlogPostFormData>;
}

const StatusSelector = ({ control }: StatusSelectorProps) => {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={field.value === "draft" ? "default" : "outline"}
              onClick={() => field.onChange("draft")}
            >
              <Badge variant="secondary">Draft</Badge>
            </Button>
            <Button
              type="button"
              variant={field.value === "published" ? "default" : "outline"}
              onClick={() => field.onChange("published")}
            >
              <Badge>Published</Badge>
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StatusSelector;
