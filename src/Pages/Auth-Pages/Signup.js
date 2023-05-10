import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
function Signup({ firestore }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState();
  const navigate = useNavigate();
  const auth = getAuth();
  const handleSignUp = (name, email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log(user);

        firestore
          .collection("User")
          .add({
            email: user.email,

            name,
            id: user.uid,
          })
          .then((doc) => navigate("/"));
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
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder=" "
            />
            <span className="input__label">Name</span>
          </label>
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
        <button
          className="button-10"
          style={{ width: "200px", margin: "0.3rem 0" }}
          role="button"
          onClick={() => handleSignUp(name, email, password)}
        >
          SignUp
        </button>
        <button
          className="button-48"
          role="button"
          onClick={() => navigate("/")}
        >
          <span className="text">Already a User? Login</span>
        </button>
      </div>
      <div className="background-Image" />
    </div>
  );
}

export default Signup;
