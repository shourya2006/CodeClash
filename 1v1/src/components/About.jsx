import React, { useState } from 'react'
import '../css/About.css'

const About = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const questions = [
    {
      question: "What is Competitive Programming?",
      answer: "Competitive programming is a mind sport where participants solve complex programming problems under time constraints. It's like a coding marathon where programmers compete to write efficient, correct, and fast solutions to algorithmic challenges. This practice helps improve problem-solving skills, algorithmic thinking, and coding efficiency."
    },
    {
      question: "What is Code Clash?",
      answer: "Code Clash is a real-time competitive programming platform where developers can battle head-to-head in coding duels. It provides an interactive environment where programmers can challenge each other, solve problems together, and improve their coding skills through friendly competition. Our platform makes competitive programming accessible and engaging for everyone."
    },
    {
      question: "How to Battle?",
      answer: "To start a battle in Code Clash: 1) Create or join a room, 2) Select a programming problem, 3) Code your solution in real-time, 4) Submit your code for instant feedback, 5) Compete against your opponent's solution. The platform provides live compilation, test case validation, and a fair scoring system to determine the winner."
    }
  ];

  return (
    <div className="about-page">
      <h1 className="about-title">About Code Clash</h1>
      <div className="accordion-container">
        {questions.map((item, index) => (
          <div key={index} className="accordion-item">
            <div 
              className={`accordion-header ${activeIndex === index ? 'expanded' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <h2>{item.question}</h2>
              <i className={`fas ${activeIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            <div className={`accordion-content ${activeIndex === index ? 'expanded' : ''}`}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default About
