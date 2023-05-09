import React, { useEffect, useLayoutEffect, useState } from "react";
import "../Searchbox/Searchbox.css";
import confirmBtn from "../../icons/check.png";
import cancelBtn from "../../icons/cancel.png";
import Button from "../Button/Button";

function Call(props) {
  const { user, requestReceived, request, handleCancel, handleRequest, name } =
    props;

  return (
    <div className="_search-box">
      <p>{user.name}</p>
      {requestReceived ? (
        <div className="btn-container">
          <Button request={"Accept"} image={confirmBtn} />
          <Button
            handleRequest={handleCancel}
            request={"Reject"}
            image={cancelBtn}
          />
        </div>
      ) : request ? (
        <button
          className="button-15"
          onClick={() => handleRequest(user.id, name)}
        >
          Add Friend {requestReceived + " " + request}
        </button>
      ) : (
        <button className="button-15" disabled>
          Request sent {requestReceived + " " + request}
        </button>
      )}
    </div>
  );
}

export default Call;
