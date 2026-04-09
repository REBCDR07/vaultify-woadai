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
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-rajdhani prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-accent prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-img:rounded-lg prose-img:max-h-64 prose-strong:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownReadme;
