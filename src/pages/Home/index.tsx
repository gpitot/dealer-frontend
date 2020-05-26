import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";
const Home = () => (
  <div className="home">
    <h1>Automatic Dealer</h1>
    <Link to="/room">Join room</Link>
  </div>
);

export default Home;
