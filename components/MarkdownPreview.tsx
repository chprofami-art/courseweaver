
import React from 'react';

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-white flex items-center justify-center">
        <div className="text-slate-400 italic text-center">
          Generated content preview will appear here.
        </div>
      </div>
    );
  }

  // NOTE: This is a basic renderer for demonstration. For full Markdown support, a library is recommended.
  const createMarkup = (text: string) => {
    let html = text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>");
    return { __html: html };
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto prose prose-slate max-w-none bg-white">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} dangerouslySetInnerHTML={createMarkup(line.substring(4))} />;
        if (line.startsWith('## ')) return <h2 key={i} dangerouslySetInnerHTML={createMarkup(line.substring(3))} />;
        if (line.startsWith('# ')) return <h1 key={i} dangerouslySetInnerHTML={createMarkup(line.substring(2))} />;
        if (line.match(/^\s*[-*] /)) {
          return (
            <ul key={i} className="list-disc ml-5"><li dangerouslySetInnerHTML={createMarkup(line.replace(/^\s*[-*] /, ''))} /></ul>
          );
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} dangerouslySetInnerHTML={createMarkup(line)} />;
      })}
    </div>
  );
};

export default MarkdownPreview;
