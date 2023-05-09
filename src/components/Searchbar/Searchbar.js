import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./Searchbox.css";
function Searchbar({ setQuery, setIsOpen }) {
  const [FilteredList, setFilteredList] = useState([]);

  // const handleChange = (query) => {
  //   UsersList.filter;
  // };
  return (
    <>
      <div class="search-box">
        <button class="btn-search">
          <i class="fas fa-search"></i>
        </button>
        <input
          type="text"
          class="input-search"
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Type to Search..."
        />
      </div>
    </>
  );
}

export default Searchbar;
