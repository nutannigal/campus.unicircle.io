import React, { useState } from "react";
import $ from "jquery";
import axios from "axios";
import "../AdminLogin.css";
import LoadingSpinner from "../LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { red } from "@mui/material/colors"; // Corrected MUI v5 import

export function Forgotpassword() {
  const toggleForm = () => {
    const container = document.querySelector(".container");
    container.classList.toggle("active");
  };

  const navigate = useNavigate();
  const [userEmail, updateUserEmail] = useState("");
  const [message, setMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, updateErrorCode] = useState("");
  const [errorMessage, updateErrorMessage] = useState("");
  const [state, setState] = useState(true);

  async function SearchEmail(inputText) {
    let counter = "";
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const mobilePattern = /^[0-9]+$/;

    if (inputText.value.match(mailformat)) {
      counter = 0;
    } else if (inputText.value.match(mobilePattern)) {
      counter = 1;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", userEmail);
      formData.append("flag", counter);

      const response = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_forgot_password",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      setIsLoading(false);

      if (response.data.error_code === 200) {
        setTimeout(() => {
          navigate("/resetYourPassword", { userEmail });
        }, 3000);
      }

      updateUserEmail(response.data.data);
      updateErrorCode(response.data.error_code);
      updateErrorMessage(response.data.message);
    } catch (err) {
      console.log("Login Fail", err);
      setIsLoading(false);
    }
  }

  return (
    <div>
      <section className="unicircle_login">
        <div className="container">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="user signinBx">
              {/* Left box */}
              <div className="imgBx">
                <img
                  src={require("../images/forgotpassword_img.png")}
                  className="img elevation right_side_img"
                  alt="User"
                  style={{ position: "absolute", top: 0, left: 0, height: "100%" }}
                />
                <img
                  src={require("../images/logo.png")}
                  alt="logo"
                  style={{
                    width: "148px",
                    height: "55px",
                    zIndex: 10,
                    position: "absolute",
                    top: "30px",
                    left: "30px",
                  }}
                />
              </div>

              {/* Right box */}
              <div className="formBx" style={{ padding: "70px 100px 70px 70px" }}>
                <form
                  name="form1"
                  style={{ marginTop: "10px", padding: "10px", height: "100%", width: "100%" }}
                >
                  <h4 style={{ fontSize: "18px" }} className="d-flex mt-5">
                    <p style={{ color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>Find your</p>
                    <p style={{ color: "#1F3977", marginLeft: "3px", fontWeight: "bold" }}>Account</p>
                  </h4>
                  <p style={{ fontSize: "12px", marginTop: "20px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>
                    Please enter your email address or mobile number to search for your account.
                  </p>

                  <div className="d-flex" style={{ marginTop: "60px" }}>
                    <img src="dist/img/Line 7.png" style={{ width: "72px" }} />
                    <img src="dist/img/Line 8.png" style={{ width: "72px", marginLeft: "10px" }} />
                  </div>

                  <div
                    className="d-flex"
                    style={{ border: "0.5px solid #c4c4c4", marginTop: "20px", height: "38px", padding: 0 }}
                  >
                    <img
                      src="dist/img/Name_img.png"
                      style={{ width: "25px", height: "25px", marginTop: "5px", marginLeft: "5px" }}
                    />
                    <input
                      type="text"
                      className="login_plceholder"
                      name="text1"
                      value={userEmail}
                      onChange={(e) => updateUserEmail(e.target.value)}
                      placeholder="Enter Registered Email"
                      autoComplete="off"
                      id="emailValidation"
                      style={{ border: "none", background: "white", height: "35px", marginTop: 0, fontSize: "12px" }}
                    />
                  </div>

                  <div style={{ marginTop: "40px" }} className="row">
                    <div className="col-md-6">
                      <a href="/">
                        <input
                          type="button"
                          style={{
                            border: "none",
                            background: "#6e7781",
                            fontWeight: 500,
                            color: "white",
                            height: "35px",
                            width: "100%",
                            fontSize: "13px",
                            textAlign: "center",
                            boxShadow: "2px 2px 2px rgba(0,0,0,0.15)",
                          }}
                          value="Cancel"
                        />
                      </a>
                    </div>

                    <div className="col-md-6">
                      <input
                        type="button"
                        style={{
                          border: "none",
                          background: "#2d5dd0",
                          fontWeight: 500,
                          color: "white",
                          fontSize: "13px",
                          height: "35px",
                          width: "100%",
                          textAlign: "center",
                          boxShadow: "2px 2px 2px rgba(0,0,0,0.15)",
                        }}
                        value="Search"
                        onClick={() => SearchEmail(document.form1.text1)}
                      />
                    </div>
                  </div>

                  <div
                    style={{ fontWeight: 500, fontFamily: "Poppins", fontSize: "11px", marginTop: "10px" }}
                  >
                    {errorCode === 200 ? (
                      <div className="d-flex">
                        <img src={require("../images/correct.png")} style={{ width: "26px", height: "23px" }} />
                        <p style={{ color: "green", marginLeft: "5px" }}>{errorMessage}</p>
                      </div>
                    ) : errorCode === 404 ? (
                      <div className="d-flex">
                        <img src={require("../images/wrong.jpg")} style={{ width: "18px" }} />
                        <p style={{ color: "red" }}>{errorMessage}</p>
                      </div>
                    ) : errorCode === 406 ? (
                      <div className="d-flex">
                        <img src={require("../images/missing.png")} style={{ width: "15px" }} />
                        <p style={{ color: "blue", marginLeft: "5px" }}>Please Enter Email address</p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
