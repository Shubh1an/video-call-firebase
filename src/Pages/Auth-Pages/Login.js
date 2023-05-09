import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "./Login.css";
// import { UserStore } from "../../Mobx/Store";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function Login({ firestore }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState();
  const auth = getAuth();
  //   console.log(email, password);
  const handleLogin = (email, password) => {
    console.log("from handle login", email, password);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        let userData = {};
        const user = userCredentials.user;
        firestore
          .collection("User")
          .get()
          .then((snap) =>
            snap.forEach((data) => {
              if (data.data().id === user.uid) {
                console.log(data.data());

                navigate("create-call", { state: { userData: data.data() } });
              }
            })
          );
        // console.log(user);
        // UserStore.login({ isLoggedIn: true });
        console.log("beforeSENDING", userCredentials);
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className="main-container">
      <div className="create-box">
        <div className="loginContainer">
          <label className="input">
            <input
              className="input__field"
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder=" "
            />
            <span className="input__label">Email</span>
          </label>
          <label className="input">
            <input
              className="input__field"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder=" "
            />
            <span className="input__label">Password</span>
          </label>
        </div>
        <div className="button-Container">
          <button
            className="button-42"
            role="button"
            onClick={() => handleLogin(email, password)}
          >
            Login
          </button>
          <button
            onClick={() => navigate("sign-up")}
            className="button-48"
            role="button"
          >
            <span className="text">New User? SignUp</span>
          </button>
        </div>
      </div>
      <div className="background-Image1">
        {/* <img
          src="../../icons/background.jpg"
          style={{ width: "100%", height: "100%" }}
        /> */}
      </div>
    </div>
  );
}

export default Login;
