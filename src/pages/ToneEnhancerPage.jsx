import React, { useState } from 'react';
import axios from 'axios';
import { Copy, Wand2, RefreshCw } from 'lucide-react';
import Loader from '../components/Loader.jsx';
import '../styles/ToneEnhancerPage.css';
import { useFirebase } from '../context/firebase.jsx';

export default function ToneEnhancer() {
    const [text, setText] = useState("");
    const [tone, setTone] = useState("");
    const [enhancedText, setEnhancedText] = useState("");
    const [rephrasedText, setRephrasedText] = useState("");
    const [loading, setLoading] = useState(false);
    const { getUser, addHistoryEntry } = useFirebase();
    const user = getUser();

    const handleEnhanceTone = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/tone/enhance_tone', { text, tone });
            setEnhancedText(response.data.enhanced_text); // Updated line
            
            if (user) {
                await addHistoryEntry(user.uid, 'Tone Enhancement', { tone, enhancedText: response.data.enhanced_text });
            }
        } catch (error) {
            console.error("Error enhancing tone:", error);
        }
        setLoading(false);
    };

    const handleRephrase = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/tone/rephrase', { text });
            setRephrasedText(response.data.rephrased_text); // Updated line
        } catch (error) {
            console.error("Error rephrasing text:", error);
            if (user) {
                await addHistoryEntry(user.uid, 'Tone Enhancement', { tone, rephrasedText });
            }
        }
        setLoading(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="tone-enhancer">
            <h1>Tone Enhancer & Rephraser</h1>
            <div className="container">
                <div className="input-column">
                    <textarea
                        placeholder="Enter text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                    />
                    <input
                        type="text"
                        placeholder="Enter tone (e.g., formal, friendly)"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                    />
                    <button onClick={handleEnhanceTone} className="enhance-button" disabled={loading}>
                        <Wand2 className="icon" />
                        Enhance Tone
                    </button>
                </div>
                <div className="output-column">
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {enhancedText && (
                                <div className="output-box">
                                    <div className="output-header">
                                        <h2>Enhanced Text:</h2>
                                        <button onClick={() => copyToClipboard(enhancedText)} className="copy-button">
                                            <Copy className="icon" />
                                            Copy
                                        </button>
                                    </div>
                                    <p>{enhancedText}</p>
                                </div>
                            )}
                            {enhancedText && !rephrasedText && (
                                <button onClick={handleRephrase} className="rephrase-button" disabled={loading}>
                                    <RefreshCw className="icon" />
                                    Rephrase
                                </button>
                            )}
                            {rephrasedText && (
                                <div className="output-box">
                                    <div className="output-header">
                                        <h2>Rephrased Text:</h2>
                                        <button onClick={() => copyToClipboard(rephrasedText)} className="copy-button">
                                            <Copy className="icon" />
                                            Copy
                                        </button>
                                    </div>
                                    <p>{rephrasedText}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
