import React, { useState, useEffect } from "react";
import speakingAvatar from "./speaking-avatar.png"; // Speaking avatar image
import idleAvatar from "./idle-avatar.png"; // Idle avatar image

const TextToSpeechComponent = ({ text }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);

  const detectLanguage = (text) => {
    const defaultLang = "en-US";
    const hindiRegex = /[\u0900-\u097F]/; // Unicode for Hindi/Marathi
    if (hindiRegex.test(text)) return "hi-IN";
    return defaultLang;
  };

  const speakText = (text, lang, startIndex = 0) => {
    const phrases = text.split(/\s+/); // Split into words
    let index = startIndex;

    const speakPhrase = () => {
      if (index < phrases.length) {
        const phrase = phrases[index];
        const speech = new SpeechSynthesisUtterance(phrase);
        speech.lang = lang;

        speech.onboundary = (event) => {
          if (event.name === "word") {
            setCurrentWordIndex(index); // Highlight the current word
          }
        };

        speech.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };

        speech.onend = () => {
          const delay = phrase.match(/[.!?]/)
            ? 30 // Short delay for periods, question marks
            : phrase.match(/[,;]/)
            ? 20 // Shorter delay for commas, semicolons
            : 5; // Minimal delay for spaces
          setTimeout(() => {
            index++;
            setResumeIndex(index); // Save progress for resume
            speakPhrase();
          }, delay);
        };

        window.speechSynthesis.speak(speech);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      }
    };

    speakPhrase();
  };

  const handlePlayPause = () => {
    const lang = detectLanguage(text);
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      speakText(text, lang, resumeIndex);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setResumeIndex(0); // Reset to start
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Cleanup on unmount
    };
  }, []);

  return (
    <div>
      <div className="avatar-container">
        <img
          src={isSpeaking ? speakingAvatar : idleAvatar}
          alt={isSpeaking ? "Speaking Avatar" : "Idle Avatar"}
          className="avatar"
        />
      </div>
      <div>
        <button onClick={handlePlayPause}>
          {isSpeaking && !isPaused ? "Pause" : "Play"}
        </button>
        <button onClick={handleStop} disabled={!isSpeaking}>
          Stop
        </button>
      </div>
      <div className="text-container">
        {text.split(/\s+/).map((word, i) => (
          <span
            key={i}
            className={
              i === currentWordIndex ? "highlighted-word" : "normal-word"
            }
          >
            {word + " "}
          </span>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [text, setText] = useState("");

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div className="app-container">
      <h1>Text-to-Speech App</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        className="text-area"
        rows={10}
        placeholder="Enter your text here..."
      />
      <TextToSpeechComponent text={text} />
    </div>
  );
};

export default App;
