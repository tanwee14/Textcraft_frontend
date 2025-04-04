import React from 'react';
import '../styles/EmailDisplay.css'; // Make sure to import your CSS file

const EmailDisplay = ({ recipientName, senderName, body }) => {
  // Format the body to display with line breaks
  const formatEmailBody = (emailBody) => {
    return emailBody.split('\n').map((line, index) => (
      <p key={index} className="email-line">{line}</p>
    ));
  };

  return (
    <div className="email-display">
      <h2>Email Preview</h2>
      <p><strong>To:</strong> {recipientName}</p>
      <p><strong>From:</strong> {senderName}</p>
      <div className="email-body">
        {/* Ensure the body has a space after the subject */}
        {/* <p className="subject-line"><strong>Subject:</strong></p> */}
        <div>{formatEmailBody(body)}</div>
      </div>
    </div>
  );
};

export default EmailDisplay;
