import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import './App.css';
//import {app} from '../firebase.js'
//import {getDatabase,ref,set} from 'firebase/database'
import EmailGenPage from './pages/EmailGenPage.jsx';
import SpellCheckPage from './pages/SpellCheckPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SummarizationPage from './pages/SummarizationPage.jsx';
import ImagetoTextPage from './pages/ImagetoTextPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ParaphraserPage from './pages/ParaphraserPage.jsx';
import LiteratureReviewPage from './pages/LiteratureReviewPage.jsx';
import ToneEnhancerPage from './pages/ToneEnhancerPage.jsx';

//const db=getDatabase(app);

// const putData=()=>{
//   set(ref(db,"users/Tanvi"),{
//     id:22,
//     name:"Tanvi"
//   })
// }

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/SignUp" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage/>} /> 
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path ="/tone-enhancer" element={<ToneEnhancerPage/>}/>
            <Route path="/text-summarization" element={<SummarizationPage />} />  
            <Route path="/image-to-text" element={<ImagetoTextPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path ="/paraphraser" element={<ParaphraserPage/>}/>
            <Route path="/literature-review" element={<LiteratureReviewPage/>} />
            <Route path="/generate-email" element={<EmailGenPage />} />
            <Route path="/spell-grammar-check" element={<SpellCheckPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;