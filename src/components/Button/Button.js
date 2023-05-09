import React from "react";
import "./Button.css";
function Button({ image, request, handleRequest }) {
  return (
    <div onClick={() => handleRequest()} className="icon request-icn">
      <span className="tooltip">{request}</span>
      <span>
        <img
          src={image}
          style={{ width: "20px", height: "20px", marginTop: "2px" }}
        />
      </span>
    </div>
  );
}

export default Button;
