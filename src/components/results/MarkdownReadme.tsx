import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownReadmeProps {
  content: string;
  maxLength?: number;
}

const MarkdownReadme = ({ content, maxLength = 8000 }: MarkdownReadmeProps) => {
  const trimmed = content.slice(0, maxLength);

  return (
    <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary hover:prose-a:underline prose-code:text-foreground prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:border-0 prose-pre:rounded-none prose-pre:p-0 prose-pre:text-foreground prose-pre:overflow-x-auto prose-img:rounded-lg prose-img:max-h-80 prose-strong:text-foreground prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/90 prose-hr:border-border prose-blockquote:border-border prose-blockquote:text-foreground/80 prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownReadme;
