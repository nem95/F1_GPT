import PromptSuggestionButton from './PromptSuggestionButton';

function PromptSuggestionsRow({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  const prompts = [
    "What is the history of Formula One?",
    "Who are the most successful drivers in F1?",
    "Explain the rules of Formula One racing.",
    "What are the different types of F1 cars?",
    "How does the F1 points system work?",
  ];

  return (
    <div className='prompt-suggestion-row'>
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  )
}

export default PromptSuggestionsRow