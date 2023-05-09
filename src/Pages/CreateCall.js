import React, { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { useLocation } from "react-router-dom";
import "./CreateCall.css";
import { ReactComponent as HangupIcon } from "../icons/hangup.svg";
import Navbar from "../components/Navbar/Navbar";
import * as MdIcons from "react-icons/md";
import * as BsIcons from "react-icons/bs";
import * as FcIcons from "react-icons/fc";
import Sidebar from "../components/Sidebar/Sidebar";
import Searchbox from "../components/Searchbox/Searchbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { firestore } from "../App";
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
function CreateCall({ pc, firestore, setNewServer, setLoading }) {
  const location = useLocation();
  const { email, id, name } = location.state.userData;

  const [webcamActive, setWebcamActive] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState();
  const [Ringing, setRinging] = useState(false);
  const [UserData, setUserData] = useState([]);
  const [stream, setStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [audiostatus, setAudiostatus] = useState(true);
  const [videostatus, setVideostatus] = useState(true);
  const [screenCastStream, setScreenCastStream] = useState();
  const [micStatus, setMicStatus] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [Calling, setCalling] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [otherUserId, setOtherUserId] = useState();
  const [RequestList, setRequestList] = useState([]);
  const [render, setRender] = useState(false);
  const [senders, setSenders] = useState();
  const localRef = useRef();
  const remoteRef = useRef();
  const UserDataRef = firestore.collection("User");
  const CallsDataRef = firestore.collection("calls");
  const FriendRequestRef = firestore.collection("requests");
  const sender = pc.getSenders()[1];

  console.log("pc", pc);
  Modal.setAppElement("#root");

  useEffect(() => {
    GetUsers();
    SetUpCall();
    CreateRequestList();
    HandleEndCallRequest();
  }, []);

  useEffect(() => {
    const callDoc = firestore
      .collection("calls")
      .doc(roomId)
      .collection("Update-media")
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log("doc dataaa", doc.id);
          if (doc.id === id) {
            console.log(doc.data());
            setMicStatus(doc.data().isMicOff);
          }
        });
      });
    return () => callDoc();
  });
  // useEffect(() => {
  //   const windowCal = () => {
  //     if (window.innerWidth > 760) {
  //       setShowSidebar(true);
  //     } else if (window.innerWidth <= 760) {
  //       setShowSidebar(false);
  //     }
  //   };
  //   window.onresize = windowCal;
  //   if (remoteStream) {
  //     console.log(
  //       "remote refffffff",
  //       remoteRef,
  //       remoteRef.current.srcObject.getTracks(),
  //       pc.getSenders()[1]?.track,
  //       remoteStream.getAudioTracks()[0]
  //     );
  //   }
  // }, [window.innerWidth]);

  const CreateRequestList = () => {
    let Users1Data = [];
    UserDataRef.get().then((querySnapshot) => {
      querySnapshot.forEach((data) => {
        Users1Data.push(data.data());
      });
    });
    let RequestList = [];
    FriendRequestRef.onSnapshot((querySnapshot) =>
      querySnapshot.forEach((doc) => {
        Users1Data?.map((user, index) => {
          if (
            doc.data().offer.sender_name === user.name &&
            doc.data().offer.sender_id === user.id &&
            doc.data().offer.reciver_name === name
          ) {
            RequestList.push(user);
            console.log("request-Dataaaaaaaaaaaaa", user);
          }
        });
      })
    );
    setRequestList(RequestList);
  };
  const GetUsers = () => {
    UserDataRef.onSnapshot((querySnapshot) => {
      let UserData = [];
      querySnapshot.forEach((data) => {
        UserData.push(data.data());
      });

      setUserData(UserData);
      UserData = [];
    });
  };
  const SetUpCall = async () => {
    await CallsDataRef.onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().offer?.userId === id) {
          setRinging(true);
          setCalling(true);
          setWebcamActive(true);
          setOtherUserId(doc.data().offer.id);
          setUserName(doc.data().offer.name);
          setRoomId(doc.id);
          setIsOpen(false);
        }
      });
    });
  };
  const HandleEndCallRequest = () => {
    CallsDataRef.onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          setLoading(true);
          setCalling(false);
          setRinging(false);
          setRoomId();
          setOtherUserId();
          setUserName("");
          setWebcamActive(false);
          setStream();
          setRemoteStream();
          pc.close();

          setTimeout(() => {
            setNewServer();
          }, 2000);

          // if (
          //   pc.connectionState === "closed" ||
          //   pc.connectionState === "disconnected"
          // ) {
          //   console.log("helloooooooo");
          //   setStream();
          //   setRemoteStream();
          //   localRef.current.srcObject = null;
          //   remoteRef.current.srcObject = null;
          // }
        }
      });
    });
  };
  const HandleMediaUpdates = (roomId) => {
    console.log("HandleRoomMedia", roomId);
    CallsDataRef.doc(roomId)
      .collection("Update-media")
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log("doc dataaa", doc.id);
          if (doc.id === id) {
            console.log(doc.data());
            setMicStatus(doc.data().isMicOff);
          }
        });
      });
  };
  const useClickOutside = (handler) => {
    const SearchRef = useRef();
    useEffect(() => {
      const maybeHandler = (event) => {
        if (!SearchRef.current?.contains(event.target)) {
          handler();
        }
      };
      document.addEventListener("mousedown", maybeHandler);
      return () => {
        document.removeEventListener("mousedown", maybeHandler);
      };
    });
    return SearchRef;
  };

  const setupSources = async (userId, name, username) => {
    console.log("Userid", userId);
    let found = false;
    firestore
      .collection("calls")
      .get()
      .then((querySnapshot) => {
        console.log(
          "--Qury SnapShot clength-->>",
          querySnapshot.docs.length,
          querySnapshot.docs.length > 1
        );
        if (querySnapshot.docs.length > 1) {
          //show toast message
          console.log("-->>", querySnapshot);
          __checkCallExist(querySnapshot, userId, username);
        } else {
          //else part
          console.log("--else part-->");
          __callingData(userId);
        }
      });
  };

  const __checkCallExist = async (querySnapshot, userId, username) => {
    try {
      var found = false;
      querySnapshot.forEach((doc) => {
        console.log("FOR EACH--->", doc.data().offer.userId, username);
        if (
          doc.data().offer.userId === userId ||
          doc.data().offer.name === username
        ) {
          toast.error("🦄 User is busy on another Call!", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
          pc.close();
          setCalling(false);
        }
        found = true;
      });
    } catch (e) {
      console.log("API CALLING ERROR CALL EXIST-->>", e);
    }
  };

  const __callingData = async (userId) => {
    try {
      setShowSidebar(false);
      setCalling(true);
      const docid = userId > id ? id + "-" + userId : userId + "-" + id;

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setOtherUserId(userId);
      if (pc.connectionState === "closed") {
        setTimeout(() => {
          setNewServer();
        }, 2000);
      }
      localStream?.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
      const remoteStream = new MediaStream();

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };
      remoteRef.current.srcObject = remoteStream;
      localRef.current.srcObject = localStream;
      setRemoteStream(remoteStream);

      setWebcamActive(true);

      setStream(localStream);
      const callDoc = CallsDataRef.doc(docid);
      const offerCandidates = callDoc.collection("offerCandidates");
      const answerCandidates = callDoc.collection("answerCandidates");

      console.log("combine-ID", callDoc.id);
      setRoomId(callDoc.id);

      pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      const offerDescription = await pc.createOffer();

      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
        isMicOff: audiostatus,
        ringing: true,
        userId,
        name,
        id: id,
      };
      await callDoc.set({ offer });

      callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
      pc.onconnectionstatechange = (event) => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          pc.restartIce();
          hangUp();
        }
      };
    } catch (e) {
      console.log("Api Calling Error-->> CallingData", e);
    }
  };

  const handleCall = async (e) => {
    e.preventDefault()
    console.log("connection state now2", pc);
    const localStream =  navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(localStream);
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    const remoteStream = new MediaStream();

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    remoteRef.current.srcObject = remoteStream;
    localRef.current.srcObject = localStream;
    console.log("s", remoteRef.current.srcObject);
    setRemoteStream(remoteStream);
    const callDoc = CallsDataRef.doc(roomId);

    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");
    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };
    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
      ringing: false,
      id,
    };
    await callDoc.update({
      answer,
      offer: { ...offerDescription, ringing: false },
    });
    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setRinging(false);
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    pc.onconnectionstatechange = (event) => {
      if (pc.connectionState === "closed") {
        setTimeout(() => {
          hangUp();
          setNewServer();
        }, 2000);
      }
    };
  };
  const handleReject = async () => {
    CallsDataRef.doc(roomId);
    CallsDataRef.doc(roomId).delete();
    setRinging(false);
  };
  const hangUp = async () => {
    setShowSidebar(true);
    setLoading(true);
    setRinging(false);
    setRoomId();
    setOtherUserId();
    setUserName("");
    setStream();
    setRemoteStream();

    // pc.setLocalDescription();
    // pc.setRemoteDescription();
    pc.onicecandidate = null;
    pc.close();
    if (roomId) {
      let roomRef = CallsDataRef.doc(roomId);

      console.log(roomRef);
      await roomRef
        .collection("Update-media")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });
      await roomRef
        .collection("answerCandidates")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });
      await roomRef
        .collection("offerCandidates")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });
      setCalling(false);
      setWebcamActive(false);
      await roomRef.delete();
      setTimeout(() => {
        setNewServer();
      }, 2000);
    }
  };
  const toggleAudioStatus = async (value) => {
    stream.getAudioTracks()[0].enabled = value;
    const callDoc = CallsDataRef.doc(roomId);
    const UpdateMedia = callDoc.collection("Update-media");
    const OtherUserMicDoc = UpdateMedia.doc(otherUserId);
    OtherUserMicDoc.set({
      isMicOff: value,
    });
    setAudiostatus(value);
    // setMicStatus(value);
  };
  const toggleVideoStatus = (value) => {
    stream.getVideoTracks()[0].enabled = value;

    setVideostatus(value);
  };
  const screenShare = () => {
    console.log(sender);
    navigator.mediaDevices
      .getDisplayMedia({ cursor: true, video: true })
      .then((screenStream) => {
        sender.replaceTrack(screenStream.getVideoTracks()[0]);
        setIsPresenting(true);
        setScreenCastStream(screenStream);
      });
  };

  const stopScreenShare = () => {
    screenCastStream.getVideoTracks().forEach((track) => {
      track.stop();
    });
    sender.replaceTrack(stream.getVideoTracks()[0]);
    setIsPresenting(false);
  };
  let SearchRef = useClickOutside(() => {
    setIsOpen(false);
  });
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: "100",
    },
  };
  return (
    <div className="videos">
      <div className="main-container-videos" id="main">
        <ToastContainer />;
        <Navbar
          firestore={firestore}
          setQuery={setQuery}
          setIsOpen={setIsOpen}
          name={name}
          RequestList={RequestList}
        />
        {isOpen && (
          <div ref={SearchRef} className={"search-box1"}>
            {query &&
              UserData.filter((user) => user.id !== id)
                .filter(
                  (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.name.toUpperCase().includes(query)
                )
                .map((user) => (
                  <Searchbox
                    UserData={UserData}
                    name={name}
                    user={user}
                    myId={id}
                    render={render}
                    setRender={setRender}
                    setupSources={setupSources}
                  />
                ))}
          </div>
        )}
        {Ringing && (
          <Modal style={customStyles} isOpen={Ringing}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <p>{userName} is calllig you...</p>
                <img src={Calling} className="ringing" />
              </div>

              <button
                onClick={(e) => handleCall(e)}
                className="button-10"
                style={{ marginTop: "10px" }}
              >
                Answer
              </button>
              <button
                onClick={() => handleReject()}
                className="button-10"
                style={{ marginTop: "10px" }}
              >
                Reject
              </button>
            </div>
          </Modal>
        )}
        <div style={{ width: "100%", height: "100%" }}>
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <div className="main">
              <div className="videos-container-main">
                {Calling && (
                  <>
                    <div className="video-container">
                      <video
                        ref={localRef}
                        autoPlay
                        playsInline
                        className="local"
                        style={{ height: "100%", maxHeight: "400px" }}
                        muted
                      />
                      <div style={{ position: "absolute", left: 5, top: 5 }}>
                        {audiostatus ? (
                          <BsIcons.BsMicFill size={20} />
                        ) : (
                          <BsIcons.BsMicMuteFill size={20} />
                        )}
                      </div>
                    </div>

                    <div className="video-container">
                      <video
                        ref={remoteRef}
                        autoPlay
                        playsInline
                        className="remote"
                        style={{ height: "100%", maxHeight: "400px" }}
                      />
                      <div style={{ position: "absolute", left: 5, top: 5 }}>
                        {micStatus ? (
                          <BsIcons.BsMicFill size={20} />
                        ) : (
                          <BsIcons.BsMicMuteFill size={20} />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="sidebar-container .user-Container-active">
              <div
                className="sideButton"
                style={{ right: showSidebar ? "250px" : "10px" }}
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <BsIcons.BsThreeDots size={20} />
              </div>
              {showSidebar && (
                <Sidebar
                  setupSources={setupSources}
                  UserData={UserData}
                  name={name}
                  id={id}
                  setShowSidebar={setShowSidebar}
                  showSidebar={showSidebar}
                />
              )}
            </div>
          </div>
        </div>
        <div
          className="footer-main"
          style={{ display: webcamActive ? "block" : "none" }}
        >
          <div className="footer-inner">
            <div className="icons-outer-container">
              <div className="icons-inner-container">
                <div
                  onClick={() => toggleAudioStatus(!audiostatus)}
                  style={{
                    backgroundColor: audiostatus ? "#fff" : "#FF0000",
                    textShadow: "2px 2px",
                  }}
                  className="footer-icon"
                >
                  {audiostatus ? (
                    <BsIcons.BsMic size={30} />
                  ) : (
                    <BsIcons.BsMicMute size={30} />
                  )}
                </div>
                <div
                  onClick={() => toggleVideoStatus(!videostatus)}
                  style={{
                    backgroundColor: videostatus ? "#fff" : "#FF0000",
                    textShadow: "2px 2px",
                  }}
                  className="footer-icon"
                >
                  {videostatus ? (
                    <MdIcons.MdVideocam size={30} />
                  ) : (
                    <MdIcons.MdVideocamOff size={30} />
                  )}
                </div>
                <div
                  onClick={hangUp}
                  style={{ display: !webcamActive ? "none" : "block" }}
                  className="footer-icon"
                >
                  <FcIcons.FcEndCall size={30} />
                </div>
              </div>
            </div>
            <div className="share-icons">
              {!isPresenting ? (
                <div onClick={() => screenShare()} className="screen-share">
                  <MdIcons.MdOutlineScreenShare size={30} />
                </div>
              ) : (
                <div onClick={() => stopScreenShare()} className="screen-share">
                  <MdIcons.MdOutlineStopScreenShare size={30} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCall;
