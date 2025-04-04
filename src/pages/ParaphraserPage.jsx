import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clipboard, Send } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth
import { useFirebase } from "../context/firebase.jsx"; // Use the Firebase hook
import '../styles/ParaphraserPage.css';

function ParaphraserPage() {
  const [text, setText] = useState("");
  const [numParaphrases, setNumParaphrases] = useState(1);
  const [numBeams, setNumBeams] = useState(5);
  const [paraphrases, setParaphrases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // State to store user data

  const { addHistoryEntry } = useFirebase(); // Use the Firebase hook to access addHistoryEntry

  // Monitor user authentication status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // If logged in, set user
      } else {
        setUser(null); // If not logged in, clear user
      }
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/paraphraser/paraphrase", {
        text,
        num_paraphrases: numParaphrases,
        num_beams: numBeams,
      });
      setParaphrases(response.data.paraphrases);

      // If user is logged in, add paraphrasing result to history
      if (user) {
        const actionData = {
          originalText: text,
          paraphrases: response.data.paraphrases,
        };
        await addHistoryEntry(user.uid, "Text Paraphraser", actionData);
      }

    } catch (error) {
      console.error("Error fetching paraphrases", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="paraphraser-container">
      <h1 className="paraphraser-title">Paraphrasing Tool</h1>
      <div className="paraphraser-content">
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="text-input">Enter Text:</label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Type or paste your text here..."
              />
            </div>
            <div className="input-controls">
              <div className="input-group">
                <label htmlFor="num-paraphrases">Number of Paraphrases:</label>
                <input
                  id="num-paraphrases"
                  type="number"
                  value={numParaphrases}
                  onChange={(e) => setNumParaphrases(e.target.value)}
                  min={1}
                  max={5}
                />
              </div>
              <div className="input-group">
                <label htmlFor="num-beams">Beam Search Width:</label>
                <input
                  id="num-beams"
                  type="number"
                  value={numBeams}
                  onChange={(e) => setNumBeams(e.target.value)}
                  min={2}
                  max={10}
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Paraphrasing..." : "Paraphrase"}
              <Send size={18} />
            </button>
          </form>
        </div>
        <div className="output-section">
          <h2>Paraphrases</h2>
          {paraphrases.length > 0 ? (
            paraphrases.map((paraphrase, index) => (
              <div key={index} className="paraphrase-item">
                <p>{paraphrase}</p>
                <button onClick={() => copyToClipboard(paraphrase)}>
                  <Clipboard size={18} /> Copy
                </button>
              </div>
            ))
          ) : (
            <p>No paraphrases yet. Enter some text above and click "Paraphrase".</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParaphraserPage;
