import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
  /** Link 컴포넌트 내부에 렌더링될 때 내부 링크를 비활성화합니다 (중첩 <a> 태그 방지) */
  disableInternalLinks?: boolean;
}

export const Markdown = ({ content, disableInternalLinks = false }: MarkdownProps) => {
  const pre = content.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `[${t}](/notes/${encodeURIComponent(t)})`);

  const isExternalLink = (href: string | undefined): boolean => {
    if (!href) return false;
    return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
  };

  const isInternalLink = (href: string | undefined): boolean => {
    if (!href) return false;
    return href.startsWith("/") || href.startsWith("#");
  };

  return (
    <div className="prose prose-sm max-w-none text-reading-text leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: (props) => {
            const { href, children, ...rest } = props;
            
            // 외부 링크 처리
            if (isExternalLink(href)) {
              // disableInternalLinks가 true면 <span>으로 렌더링 (중첩 <a> 방지)
              if (disableInternalLinks) {
                return (
                  <span
                    {...rest}
                    className={`note-link ${rest.className ?? ""} text-primary underline cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (href) {
                        window.open(href, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {children}
                  </span>
                );
              }
              
              // 일반적으로는 <a> 태그로 렌더링
              return (
                <a
                  {...rest}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`note-link ${rest.className ?? ""}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </a>
              );
            }

            // 내부 링크 처리
            if (isInternalLink(href) && href) {
              // disableInternalLinks가 true면 스타일만 적용 (중첩 <a> 방지)
              if (disableInternalLinks) {
                return (
                  <span
                    className={`note-link ${rest.className ?? ""} text-primary underline`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {children}
                  </span>
                );
              }
              
              // 일반적으로는 Next.js Link 사용
              return (
                <Link
                  href={href}
                  className={`note-link ${rest.className ?? ""} text-primary underline`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </Link>
              );
            }

            // href가 없는 경우 기본 처리
            return (
              <a {...rest} href={href} className={`note-link ${rest.className ?? ""}`}>
                {children}
              </a>
            );
          },
          code: (props) => <code {...props} className="px-1 py-0.5 rounded text-sm font-mono" />,
          blockquote: (props) => <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-muted-foreground" />,
          p: (props) => <p {...props} className="mb-2" />,
        }}
      >
        {pre}
      </ReactMarkdown>
    </div>
  );
};
