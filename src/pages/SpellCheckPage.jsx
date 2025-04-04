import React, { useState, useEffect } from 'react';
import { FaCheck, FaCopy, FaMagic } from 'react-icons/fa';
import '../styles/SpellCheckPage.css';

export default function SpellCheckPage() {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSpellCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/spellCheck/correct-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();

      if (response.ok) {
        setCorrectedText(data.corrected_text);
        setCorrections(data.grammar_corrections);
      } else {
        console.error('Error:', data);
        setCorrections([]);
        setCorrectedText('');
      }
    } catch (error) {
      console.error('Error fetching spell check:', error);
      setCorrections([]);
      setCorrectedText('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    setCopied(false);
  }, [correctedText]);

  return (
    <div className="spell-check-page">
      <div className="spell-check-container">
        <h1 className="spell-check-title">Spell Check & Grammar Correction</h1>
        <div className="spell-check-content">
          <div className="input-section">
            <textarea
              value={inputText}
              onChange={handleTextChange}
              placeholder="Enter your text here..."
              className="input-textarea"
            />
            <button 
              onClick={handleSpellCheck} 
              disabled={loading || !inputText.trim()}
              className="check-button"
            >
              {loading ? 'Checking...' : <><FaMagic /> Check Text</>}
            </button>
          </div>
          <div className="output-section">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Checking your text...</p>
              </div>
            ) : (
              <>
                <div className="corrected-text">
                  <h2>Corrected Text:</h2>
                  <p>{correctedText || 'No corrections needed.'}</p>
                  {correctedText && (
                    <button onClick={handleCopy} className="copy-button">
                      {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy</>}
                    </button>
                  )}
                </div>
                <div className="corrections">
                  <h2>Corrections:</h2>
                  {Array.isArray(corrections) && corrections.length > 0 ? (
                    <ul className="corrections-list">
                      {corrections.map((correction, index) => (
                        <li key={index} className="correction-item">
                          <strong>Error:</strong> {correction.error}
                          <br />
                          <strong>Suggestions:</strong> {correction.suggestions.join(', ')}
                          <br />
                          <strong>Message:</strong> {correction.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No corrections found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}