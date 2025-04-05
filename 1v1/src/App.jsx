import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home.jsx";
import "./App.css";
import Footer from "./components/Footer.jsx";

const App = () => {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
};

export default App;
