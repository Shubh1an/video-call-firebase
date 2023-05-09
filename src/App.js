import logo from "./logo.svg";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/database";
import Login from "./Pages/Auth-Pages/Login";
import { Route, Routes } from "react-router-dom";
import Signup from "./Pages/Auth-Pages/Signup";
import CreateCall from "./Pages/CreateCall";
import { useEffect, useLayoutEffect, useState } from "react";

const firebaseConfig = {
  // apiKey: "AIzaSyCBgAJAos9tB0LHGRy0Y5ZQ8C3BeyRkB9o",
  // authDomain: "video-call-firebase-b6c7f.firebaseapp.com",
  // databaseURL: "https://video-call-firebase-b6c7f-default-rtdb.firebaseio.com",
  // projectId: "video-call-firebase-b6c7f",
  // storageBucket: "video-call-firebase-b6c7f.appspot.com",
  // messagingSenderId: "147311451628",
  // appId: "1:147311451628:web:02572fe7307d24dfc834c9",

  apiKey: "AIzaSyCBgAJAos9tB0LHGRy0Y5ZQ8C3BeyRkB9o",
  authDomain: "video-call-firebase-b6c7f.firebaseapp.com",
  databaseURL: "https://video-call-firebase-b6c7f-default-rtdb.firebaseio.com",
  projectId: "video-call-firebase-b6c7f",
  storageBucket: "video-call-firebase-b6c7f.appspot.com",
  messagingSenderId: "147311451628",
  appId: "1:147311451628:web:02572fe7307d24dfc834c9"



};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const firestore = firebase.firestore();
const dbRef = firebase.database();

// Initialize WebRTC
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

var pcs = null;

function App() {
  const [ConnectionState, setConnectionState] = useState();
  const [pc, setpc] = useState();
  const [loading, setLoading] = useState(true);
  const setNewServer = () => {
    pcs = new RTCPeerConnection(servers);
    setpc(pcs);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  const closeServer = () => {
    pc.close();
    setConnectionState(!ConnectionState);
  };
  useLayoutEffect(() => {
    setNewServer();
  }, []);
  return (
    <div className="App">
      {!loading && (
        <Routes>
          <Route
            path="/"
            element={<Login dbRef={dbRef} firestore={firestore} />}
          />
          <Route
            path="create-call"
            element={
              <CreateCall
                pc={pc}
                setLoading={setLoading}
                dbRef={dbRef}
                firestore={firestore}
                setNewServer={setNewServer}
                closeServer={closeServer}
              />
            }
          />
          <Route
            path="sign-up"
            element={<Signup dbRef={dbRef} firestore={firestore} />}
          />
        </Routes>
      )}
    </div>
  );
}

export default App;
