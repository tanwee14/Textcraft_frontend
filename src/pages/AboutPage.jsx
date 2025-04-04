import React, { useState } from 'react';
import { ArrowRight, Mail, FileText, Sparkles, Image, Book, ChevronDown , BookOpen , Sliders } from 'lucide-react';
import '../styles/AboutPage.css'

const Feature = ({ icon: Icon, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`feature ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="feature-circle">
        <Icon className="feature-icon" />
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <ChevronDown className="faq-icon" />
      </button>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

export default function AboutPage() {
  const features = [
    { icon: Mail, title: "Email Generation", description: "Craft professional emails with ease" },
    { icon: FileText, title: "Paraphrasing", description: "Rewrite content while maintaining context" },
    { icon: Sparkles, title: "Grammar & Spell Check", description: "Ensure error-free writing" },
    { icon: Book, title: "Summarization", description: "Condense long texts into concise summaries" },
    { icon: Image, title: "Image to Text", description: "Extract text from images effortlessly" },
    { icon: BookOpen, title: "Literature Review Geneartor", description: "Generate literature review in minutes !" },
    { icon: Sliders, title: "Tone Enhancer", description: "Enhance the tone and style of your writing" }
  ];

  const faqs = [
    { question: "How does TextCraft work?", answer: "TextCraft uses advanced AI algorithms to analyze and process text, providing suggestions and improvements based on context and intent." },
    { question: "Is my data secure with TextCraft?", answer: "Yes, we take data security seriously. All user data is safe and we never share or sell your information." },
    { question: "Can I use TextCraft for multiple languages?", answer: "Currently, TextCraft supports English, with plans to add more languages in the future." },
    { question: "Is there a free trial available?", answer: "TextCraft is completely free ! Just login and enjoy the experience." }
  ];

  return (
    <div className="about-us">
      <section className="hero">
        <div className="container">
          <h1><center>About TextCraft</center></h1>
          <p>
            TextCraft is an AI-powered text processing app designed to enhance your writing experience. 
            Our cutting-edge technology helps you craft perfect emails, paraphrase content, 
            check grammar and spelling, summarize text, and even convert images to text.
          </p>
        </div>
      </section>

      <section className="mission-values">
        <div className="container">
          <div className="mission">
            <h2>Our Mission</h2>
            <p>
              At TextCraft, we're committed to empowering writers, students, and professionals 
              with advanced AI tools that streamline the writing process and improve communication.
            </p>
          </div>
          <div className="values">
            <h2>Why Choose TextCraft?</h2>
            <ul>
              <li>State-of-the-art AI technology</li>
              <li>User-friendly interface</li>
              <li>Comprehensive writing assistance</li>
              <li>Continuous improvements and updates</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Our Features</h2>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to elevate your writing?</h2>
          <p>Join thousands of satisfied users and experience the power of TextCraft today.</p>
          <a href="#" className="cta-button">
            Get Started
            
            <ArrowRight className="arrow-icon" />
          </a>
        </div>
      </section>
    </div>
  );
}