import React, { useState, useEffect } from 'react';
import '../styles/SummarizationPage.css';
import jsPDF from 'jspdf'; // For generating PDF
import { useFirebase } from '../context/firebase.jsx';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx'; // Assuming you have a Loader component

const SummarizationPage = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [length, setLength] = useState(150);
  const [minLength, setMinLength] = useState(30);
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const { getUser, uploadSummaryDocument, fetchLatestSummaryDocument, addHistoryEntry } = useFirebase();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("Please log in to access this feature.");
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="not-authenticated">Please log in to use this feature.</div>;
  }

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert("Please select a document.");
      return;
    }
    setFile(selectedFile);

    await uploadSummaryDocument(selectedFile, user.uid);
    const latestDoc = await fetchLatestSummaryDocument(user.uid);
    console.log('Latest Document:', latestDoc);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleLengthChange = (e) => {
    setLength(e.target.value);
  };

  const handleMinLengthChange = (e) => {
    setMinLength(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Show the loader

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('text', text);
    } else {
      setError("Please provide either text or a file.");
      setIsLoading(false); // Hide the loader
      return;
    }

    formData.append('length', length);
    formData.append('min_length', minLength);

    try {
      const response = await fetch('http://127.0.0.1:8000/summarizer/summarize', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSummary(data.summary);
      setStats(data.stats);

      const actionType = "Summary Generation ";
      const actionData = data.summary;

      // Call addHistoryEntry every time a summary is generated
      await addHistoryEntry(user.uid, actionType, actionData);
      
    } catch (err) {
      setError('Error fetching summary: ' + err.message);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    pdf.text(summary, 10, 10);
    pdf.save('summary.pdf');
  };

  return (
    <div className="summarization-page">
      <div className="input-section">
        <div className="card">
          <h1 className="card-title">Text Summarization</h1>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Enter text to summarize..."
              value={text}
              onChange={handleTextChange}
              className="text-input"
            />
            <div className="file-input-container">
              <input
                type="file"
                accept=".docx,.pdf,.txt"
                onChange={handleFileChange}
                id="file-upload"
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                Upload Document
              </label>
              {file && (
                <span className="file-name">
                  {file.name}
                  <button type="button" onClick={handleRemoveFile} className="remove-file-button">
                    &times; {/* Cross icon */}
                  </button>
                </span>
              )}
            </div>
            <div className="slider-container">
              <label htmlFor="length">Max Length: {length}</label>
              <input
                type="range"
                id="length"
                min="50"
                max="500"
                value={length}
                onChange={handleLengthChange}
                className="slider"
              />
            </div>
            <div className="slider-container">
              <label htmlFor="min_length">Min Length: {minLength}</label>
              <input
                type="range"
                id="min_length"
                min="10"
                max="100"
                value={minLength}
                onChange={handleMinLengthChange}
                className="slider"
              />
            </div>
            <button type="submit" className="submit-button">Summarize</button>
          </form>
          {summary && (
            <button onClick={handleDownloadPDF} className="download-pdf-button">
              Download as PDF
            </button>
          )}
        </div>
      </div>
      <div className="output-section">
        <div className="card">
          <h2 className="card-title">Summary</h2>
          {isLoading ? (
            <Loader />  // Render Loader while loading
          ) : (
            summary ? (
              <div className="summary-content">
                <p>{summary}</p>
                <h3>Statistics:</h3>
                <p>{stats}</p>
              </div>
            ) : (
              !error && (
                <p className="placeholder-text">Your summary will appear here...</p>
              )
            )
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SummarizationPage;
