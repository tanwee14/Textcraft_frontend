import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/firebase.jsx'; // Assuming Firebase context is set up correctly
import '../styles/HistoryPage.css';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null); // Tracks which item is expanded
  const { fetchUserHistory, getUser, deleteHistoryItem, clearUserHistory } = useFirebase(); // Access fetchUserHistory from context
  const [copied, setCopied] = useState(false); // State to track if content is copied

  const copyToClipboard = (item) => {
    const content = JSON.stringify(item, null, 2); // Convert item to string
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard');
      setCopied(true); // Set copied state to true
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("Do you really want to delete this item?");
    if (confirmDelete) {
      try {
        await deleteHistoryItem(itemId); // Call the delete function from context
        setHistory((prevHistory) => prevHistory.filter(item => item.id !== itemId)); // Remove deleted item from state
      } catch (error) {
        console.error('Error deleting history item:', error);
      }
    }
  };

  const handleClearHistory = async () => {
    const confirmClear = window.confirm("Do you really want to clear history ?");
    if(confirmClear) {
      try {
        await clearUserHistory(); // Call the clear history function from context
        setHistory([]); // Clear the local state
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = getUser(); // Fetch the current user
        if (user) {
          const historyList = await fetchUserHistory(user.uid); // Pass userId to fetchUserHistory
          setHistory(historyList);
        } else {
          console.error("No user is logged in.");
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [fetchUserHistory, getUser]);

  const toggleExpand = (id) => {
    setExpandedItemId((prevId) => (prevId === id ? null : id)); // Toggle expanded view
  };

  return (
    <div className="history-page">
      <h1>Your History</h1>
      <button className="clear-history-button" onClick={handleClearHistory}>
        Clear History
      </button>
      <div className="history-list">
        {history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className={`history-item ${expandedItemId === item.id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(item.id)}
            >
              {/* Show initial content */}
              <div className="history-initial">
                <p><strong>Action Type:</strong> {item.actionType}</p>
                <p><strong>Created At:</strong> {item.createdAt?.toDate().toLocaleString()}</p>
                <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                  🗑️ {/* Dustbin icon for delete */}
                </button>
              </div>
              
              {/* Show more content if expanded */}
              {expandedItemId === item.id && item.actionData && (
                <div className="history-full">
                  {/* Conditional rendering based on actionType */}
                  {item.actionType === 'Email Generation' ? (
                    <>
                      <p><strong>Sender Name:</strong> {item.actionData.senderName || 'N/A'}</p>
                      <p><strong>Recipient Name:</strong> {item.actionData.recipientName || 'N/A'}</p>
                      <p><strong>Purpose:</strong> {item.actionData.purpose || 'N/A'}</p>
                      <p><strong>Email Length:</strong> {item.actionData.emailLength || 'N/A'}</p>
                      <p><strong>Tone:</strong> {item.actionData.tone || 'N/A'}</p>
                      <p><strong>Email Content:</strong></p>
                      <div className="email-content">
                        <pre>{item.actionData.emailContent}</pre>
                      </div>
                    </>
                  ) : item.actionType === 'Summary Generation ' ? (
                    <>
                      <p><strong>Summary:</strong></p>
                      <div className="summary-content">
                        <p>{item.actionData || 'No summary available.'}</p>
                      </div>
                    </>
                  ) :item.actionType === 'Tone Enhancement' ? (
                    <>
                      <p><strong>Tone:</strong> {item.actionData.tone || 'N/A'}</p>
                      {item.actionData.enhancedText && (
                        <>
                          <p><strong>Enhanced Text:</strong></p>
                          <div className="enhanced-text">
                            <p>{item.actionData.enhancedText}</p>
                          </div>
                        </>
                      )}
                      {item.actionData.rephrasedText && (
                        <>
                          <p><strong>Rephrased Text:</strong></p>
                          <div className="rephrased-text">
                            <p>{item.actionData.rephrasedText}</p>
                          </div>
                        </>
                      )}
                    </>
                  ) : item.actionType === 'Text Paraphraser' ? (
                    <>
                      <p><strong>Paraphrased Text:</strong></p>
                      <div className="paraphrase-content">
                        {item.actionData.paraphrases && item.actionData.paraphrases.length > 0 ? (
                          item.actionData.paraphrases.map((paraphrase, index) => (
                            <div key={index}>
                              <p>{paraphrase}</p>
                            </div>
                          ))
                        ) : (
                          <p>No paraphrases available.</p>
                        )}
                      </div>
                    </>
                  ) : item.actionType === 'Image-to-Text Generation' ? (
                    <>
                      {/* <p><strong>Uploaded Image:</strong></p> */}
                      {/* Uncomment the following line to display the uploaded image */}
                      {/* <div className="image-container">
                        <img src={item.actionData.image_url} alt="Uploaded Image" className="uploaded-image" />
                      </div> */}
                      <p><strong>Query:</strong></p>
                      <div className="extracted-text">
                        <p>{item.actionData.query || 'No text extracted.'}</p>
                      </div>
                      <p><strong>Extracted Text:</strong></p>
                      <div className="extracted-text">
                        <p>{item.actionData.extractedDetails || 'No text extracted.'}</p>
                      </div>
                      <p><strong>Generated Text:</strong></p>
                      <div className="extracted-text">
                        <p>{item.actionData.generatedDetails || 'No text extracted.'}</p>
                      </div>
                    </>
                  ) : (
                    <p><strong>Unknown Action Type</strong></p>
                  )}

                  <button 
                    className="copy-button" 
                    onClick={() => copyToClipboard(item)}
                  >
                    {copied ? '✔ Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No history available.</p>
        )}
      </div>
    </div>
  );
}
