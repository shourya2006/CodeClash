import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import "../css/Home.css";
import image from "../assets/home.png";
import createRoom from "../assets/room.svg";
import liveCheck from "../assets/check.svg";
import winner from "../assets/winner.svg";

const Home = () => {
  const stepsRef = useRef([]);
  const testimonialsRef = useRef([]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const stepsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, options);

    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
        }
      });
    }, options);

    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
      stepsObserver.observe(step);
    });

    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach(testimonial => {
      testimonialsObserver.observe(testimonial);
    });

    return () => {
      steps.forEach(step => {
        stepsObserver.unobserve(step);
      });
      testimonials.forEach(testimonial => {
        testimonialsObserver.unobserve(testimonial);
      });
    };
  }, []);

  const detail = [
    { 
      image: createRoom, 
      title: "Create and Join Rooms", 
      description: "Create your own coding battle room or join existing ones. Invite friends or challenge random opponents in real-time coding duels." 
    },
    { 
      image: liveCheck, 
      title: "Live Submission Checks", 
      description: "Get instant feedback on your code submissions. Our real-time compiler checks your solutions against test cases as you code." 
    },
    { 
      image: winner, 
      title: "Winner!!", 
      description: "Compete head-to-head and claim victory by solving Codeforces problems faster than your opponent. Experience the thrill of competitive programming in real-time." 
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create or Join a Room",
      description: "Start by creating a room with your desired rating and time limit, or join an existing one with a room code."
    },
    {
      step: 2,
      title: "Get Matched with a Problem",
      description: "Once both players join, a Codeforces problem matching your skill level will be automatically selected."
    },
    {
      step: 3,
      title: "Code Against the Clock",
      description: "Race against your opponent to solve the problem before time runs out, submitting your solution on Codeforces."
    },
    {
      step: 4,
      title: "Verify and Win",
      description: "The platform automatically verifies your submission on Codeforces, and the first player with a correct solution wins!"
    }
  ];

  const testimonials = [
    {
      quote: "CodeClash helped me improve my competitive programming skills through friendly competition. Highly recommended!",
      author: "Competitive Programmer"
    },
    {
      quote: "The real-time aspect makes coding challenges exciting. I love the thrill of solving problems under pressure.",
      author: "CS Student"
    },
    {
      quote: "A fun way to practice for coding interviews and sharpen problem-solving abilities.",
      author: "Software Developer"
    }
  ];

  return (
    <>
      <div className="container">
        <div className="text">
          <h1 className="head">
            Code, Conquer, Clash: Unleash Your Skills in the 1v1 Code Battle!
          </h1>
          <h4 className="subtitle">
            Face off in intense, head-to-head coding duels where every keystroke
            matters.
          </h4>
        </div>
        <div className="home-img">
          <img src={image} alt="" srcSet="" />
        </div>
      </div>
      
      <div className="btn-container">
        <Link to="/create">
          <button className="glow-btn create-btn">Create Room</button>
        </Link>
        <Link to="/join">
          <button className="glow-btn join-btn">Join Room</button>
        </Link>
      </div>
      
      <div className="about">
        <h1 className="head" style={{textAlign: "center"}}>What is Code Clash?</h1>
        <div className="cards">
          {detail.map((ele, index) => (
            <Card key={index} element={ele} />
          ))}
        </div>
      </div>

      <div className="how-it-works">
        <h1 className="head" style={{textAlign: "center"}}>How It Works</h1>
        <div className="steps-container">
          {howItWorks.map((step, index) => (
            <div 
              key={index} 
              className="step"
              ref={el => stepsRef.current[index] = el}
            >
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonials">
        <h1 className="head" style={{textAlign: "center"}}>What Users Say</h1>
        <div className="testimonials-container">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial"
              ref={el => testimonialsRef.current[index] = el}
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="quote">"{testimonial.quote}"</div>
              <div className="author">— {testimonial.author}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
