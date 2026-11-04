import { UIMessage } from '@ai-sdk/react'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from 'react'

function Bubble({ message }: { message: UIMessage }) {
  const bubbleClass = message.role === "user" ? "user" : "assistant";
  return (
    <div className={`bubble ${bubbleClass}`}>
      {message.parts.map((part, i) =>
        part.type === "text" ? (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} disallowedElements={["img"]}>
            {part.text}
          </ReactMarkdown>
        ) : null
      )}
    </div>
  )
}

export default Bubble