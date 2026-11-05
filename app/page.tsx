"use client";

import { useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import f1GPTLogo from "./assets/f1GPTLogo.png";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

// import { message } from "ai";

export default function Home() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    onFinish: ({ message }) => console.log("Réponse reçue :", message),
    onError: (error) => console.error(error),
  });

  const noMessage = !messages.length;
  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }

  return (
    <>
      <Image
        src={f1GPTLogo}
        alt="F1 GPT Logo"
        width={250}
        height={37}
        priority
        className=""
      />

      <main className="flex">
        <section className={!noMessage ? "populated" : ""}>
          {noMessage ? (
            <>
              <h1 className="text-white font-black text-6xl mb-12">
                Welcome to <span className="font-sans italic text-[#F70000]">F1GPT</span>
              </h1>
              <p className="starter-text mt-12">
                The Ultimate place for Fomrula One super Fans!
                Ask F1 GPT anything about the sport, its history, and its drivers.
                and it will provide you with accurate and relevant answers.
              </p>
              <br />

              <p className="uppercase enjoy-text">
                We hope you enjoy!
              </p>

              {/* Should not pass onPromptClick but on a small app like this, let's say it's ok */}
              <PromptSuggestionsRow onPromptClick={handlePromptClick}/>
            </>
          ) : (
            <>
              {messages.map((message, index) => (
                <Bubble key={index} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
            </>
          )}
        </section>

        <form onSubmit={handleSubmit} className="chat-input">
            <input 
              className="question-box" 
              placeholder="Ask F1 GPT anything..." 
              onChange={handleInputChange}
              value={input}
            />
            <input type="submit" value="Submit" /> 
          </form>
      </main>
    </>
  );
}
