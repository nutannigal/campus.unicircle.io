import React, { useState, useEffect } from "react";
import { Menu } from "../Menu";
import { Header } from "../Header";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment";

export const JobPreview = () => {
  const token = localStorage.getItem("Token");
  const location = useLocation();
  const { j_id } = location.state || { id: "none" };

  const [jobData, setJobData] = useState([]);
  const [jobType, setJobType] = useState("");

  var new_date = jobData.Deadline;
  const d_date = moment(new_date).format("D MMM YYYY");

  async function getJobData(job_id) {
    const formData = new FormData();

    formData.append("j_id", job_id);
    const fetchNewsResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_get_job_details",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    console.log("fetchNewsResponse-----------------", fetchNewsResponse);
    if (fetchNewsResponse.data.error_code == 200) {
      setJobData(fetchNewsResponse.data.data);
    }
  }

  useEffect(() => {
    getJobData(j_id);
  }, []);

  return (
    <>
      <div>
        <Header />

        <div className="d-flex">
          <Menu />

          <div className="content-wrapper">
            <div className="border_class2 box_padding">
              <div className="main_heading_h1">{jobData.job_title}</div>
            </div>

            <div className="card_div mt-2" style={{ width: "100%" }}>
              <div className="card-header bg-white p-0">
                <div className="card_inner_div">
                  <div className="row">
                    <div className="col-md-12 p-0">
                      <div
                        className="d-flex"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div>
                          <img
                            src={jobData.comp_logo}
                            style={{
                              height: "130px",
                              width: "130px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span
                      style={{
                        background: "#4AA081",
                        color: "white",
                        padding: "5px 30px",
                        borderRadius: "5px",
                        fontSize: "10px",
                      }}
                    >
                      {jobData.category}
                    </span>
                  </div>

                  <div className="mt-3 twelve_font_class">
                    <p>{jobData.company_name}</p>
                  </div>

                  <div
                    className="mt-3"
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <p>{jobData.job_title}</p>
                  </div>

                  <div className="row">
                    <div class="col-md-12 mt-2 p-0">
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        <div className="d-flex mt-1" style={{ gap: "5px" }}>
                          <span
                            className="eleven_font_class"
                            style={{ color: "#1F3977" }}
                          >
                            Budget:
                          </span>
                          <span className="ten_font_class">
                            {jobData.budget}
                          </span>
                        </div>

                        <div className="d-flex mt-1" style={{ gap: "5px" }}>
                          <span
                            className="eleven_font_class"
                            style={{ color: "#1F3977" }}
                          >
                            Deadline:
                          </span>
                          <span className="ten_font_class">{d_date}</span>
                        </div>

                        <div className="d-flex mt-1" style={{ gap: "5px" }}>
                          <span
                            className="eleven_font_class"
                            style={{ color: "#1F3977" }}
                          >
                            Email:
                          </span>
                          <span className="ten_font_class">
                            {jobData.comp_email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <hr className="card_inner_hr_css" />
                  </div>

                  <div className="row">
                    <div className="p-0">
                      <div className="">
                        <label
                          className="all_labels"
                          style={{ fontSize: "11px" }}
                        >
                          About The Job
                        </label>
                      </div>
                      <div className="">
                        <p style={{ fontSize: "12px", fontWeight: "400" }}>
                          {
                            <p
                              className="desc_class"
                              dangerouslySetInnerHTML={{
                                __html: jobData.about,
                              }}
                            />
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <hr className="card_inner_hr_css" />
                  </div>

                  <div className="row">
                    <div className="p-0">
                      <p
                        className="ten_font_class"
                        style={{
                          color: "#4AA081",
                        }}
                      >
                        Engagement Analytics
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-5 pl-0">
                      <section style={{ margin: "15px 0px" }}>
                        <div className=" table-cards">
                          <div className="table-cards">
                            <div className="row">
                              <div
                                className="col-md-12 p-0"
                                style={{ height: "100%" }}
                              >
                                <div
                                  className="small-box"
                                  style={{
                                    height: "70px",
                                    padding: "5px",
                                    borderRadius: "2.5PX",
                                    display: "flex",
                                  }}
                                >
                                  <div
                                    className="inner"
                                    // onClick={UniDetails}
                                    style={{
                                      cursor: "pointer",
                                      display: "flex",
                                      width: "100%",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>
                                      <div>
                                        <h5
                                          className="eleven_font_class"
                                          style={{
                                            color: "#1F3977",
                                          }}
                                        >
                                          Job Applications
                                        </h5>
                                      </div>

                                      <div
                                        className="d-flex twenty_font_class"
                                        style={{
                                          flexWrap: "wrap",
                                          marginTop: "5px",
                                        }}
                                      >
                                        <div>{jobData.job_applications}</div>
                                      </div>
                                    </div>

                                    <div
                                      className="all_icon_imgs_div"
                                      style={{ background: "#FBE1FF" }}
                                    >
                                      <img
                                        className="all_icon_imgs"
                                        src="dist/img/ComboChart.png"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="col-md-5">
                      <section style={{ margin: "15px 0px" }}>
                        <div className="table-cards">
                          <div className="table-cards">
                            <div className="row">
                              <div
                                className="col-md-12 p-0"
                                style={{ height: "100%" }}
                              >
                                <div
                                  className="small-box"
                                  style={{
                                    height: "70px",
                                    padding: "5px",
                                    borderRadius: "2.5PX",
                                    display: "flex",
                                  }}
                                >
                                  <div
                                    className="inner"
                                    // onClick={UniDetails}
                                    style={{
                                      cursor: "pointer",
                                      display: "flex",
                                      width: "100%",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>
                                      <div>
                                        <h5
                                          className="eleven_font_class"
                                          style={{
                                            color: "#1F3977",
                                          }}
                                        >
                                          Saved
                                        </h5>
                                      </div>

                                      <div
                                        className="d-flex twenty_font_class"
                                        style={{
                                          flexWrap: "wrap",
                                          marginTop: "5px",
                                        }}
                                      >
                                        <div>{jobData.saved}</div>
                                      </div>
                                    </div>

                                    <div
                                      className="all_icon_imgs_div"
                                      style={{ background: "#BEF5C3" }}
                                    >
                                      <img
                                        className="all_icon_imgs"
                                        src="dist/img/CircleChart.png"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
