import React from 'react'

function PromptSuggestionButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button 
      className='prompt-suggestions-button'
      onClick={onClick}
    >
      {text}
    </button>
  )
}

export default PromptSuggestionButton