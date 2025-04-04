import React, { useState, useEffect } from 'react';
import '../styles/Loader.css';

export default function Loader() {
  const [loadingText, setLoadingText] = useState('AI is generating your output');
  const loadingMessages = [
    'AI is generating your output',
    'Just wait a little longer',
    'Analyzing data for you',
    'Crafting the perfect response',
    'Almost there, hang tight!',
    'Putting the finishing touches'
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingText(prevText => {
        const currentIndex = loadingMessages.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="lilac-loader-container" aria-live="polite">
      <div className="lilac-loader">
        <div className="lilac-loader-circle"></div>
        <div className="lilac-loader-circle"></div>
        <div className="lilac-loader-circle"></div>
      </div>
      <p className="lilac-loader-text">{loadingText}</p>
    </div>
  );
}