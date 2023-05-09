import React, { useEffect, useState } from "react";
import FriendRequest from "../../icons/friend-request.png";
import Searchbar from "../Searchbar/Searchbar";
import { firestore } from "../../App";
import "./Navbar.css";
function Navbar({ name, setQuery, setIsOpen, RequestList }) {
  return (
    <div className="navbar" style={{ position: "relative" }}>
      <div className="inner-div">
        <div className="name-div">
          <p style={{ color: "#fff", fontWeight: "bold" }}>Welcome {name}</p>
        </div>
        <div className="search-box">
          <Searchbar name={name} setIsOpen={setIsOpen} setQuery={setQuery} />
        </div>
        <div className="icon-container">
          <div className="icon">
            <img src={FriendRequest} className="icon-image" />
            <span className="badge">{RequestList?.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
