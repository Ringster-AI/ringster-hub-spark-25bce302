
import { FormDescription } from "@/components/ui/form";

const MarkdownHelp = () => {
  return (
    <FormDescription>
      You can use Markdown formatting:
      <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
        <li># Heading 1, ## Heading 2, ### Heading 3</li>
        <li>**bold text**, *italic text*</li>
        <li>- List item, 1. Numbered list</li>
        <li>[Link text](url)</li>
        <li>` code `</li>
      </ul>
    </FormDescription>
  );
};

export default MarkdownHelp;
