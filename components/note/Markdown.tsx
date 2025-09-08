import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export const Markdown = ({ content }: { content: string }) => {
  const pre = content.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `[${t}](/notes/${encodeURIComponent(t)})`);

  return (
    <div className="prose prose-sm max-w-none text-reading-text leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: (props) => <a {...props} className={`note-link ${props.className ?? ""}`} />,
          code: (props) => <code {...props} className="px-1 py-0.5 rounded text-sm font-mono" />,
          blockquote: (props) => <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-muted-foreground" />,          
        }}
      >
        {pre}
      </ReactMarkdown>
    </div>
  );
};
