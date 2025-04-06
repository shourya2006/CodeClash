import React from "react";
import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import "../css/Home.css";
import image from "../assets/home.png";
import createRoom from "../assets/room.svg";
import liveCheck from "../assets/check.svg";
import winner from "../assets/winner.svg";

const Home = () => {
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
          <img src={image} alt="" srcset="" />
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
    </>
  );
};

export default Home;
