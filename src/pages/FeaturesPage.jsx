import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Check, FileText, RefreshCw, Image ,BookOpen , Edit} from 'lucide-react';
import '../styles/FeaturesPage.css';

const FeatureItem = ({ icon: Icon, title, description, link }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  return (
    <Link to={link} className="feature-item" ref={itemRef}>
      <div className="feature-icon">
        <Icon size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
};

const FeaturesPage = () => {
  return (
    <section className="features-page">
      <div className="features-content">
        <h2 >Our Features</h2>
        <p className="features-intro">Discover the power of TextCraft with our comprehensive suite of writing tools.</p>
        <div className="features-grid">
          <FeatureItem 
            icon={Mail} 
            title="Email Generation" 
            description="Craft professional emails effortlessly with AI-powered suggestions." 
            link="/generate-email"
          />
          <FeatureItem 
            icon={Check} 
            title="Spell & Grammar Check" 
            description="Ensure flawless writing with our advanced grammar and spell-checking tool." 
            link="/spell-grammar-check"
          />
          <FeatureItem 
            icon={FileText} 
            title="Text Summarization" 
            description="Condense long articles into concise summaries with a single click." 
            link="/text-summarization"
          />
          <FeatureItem 
            icon={RefreshCw} 
            title="Paraphraser" 
            description="Rewrite content while maintaining context and improving clarity." 
            link="/paraphraser"
          />
          <FeatureItem 
            icon={Image} 
            title="Image To Text" 
            description="Extract and analyze text from images with our advanced AI technology." 
            link="/image-to-text"
          />
          <FeatureItem 
            icon={BookOpen} 
            title="Literature Review Generator" 
            description="Effortlessly generate concise reviews of academic papers by summarizing key points, authors, and observations." 
            link="/literature-review"
          />
          <FeatureItem 
            icon={Edit} 
            title="Tone Enhancer & Rephraser" 
            description="Elevate your writing by adjusting the tone to suit any context and rephrase sentences for clarity and impact." 
            link="/tone-enhancer"
          />


        </div>
      </div>
    </section>
  );
};

export default FeaturesPage;