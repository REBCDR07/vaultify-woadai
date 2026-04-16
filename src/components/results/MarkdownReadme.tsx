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
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-label prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-foreground prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-muted-foreground prose-code:text-foreground prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-img:rounded-lg prose-img:max-h-80 prose-img:border prose-img:border-border prose-strong:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border prose-blockquote:border-border prose-blockquote:text-muted-foreground prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownReadme;
