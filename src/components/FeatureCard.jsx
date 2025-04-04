import React from 'react';

const FeatureCard = ({ imgSrc, title, description }) => {
  return (
    <div className="p-4 bg-gray-200 shadow-lg rounded-none hover:shadow-2xl transition-all h-full flex flex-col justify-between">
      <img 
        src={imgSrc} 
        alt={title} 
        className="w-full h-52 object-cover mb-4" // Increased image size
      />
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
