import React, { useState } from "react";
import axios from "axios";
import fileDownload from "js-file-download";
import Loader from "../components/Loader.jsx"; 
import "../styles/LiteratureReviewPage.css";

export default function Component() {
  const [topic, setTopic] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [summarizedPapers, setSummarizedPapers] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [startIndex, setStartIndex] = useState(0);

  const fetchPapers = async (start = 0) => {
    setLoading(true); // Set loading to true
    setError("");
    try {
      const response = await axios.get(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
          topic
        )}&start=${start}&max_results=5`
      );
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, "text/xml");
      const entries = Array.from(xml.getElementsByTagName("entry"));
      const papersData = entries.map((entry) => ({
        title: entry.getElementsByTagName("title")[0].textContent,
        summary: entry.getElementsByTagName("summary")[0].textContent,
        author: entry.getElementsByTagName("author")[0].getElementsByTagName("name")[0].textContent,
        link: entry.getElementsByTagName("id")[0].textContent,
        published: entry.getElementsByTagName("published")[0].textContent,
      }));
      setPapers((prevPapers) => [...prevPapers, ...papersData]);
      setStartIndex(start + 5);
    } catch (err) {
      setError("Error fetching research papers. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const handlePaperSelection = (index) => {
    const selected = papers[index];
    setSelectedPapers((prev) =>
      prev.includes(selected)
        ? prev.filter((paper) => paper !== selected)
        : [...prev, selected]
    );
  };

  const summarizeSelectedPapers = async () => {
    if (selectedPapers.length === 0) {
      setError("No papers selected for summarization.");
      return;
    }
    setLoading(true); // Set loading to true
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/lit/api/fetch-summarized-papers", {
        topic,
        num_papers: selectedPapers.length,
        papers: selectedPapers.map((paper) => ({
          title: paper.title,
          authors: paper.author,
          year: new Date(paper.published).getFullYear(),
          abstract: paper.summary,
        })),
      });
      setSummarizedPapers(response.data.papers);
      setSelectedPapers([]);
    } catch (err) {
      setError("Error summarizing papers. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const downloadAsDoc = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/lit/api/download-doc",
        {
          topic,
          papers: summarizedPapers.map((paper) => ({
            title: paper.title,
            authors: paper.authors,
            year: paper.year,
            summary: paper.summary,
          })),
        },
        { responseType: "blob" }
      );
      fileDownload(response.data, `summarized_papers_${topic}.docx`);
    } catch (err) {
      setError("Error downloading the document. Please try again.");
    }
  };

  return (
    <div className="literature-review">
      <h1>Generate Literature Review from Research Papers</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setPapers([]);
            setStartIndex(0);
          }}
        />
        <button onClick={() => fetchPapers(0)}>Fetch Papers</button>
      </div>

      {loading && <Loader />} {/* Show loader when loading is true */}
      {error && <p className="error">{error}</p>}

      {!loading && papers.length > 0 && ( // Hide papers list when loading
        <div className="papers-list">
          <h2>Results for: {topic}</h2>
          <ul>
            {papers.map((paper, index) => (
              <li key={index}>
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    onChange={() => handlePaperSelection(index)}
                    checked={selectedPapers.includes(paper)}
                  />
                  <span className="checkmark"></span>
                </label>
                <div className="paper-info">
                  <h3>{paper.title}</h3>
                  <p>{paper.summary}</p>
                  <p>
                    <strong>Author:</strong> {paper.author}
                  </p>
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => fetchPapers(startIndex)}>Load More</button>
        </div>
      )}

      {!loading && selectedPapers.length > 0 && ( // Hide selected papers when loading
        <div className="selected-papers">
          <h2>Selected Papers for Literature Review</h2>
          <ul>
            {selectedPapers.map((paper, index) => (
              <li key={index}>
                <h3>{paper.title}</h3>
                <p>{paper.summary}</p>
                <p>
                  <strong>Author:</strong> {paper.author}
                </p>
              </li>
            ))}
          </ul>
          <button onClick={summarizeSelectedPapers}>Generate Literature Review</button>
        </div>
      )}

      {!loading && summarizedPapers.length > 0 && ( // Hide table when loading
        <div className="summarized-papers">
          <h2>Literature Review</h2>
          <table>
            <thead>
              <tr>
                <th>Paper Name</th>
                <th>Publication Year</th>
                <th>Author Names</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              {summarizedPapers.map((paper, index) => (
                <tr key={index}>
                  <td>{paper.title}</td>
                  <td>{paper.year}</td>
                  <td>{paper.authors}</td>
                  <td>{paper.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={downloadAsDoc} className="download-btn">
            Download as DOC
          </button>
        </div>
      )}
    </div>
  );
}
