import React, { useEffect, useState } from "react";
import CallingButton from "../../icons/telephone.png";
import "./Sidebar.css";
import { firestore } from "../../App";
function Sidebar({ setupSources, UserData, name, id }) {
  const [FriendList, setFriendList] = useState([]);
  useEffect(() => {
    var FriendList = [];
    const Friends = firestore
      .collection("FriendList")
      .doc(id)
      .collection("confirm-friends")
      .onSnapshot((doc) => {
        doc.docs.map((user) => {
          FriendList.push(user.data()[0]);
        });
        setFriendList(FriendList);
        FriendList = [];
      });
  }, []);

  return (
    <div className="user-Container">
      <h3 className="user-header"> Friends</h3>

      {FriendList.map((data, index) => (
        <div key={index} className="user-list">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/560/560216.png"
              style={{
                width: "25px",
                height: "25px",
                borderRadius: "50%",
              }}
            />
            <p style={{ marginLeft: "10px" }}>{data.name}</p>
          </div>
          <div
            style={{ display: "flex", alignItems: "center" }}
            onClick={() => setupSources(data.id, name, data.name)}
          >
            <img src={CallingButton} className="callIcon" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
