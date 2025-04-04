import React, { useState, useEffect } from 'react';
import { Mail, Send, User, Users, FileText, Key, Clock } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '../context/firebase.jsx';
import '../styles/EmailGenPage.css';
import Loader from '../components/Loader.jsx'; // Import the Loader component

export default function EmailGenPage() {
  const [emailLength, setEmailLength] = useState('');
  const [tone, setTone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [importantKeywords, setImportantKeywords] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const { addHistoryEntry, getUser } = useFirebase();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        console.log("User email:", user.email);
      } else {
        console.error("No user is signed in.");
      }
    });
    return () => unsubscribe();
  }, []);

  const openGmail = (recipientEmail, generatedEmail, senderEmail) => {
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&body=${encodeURIComponent(generatedEmail)}&reply-to=${senderEmail}`;
    window.open(gmailLink, '_blank');
  };

  const generateEmail = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the generation starts
    setGeneratedEmail(''); // Clear previous email content

    const data = {
      email_length: emailLength,
      tone,
      purpose,
      recipient_name: recipientName,
      sender_name: senderName,
      important_keywords: importantKeywords.split(',').map((keyword) => keyword.trim()),
    };
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/email/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setGeneratedEmail(result.generated_email || result.error || '');

      const user = getUser();
      if (user) {
        const actionType = "Email Generation";
        const actionData = {
          emailContent: result.generated_email || '', 
          emailLength,
          tone,
          purpose,
          recipientName,
          senderName,
          importantKeywords: importantKeywords.split(',').map((keyword) => keyword.trim()),
        };
        await addHistoryEntry(user.uid, actionType, actionData);
        console.log("Email generated and history entry saved successfully!");
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedEmail('An error occurred while generating the email.');
    } finally {
      setLoading(false); // Set loading to false after the generation is done
    }
  };

  return (
    <div className="email-gen-page">
      <div className="email-gen-container">
        <div className="email-form">
          <h1><Mail className="icon" /> Email Generator</h1>
          <form onSubmit={generateEmail}>
            <div className="form-group">
              <label htmlFor="emailLength">
                <Clock className="icon" /> Email Length
              </label>
              <select
                id="emailLength"
                value={emailLength}
                onChange={(e) => setEmailLength(e.target.value)}
                required
              >
                <option value="">Select Length</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tone">
                <FileText className="icon" /> Tone of Email
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                required
              >
                <option value="">Select Tone</option>
                <option value="formal">Formal</option>
                <option value="informal">Informal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">
                <Key className="icon" /> Purpose
              </label>
              <input
                id="purpose"
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., business proposal"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientName">
                <User className="icon" /> Recipient Name
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientEmail">
                <Mail className="icon" /> Recipient Email
              </label>
              <input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g., john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senderName">
                <Users className="icon" /> Sender Name
              </label>
              <input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g., Jane Smith"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="importantKeywords">
                <Key className="icon" /> Important Keywords
              </label>
              <input
                id="importantKeywords"
                type="text"
                value={importantKeywords}
                onChange={(e) => setImportantKeywords(e.target.value)}
                placeholder="e.g., Partnership, Investment, Meeting"
                required
              />
            </div>

            <button type="submit" className="gen-btn">
              Generate <Send className="icon" />
            </button>
          </form>
        </div>

        <div className="gen-email">
          <h2>Generated Email</h2>
          {loading ? (
            <Loader /> // Show the loader when loading
          ) : generatedEmail ? (
            <>
              <div className="email-content" style={{ textAlign: 'left' }}>
                <p><strong>To:</strong> {recipientName}</p>
                <p><strong>From:</strong> {senderName}</p>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  <br></br>
                  {generatedEmail}
                </p>
              </div>
              <button onClick={() => openGmail(recipientEmail, generatedEmail, userEmail)} className="send-gmail-btn">
                Send to Gmail <Send className="icon" />
              </button>
            </>
          ) : (
            <p>Your generated email will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
