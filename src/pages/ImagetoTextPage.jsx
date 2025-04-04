import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/firebase.jsx';
import '../styles/ImagetoTextPage.css';
import jsPDF from 'jspdf'; // For generating PDF
import Loader from '../components/Loader.jsx'; // Import Loader

function ImagetoText() {
  const [image, setImage] = useState(null);
  const [query, setQuery] = useState('');
  const [extractedDetails, setExtractedDetails] = useState('');
  const [generatedDetails, setGeneratedDetails] = useState('');
  const [downloadURL, setDownloadURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const { getUser, uploadImageDocument, getDocuments, addHistoryEntry } = useFirebase();
  const user = getUser();

  const handleImageUpload = async (event) => {
    const selectedImage = event.target.files[0];
    if (!selectedImage) {
      alert("Please select an image.");
      return;
    }
    setImage(selectedImage);

    try {
      const uploadedImageURL = await uploadImageDocument(selectedImage);
      setDownloadURL(uploadedImageURL);
      alert("Image uploaded successfully!");
    } catch (error) {
      alert("Error uploading image: " + error.message);
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (!user) return;
      try {
        const uploadedDocuments = await getDocuments();
        if (uploadedDocuments.length > 0) {
          const lastUploadedDoc = uploadedDocuments[uploadedDocuments.length - 1];
          setDownloadURL(lastUploadedDoc.downloadURL);
        }
      } catch (error) {
        alert("Error fetching documents: " + error.message);
      }
    };
    fetchImage();
  }, [getDocuments, user]);

  const handleGenerate = async () => {
    if (!downloadURL || !query) {
      alert("Please upload an image and provide a query.");
      return;
    }

    setIsLoading(true); // Start loading
    const formData = new FormData();
    formData.append('image_url', downloadURL);
    formData.append('query', query);

    try {
      const response = await fetch('http://127.0.0.1:8000/image-to-text/text-to-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setExtractedDetails(data.extracted_details);
        setGeneratedDetails(data.generated_details);

        if (user) {
          const actionData = {
            query: query,
            extractedDetails: data.extracted_details,
            generatedDetails: data.generated_details,
          };
          await addHistoryEntry(user.uid, 'Image-to-Text Generation', actionData);
          console.log("History saved successfully!");
        }
      } else {
        alert(data.error || "Error processing request.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Extracted Details", 10, 10);
    doc.text(extractedDetails, 10, 20);
    doc.text("Generated Details", 10, 40);
    doc.text(generatedDetails, 10, 50);
    doc.save("details.pdf");
  };

  if (!user) {
    return <div className="not-authenticated">Please log in to use this feature.</div>;
  }

  return (
    <div className="imageproc-container">
      <h1>Image to Text Extractor & Generator</h1>

      {isLoading ? (
        <Loader /> // Show loader during generation
      ) : (
        <>
          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-upload"
          />

          {/* Query Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Write a story or blog for this image"
            className="query-input"
          />
          <button onClick={handleGenerate} className="generate-btn">Generate</button>

          {/* Display Generated Details */}
          {generatedDetails && (
            <>
              <h2>Generated Details</h2>
              <p className="details">{generatedDetails}</p>
              <button onClick={handleDownloadPdf} className="pdf-btn">Download as PDF</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ImagetoText;
