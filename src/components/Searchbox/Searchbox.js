import React, { useEffect, useLayoutEffect, useState } from "react";
import "./Searchbox.css";
import { firestore } from "../../App";
import confirmBtn from "../../icons/check.png";
import cancelBtn from "../../icons/cancel.png";
import Button from "../Button/Button";
import CallBtn from "../../icons/telephone.png";
function Searchbox({
  user,
  myId,
  name,
  UserData,
  setupSources,
  render,
  setRender,
}) {
  const [request, setRequest] = useState(true);
  const [requestRoomId, setRequestRoomId] = useState();
  const [requestReceived, setRequestReceived] = useState(false);
  const [RequestAccepted, setRequestAccepted] = useState(false);

  const handleRequest = (userId, name) => {
    console.log(userId);
    const docid = userId > myId ? myId + "-" + userId : userId + "-" + myId;

    const RequestDoc = firestore.collection("requests").doc(docid);
    const offer = {
      sender_id: myId,
      Request_send: true,
      reciver_name: user.name,
      receiver_id: userId,
      sender_name: name,
      room_id: docid,
      FriendList: [],
    };
    RequestDoc.set({ offer });

    setRequest(false);
  };
  const handleCancel = () => {
    setRender(!render);
    console.log("roomRef", requestRoomId);

    if (requestRoomId) {
      setRequestReceived(!requestReceived);
      let roomRef = firestore.collection("requests").doc(requestRoomId);
      roomRef.delete().then(() => {});
    }
  };
  const handleAnswer = async () => {
    setRender(!render);
    const RequestDoc = firestore.collection("requests").doc(requestRoomId);
    const answer = {
      sender_id: user.id,
      Request_send: true,
      reciver_name: name,
      receiver_id: myId,
      sender_name: user.name,
      room_id: requestRoomId,
    };
    const RequestData = (await RequestDoc.get()).data();

    const offerDescription = RequestData.offer;
    console.log("offerDescription", offerDescription);

    offerDescription.FriendList.push(myId);

    const FriendListStorage = firestore.collection("FriendList");

    RequestDoc.update({ answer, offer: { ...offerDescription } });
    let roomRef = firestore.collection("requests").doc(requestRoomId);
    roomRef.delete().then(() => {});
  };
  useEffect(() => {
    const subscribe = firestore
      .collection("requests")
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "removed") {
            setRender(!render);
            console.log("check the change", change.type);
          }
        });
        querySnapshot.forEach(async (doc) => {
          console.log("helo", doc.data());
          if (
            doc.data().offer.sender_name === user.name &&
            doc.data().offer.sender_id === user.id &&
            doc.data().offer.reciver_name === name
          ) {
            setRequestReceived(true);
            setRequestRoomId(doc.data().offer.room_id);
            console.log("roomid", doc.data().offer.room_id);
          } else if (
            doc.data().offer.sender_id === myId &&
            doc.data().offer.reciver_name === user.name
          ) {
            doc.data().offer.Request_send && setRequest(false);
          }
        });
      });
    return () => subscribe();
  }, [render]);
  useEffect(() => {
    console.log("request room Id", requestRoomId);
    if (requestRoomId) {
      const FriendListStorage = firestore.collection("FriendList");
      firestore
        .collection("requests")
        .doc(requestRoomId)
        .onSnapshot((doc) => {
          console.log("doc answer data", doc.data());
          if (doc.data().answer && doc.data().answer.receiver_id === myId) {
            if (
              doc.data().answer.sender_id === user.id &&
              doc.data().answer.receiver_id === myId
            ) {
              const FriendListed1 = UserData.filter(
                (user) =>
                  // user.id === doc.data().answer.sender_id ||
                  user.id === doc.data().answer.receiver_id
              );
              const FriendListed2 = UserData.filter(
                (user) => user.id === doc.data().answer.sender_id
              );
              console.log("FriendList", FriendListed1);
              const friendlistObj1 = { ...FriendListed1 };
              const friendlistObj2 = { ...FriendListed2 };
              console.log("FRNDobj", friendlistObj1);

              const FriendList1 = FriendListStorage.doc(
                doc.data().answer.sender_id
              )
                .collection("confirm-friends")
                .doc(doc.data().answer.receiver_id);

              const FriendList2 = FriendListStorage.doc(
                doc.data().answer.receiver_id
              )
                .collection("confirm-friends")
                .doc(doc.data().answer.sender_id);
              FriendList1.set(friendlistObj1);
              FriendList2.set(friendlistObj2);
              firestore.collection("requests").doc(requestRoomId).delete();
            }
          }
          console.log("answerDATAAAAAAAAAA", doc.data());
        });
    }
  }, [render]);
  useEffect(() => {
    firestore
      .collection("FriendList")
      .doc(myId)
      .collection("confirm-friends")
      .get()
      .then((users) =>
        users.docs.map((friend) => {
          if (friend.data()[0].id === user.id) {
            setRequestAccepted(true);
          }
        })
      );
  }, []);
  const makeCall = () => {
    setupSources(user.id, name, user.name);
  };
  return (
    <div className="_search-box">
      <p>{user.name}</p>
      {RequestAccepted ? (
        <Button request={"Call"} handleRequest={makeCall} image={CallBtn} />
      ) : requestReceived ? (
        <div className="btn-container">
          <Button
            request={"Accept"}
            handleRequest={handleAnswer}
            image={confirmBtn}
          />
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
          Add Friend
        </button>
      ) : (
        <button className="button-15" disabled>
          Request sent
        </button>
      )}
    </div>
  );
}

export default Searchbox;
