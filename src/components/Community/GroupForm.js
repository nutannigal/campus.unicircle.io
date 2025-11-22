import React, { useState, useEffect } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { NewRecipient } from "./NewRecipient";
import { NewPersonaRecipient } from "./NewPersonaRecipient";
import { NewClassRecipient } from "./NewClassRecipient";
import { ExportToExcel } from "./ExportToExcel";
import LoadingSpinner from "../LoadingSpinner";
import SummerNote from "../SummerNote/SummerNote";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { NewClassRecipients } from "../Specific Students/NewClassRecipients";
import { NewPersonaRecipients } from "../Specific Students/NewPersonaRecipients";
import { NewRecipients } from "../Specific Students/NewRecipients";

export function GroupForm() {
  // Modal states
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPreviewCategoryModal, setShowPreviewCategoryModal] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [showPersonaMsg, setShowPersonaMsg] = useState(false);
  const [showExcelMsg, setShowExcelMsg] = useState(false);

  // Validation states
  const [showGroupNameError, setShowGroupNameError] = useState(false);
  const [showCommunityNameError, setShowCommunityNameError] = useState(false);
  const [showLogoNameError, setShowLogoNameError] = useState(false);
  const [showDescriptionNameError, setShowDescriptionNameError] = useState(false);
  const [showGroupTypeError, setShowGroupTypeError] = useState(false);
  const [showUserTypeError, setShowUserTypeError] = useState(false);

  // Form states
  const [addPersona, setAddPersona] = useState("");
  const [errorCodePersona, setErrorCodePersona] = useState("");
  const [errorMessagePersona, setErrorMessagePersona] = useState("");
  const navigate = useNavigate();
  
  const [childData, setChildData] = useState([]);
  const [childId, setChildId] = useState({});
  
  const [excel, setExcel] = useState([]);
  const [excelError_code, setExcelError_code] = useState("");
  const [excelError_message, setExcelError_message] = useState("");
  
  const [group_name, setGroupName] = useState("");
  const [community, setCommunity] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [group_type, setGroupType] = useState("");
  const [user_type, setUserType] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [grpCategory, setGrpCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [editGroupId, setEditGroupId] = useState("");
  const [editGroupType, setEditGroupType] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editCommunityName, setEditCommunityName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");
  const [grpID, setGrpId] = useState("");
  const [editNewsSendTo, setEditNewsSendTo] = useState("");
  const [editGroupImage, setEditGroupImage] = useState("");
  const [previewLogo, setPreviewLogo] = useState(null);
  const [jobDescription_text, setJobDescription_text] = useState("");

  const [error_message, setError_message] = useState("");

  const [newsCategory, setNewsCategory] = useState("");
  const [newsCategorydata, setNewsCategoryData] = useState([]);
  const [image, setImage] = useState("");
  const token = localStorage.getItem("Token");
  const [data, setData] = useState([]);

  // Event handlers
  const preview = () => {
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
  };

  const closeEditPreview = () => {
    setShowPreviewCategoryModal(false);
  };

  const edit_category = () => {
    setShowPreviewModal(false);
    setShowPreviewCategoryModal(true);

    setEditGroupId(grpID);
    setEditGroupType(group_type);
    setEditGroupName(group_name);
    setEditCommunityName(community);
    setEditGroupDescription(description);
    setEditNewsSendTo(user_type);
    setEditGroupImage(logo);
  };

  async function createPersona() {
    const formData = new FormData();
    formData.append("persona", addPersona);
    const personaResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "add_persona",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );

    if (personaResponse.data.error_code == 200) {
      setAddPersona("");
    }
    setErrorCodePersona(personaResponse.data.error_code);
    setErrorMessagePersona(personaResponse.data.message);

    setShowPreviewCategoryModal(false);
    setShowPersonaMsg(true);

    setTimeout(() => {
      setShowPersonaMsg(false);
    }, 3000);
  }

  const passData = (id, data) => {
    setChildId(id);
    setChildData(data);
    if (data != "") {
      setTimeout(() => {
        setShowUserTypeModal(false);
      }, 2000);
    }
  };

  const passPersonaData = (Pid, Pdata) => {
    setChildId(Pid);
    setChildData(Pdata);
  };

  async function uploadExcel() {
    try {
      const formData = new FormData();
      formData.append("uploadFile", excel);

      const excelResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_upload_excel_file_student",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
     
      setExcelError_code(excelResponse.data.error_code);
      setExcelError_message(excelResponse.data.message);

      setShowExcelMsg(true);
      setTimeout(() => {
        setShowExcelMsg(false);
      }, 3000);
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  async function saveGroup() {
    const formData = new FormData();
    formData.append("group_id", grpID);
    formData.append("group_name", editGroupName);
    formData.append("category", editCommunityName);
    formData.append("group_description", editGroupDescription);
    formData.append("type", editGroupType);
    formData.append("image", "");
    formData.append("invited_friend_list", "");

    const eventResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_edit_group",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );

    setGroupName(editGroupName);
    setCommunity(editCommunityName);
    setGroupType(editGroupType);

    setShowPreviewCategoryModal(false);
  }

  function resetValues() {
    setGroupName("");
    setCommunity("");
    setDescription("");
    setPreviewLogo(null);
    setGroupType("");
    setUserType("");
  }

  async function createGroup() {
    try {
      if (
        group_name === "" &&
        community === "" &&
        logo === "" &&
        description === "" &&
        group_type === "" &&
        user_type === ""
      ) {
        toast.error("Fill the required fields", {
          duration: 2000,
        });
        return;
      } else if (group_name === "") {
        setShowGroupNameError(true);
        setTimeout(() => {
          setShowGroupNameError(false);
        }, 3000);
      } else if (community === "") {
        setShowCommunityNameError(true);
        setTimeout(() => {
          setShowCommunityNameError(false);
        }, 3000);
      } else if (!logo) {
        setShowLogoNameError(true);
        setTimeout(() => {
          setShowLogoNameError(false);
        }, 3000);
      } else if (description === "") {
        setShowDescriptionNameError(true);
        setTimeout(() => {
          setShowDescriptionNameError(false);
        }, 3000);
      } else if (group_type === "") {
        setShowGroupTypeError(true);
        setTimeout(() => {
          setShowGroupTypeError(false);
        }, 3000);
      } else if (user_type === "") {
        setShowUserTypeError(true);
        setTimeout(() => {
          setShowUserTypeError(false);
        }, 3000);
      } else {
        setIsLoading(true);
        const formData = new FormData();

        formData.append("group_name", group_name);
        formData.append("category", community);
        formData.append("group_description", description);
        formData.append("type", group_type);
        formData.append("image", logo);
        formData.append("invited_friend_list", "");
        formData.append("user_type", user_type);

        const groupResponse = await axios.post(
          process.env.REACT_APP_API_KEY + "admin_create_group",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );
        setIsLoading(false);
        setError_message(groupResponse.data.message);

        setGroupName("");
        setCommunity("");
        setLogo("");
        setDescription("");
        setGroupType("");
        setUserType("");

        toast.success(groupResponse.data.message);
        setTimeout(() => {
          navigate("/community");
        }, 3000);
      }
    } catch (err) {
      console.log("Log in Fail", err);
      setIsLoading(false);
    }
  }

  const all_student = () => {
    setShowUserTypeModal(false);
  };

  const specific_class = () => {
    setShowUserTypeModal(true);
  };

  async function fetchGroupCategoriesList() {
    const token = localStorage.getItem("Token");
    try {
      const fetchResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_group_categories",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      const GroupErrorCode = fetchResponse.data.error_code;
      const GroupErrorMsg = fetchResponse.data.message;
      if (GroupErrorCode == 200) {
        const groupListArray = fetchResponse.data.data;
        setGroupData(groupListArray);
      } else {
        setGroupData([]);
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  useEffect(() => {
    fetchGroupCategoriesList();
  }, []);

  async function createGroupCategory() {
    try {
      const formDataCategory = new FormData();
      formDataCategory.append("category_name", newsCategory);

      const responseCategory = await axios.post(
        process.env.REACT_APP_API_KEY + "create_group_category",
        formDataCategory,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      if (responseCategory.data.error_code == 200) {
        setData([responseCategory.data]);
      }
      if (responseCategory.data.error_code == 200) {
        setShowSuccessMsg(true);
        setNewsCategory("");
        setTimeout(() => {
          navigate("/community");
        }, 4000);
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  async function fetchNewsList() {
    const token = localStorage.getItem("Token");
    try {
      const fetchnewsListResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "admin_get_news_category",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      const NewsCategoryErrorCode = fetchnewsListResponse.data.error_code;
      const NewsCategoryErrorMsg = fetchnewsListResponse.data.message;

      if (NewsCategoryErrorCode == 200) {
        const NewsCategoryListArray = fetchnewsListResponse.data.data;
        setNewsCategoryData(NewsCategoryListArray);
      } else {
        setNewsCategoryData([]);
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  useEffect(() => {
    fetchNewsList();
  }, []);

  const getImage = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogo(file);
      const src = URL.createObjectURL(file);
      setPreviewLogo(src);
    }
  };

  const checkRadio = () => {
    const radioInputs = document.querySelectorAll('#groupType input[type="radio"]');
    const isValid = Array.from(radioInputs).some(input => input.checked);
    setShowGroupTypeError(!isValid);
    return isValid;
  };

  const checkRadioForUserType = () => {
    const radioInputs = document.querySelectorAll('#userType input[type="radio"]');
    const isValid = Array.from(radioInputs).some(input => input.checked);
    setShowUserTypeError(!isValid);
    return isValid;
  };

  const handelSummenrnote = (e) => {
    setDescription(e);
  };

  return (
    <div className="content-wrapper" style={{ paddingBottom: "10PX" }}>
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className=" border_class2 box_padding">
        <h1 className="main_heading_h1">CREATE GROUP</h1>
      </div>

      {showSuccessMsg && (
        <div className="formSuccess success_msg">
          <Stack sx={{ width: "100%" }} spacing={2}>
            <Alert variant="filled" severity="success">
              {error_message}
            </Alert>
          </Stack>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className=" ">
          <div className=" border_class2 box_padding">
            <div className="row">
              <div className="col-md-6">
                <div style={{ width: "100%", marginTop: "0px", paddingRight: "0" }}>
                  <div className="d-flex">
                    <label className="all_labels">Name</label>
                    <p className="all_stars">*</p>
                  </div>

                  <input
                    className="all_inputs"
                    type="text"
                    id="groupName"
                    value={group_name}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group Name goes here..."
                    autoComplete="off"
                  />
                  {showGroupNameError && (
                    <div className="GroupName">
                      <h4 className="login-text all_validations_h4">
                        Please Enter Group Name
                      </h4>
                    </div>
                  )}

                  <div className="d-flex" style={{ marginTop: "10PX" }}>
                    <label className="all_labels">Community Type</label>
                    <p className="all_stars">*</p>
                  </div>

                  <div className="d-flex">
                    <select
                      className="all_inputs"
                      id="communityName"
                      aria-label=".form-select-sm example"
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {groupData.map((grp, index) => {
                        return (
                          <option value={grp.category_name} key={index}>
                            {grp.category_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {showCommunityNameError && (
                    <div className="CommunityName">
                      <h4 className="login-text all_validations_h4">
                        Please Select Community Name
                      </h4>
                    </div>
                  )}

                  <div className="d-flex" style={{ marginTop: "10PX" }}>
                    <label className="all_labels">Group Description</label>
                    <p className="all_stars">*</p>
                  </div>

                  <textarea
                    id="publishdate"
                    className="all_inputs"
                    placeholder="Description goes here.."
                    value={description}
                    onChange={(e) => handelSummenrnote(e.target.value)}
                    name="birthdaytime"
                    style={{ height: "123px" }}
                  />
                  {showDescriptionNameError && (
                    <div className="DescriptionName">
                      <h4 className="login-text all_validations_h4">
                        Please Enter Description
                      </h4>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6" style={{ textAlign: "center" }}>
                <div className="left_padding">
                  <div className="d-flex" style={{ alignItems: "center", justifyContent: "center" }}>
                    <label className="all_labels">Add Group Logo</label>
                    <p className="all_stars" style={{ height: "100%" }}>*</p>
                  </div>

                  <label htmlFor="file-ip-1" className="file-ip-1 x" style={{ height: "236px", cursor: "pointer" }}>
                    {previewLogo ? (
                      <img
                        id="file-ip-1-preview"
                        src={previewLogo}
                        style={{ height: "200px" }}
                        alt="Group logo preview"
                      />
                    ) : (
                      <img
                        className="default_image"
                        src="dist/img/event_photo.png"
                        id="comp_logo"
                        style={{ height: "215px" }}
                        alt="Default group logo"
                      />
                    )}
                  </label>
                  <input
                    type="file"
                    name="photo"
                    style={{ display: "none" }}
                    accept="image/png, image/gif, image/jpeg"
                    onChange={getImage}
                    id="file-ip-1"
                  />
                  {showLogoNameError && (
                    <div className="LogoName">
                      <h4 className="login-text all_validations_h4">
                        Please Select Image
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className=" border_class2 box_padding">
            <div className="row">
              <div className="col-md-12">
                <div className="" style={{ width: "100%", marginTop: "0px" }}>
                  <div className="d-flex" id="groupType">
                    <div className="d-flex" style={{ justifyContent: "center", alignItems: "center" }}>
                      <label className="all_labels">Type</label>
                      <p className="all_stars" style={{ height: "100%", display: "flex", alignItems: "center" }}>*</p>
                    </div>

                    <input
                      type="radio"
                      id="public"
                      name="type"
                      value="1"
                      checked={group_type === "1"}
                      onChange={(e) => setGroupType(e.target.value)}
                    />
                    <label htmlFor="public" className="specific_recipients_label" style={{ marginLeft: "15px" }}>
                      <p style={{ paddingLeft: "5px" }}>Public</p>
                    </label>

                    <input
                      type="radio"
                      id="private"
                      name="type"
                      value="2"
                      checked={group_type === "2"}
                      onChange={(e) => setGroupType(e.target.value)}
                    />
                    <label htmlFor="private" className="specific_recipients_label" style={{ marginLeft: "15px" }}>
                      <p style={{ paddingLeft: "5px" }}>Private</p>
                    </label>
                  </div>
                  {showGroupTypeError && (
                    <div className="GroupType" id="spnError">
                      <h4 className="login-text all_validations_h4">
                        Please Select group type
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className=" border_class2 box_padding">
            <div className="row">
              <div className="col-md-12">
                <div className="" style={{ width: "100%", marginTop: "0px" }} id="news_sendto">
                  <div className="d-flex">
                    <label className="all_labels">Who are you sending this invite to?</label>
                    <p className="all_stars"></p>
                  </div>
                  <label className="all_labels">User type</label>

                  <div className="d-flex" id="userType">
                    <input
                      type="radio"
                      id="all students"
                      name="userType"
                      value="1"
                      checked={user_type === "1"}
                      onChange={(e) => setUserType(e.target.value)}
                    />
                    <label htmlFor="all students" className="specific_recipients_label" onClick={all_student}>
                      <p style={{ paddingLeft: "5px" }}>All Students</p>
                    </label>
                    <input
                      type="radio"
                      id="specific class"
                      name="userType"
                      value="2"
                      checked={user_type === "2"}
                      onChange={(e) => setUserType(e.target.value)}
                    />
                    <label htmlFor="specific class" className="specific_recipients_label" style={{ marginLeft: "15PX" }} onClick={specific_class}>
                      <p style={{ paddingLeft: "5px" }}>Specific Recipients</p>
                    </label>
                  </div>
                </div>
                {showUserTypeError && (
                  <div className="UserType" id="errorMsg" style={{ marginTop: "-6px" }}>
                    <h4 className="login-text" style={{ color: "red", fontSize: "12PX", marginLeft: "0" }}>
                      Please Select User Type
                    </h4>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specific Recipients Modal */}
          {showUserTypeModal && (
            <div className="user_type selected_std_modal" style={{ display: "block" }}>
              <div className="selected_std_modal_inner_div">
                <div className="d-flex edit_top_container">
                  <label className="main_labels">Specific Recipients</label>
                  <img
                    src="dist/img/Cancel.png"
                    alt="dropdown"
                    className="close_event ml-auto cancel_img"
                    onClick={() => setShowUserTypeModal(false)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div id="exTab2" className="container p-0" style={{ marginTop: "10PX", height: "100%" }}>
                  <ul className="nav nav-tabs">
                    <li className="active mb-0">
                      <a href="#3" data-toggle="tab">Individual</a>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <a href="#2" data-toggle="tab">Class</a>
                    </li>
                    <li className="mb-0" style={{ marginLeft: "10px" }}>
                      <a href="#1" data-toggle="tab" style={{ padding: "10px 20px" }}>Persona</a>
                    </li>
                  </ul>

                  <div className="tab-content">
                    <div className="tab-pane active" id="3">
                      <div id="exTab3" className="container" style={{ marginTop: "0PX", height: "100%" }}>
                        <div className="tab-content" style={{ padding: "0px", height: "auto" }}>
                          <div className="tab-pane active" id="6" style={{ height: "100%" }}>
                            <NewRecipients style={{ height: "100%" }} passData={passData} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane" id="2">
                      <NewClassRecipients style={{ height: "100%" }} passData={passData} />
                    </div>

                    <div className="tab-pane" id="1" style={{ height: "100%" }}>
                      <div id="exTab4" className="container" style={{ marginTop: "0PX", height: "100%" }}>
                        <div className="tab-content" style={{ padding: "0px", height: "auto" }}>
                          <div className="tab-pane active" id="4" style={{ height: "100%" }}>
                            <NewPersonaRecipients style={{ height: "100%" }} passPersonaData={passPersonaData} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="d-flex border_class2 box_padding buttons_div">
            <img
              className="delete_img"
              src="dist/img/delete.png"
              alt="dropdown"
              onClick={resetValues}
              style={{ cursor: "pointer" }}
            />
            <p className="news_bar">|</p>
            <button className="preview_button" onClick={preview}>
              <p className="preview_font">Preview</p>
              <div className="preview_img_div">
                <img className="preview_img" src="dist/img/view.png" alt="Preview" />
              </div>
            </button>

            <input
              type="button"
              className="publish_button"
              defaultValue="Sign Up"
              onClick={createGroup}
              value="Publish"
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="preview_polls" style={{ display: "block" }}>
          <div className="preview_polls_inner_div1">
            <div className="d-flex edit_top_container">
              <label className="main_labels">Preview</label>
              <img
                src="dist/img/Cancel.png"
                alt="dropdown"
                onClick={closePreview}
                className="close_event ml-auto cancel_img"
                style={{ cursor: "pointer" }}
              />
            </div>

            <div>
              <div className="d-flex">
                <img
                  src="dist/img/Pencil.png"
                  alt="dropdown"
                  className="ml-auto preview_edit_img"
                  onClick={edit_category}
                  style={{ cursor: "pointer" }}
                />
              </div>

              <div>
                <div className="edit_top_label" style={{ marginTop: "0px" }}>
                  <p> Group Name, Category, Type & User Type Title </p>
                </div>

                <div>
                  <div className="edit_border_class">
                    <div className="row">
                      <div className="col-md-4">
                        <span className="preview_font">Group Name</span>
                      </div>
                      <div className="col-md-8">
                        : <span className="preview_font">{group_name}</span>
                      </div>

                      <div className="col-md-4">
                        <span className="preview_font">Category</span>
                      </div>
                      <div className="col-md-8">
                        : <span className="preview_font">{community}</span>
                      </div>

                      <div className="col-md-4">
                        <span className="preview_font">Type</span>
                      </div>
                      <div className="col-md-8">
                        : <span className="preview_font">
                          {group_type === "" ? "" : group_type === "1" ? "Public" : "Private"}
                        </span>
                      </div>

                      <div className="col-md-4">
                        <span className="preview_font">User Type</span>
                      </div>
                      <div className="col-md-8">
                        : <span className="preview_font">
                          {user_type === "" ? "" : user_type === "1" ? "All Students" : "Specific Recipient"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="edit_top_label">
                    <p>Group Logo</p>
                  </div>

                  <div className="edit_border_class">
                    <div className="p-0">
                      <div className="row">
                        <div className="col-md-12">
                          {previewLogo ? (
                            <img className="preview_form_imgs" src={previewLogo} alt="Group logo" />
                          ) : (
                            <img src={require("../images/no_image.png")} className="preview_form_imgs" alt="No image" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="edit_top_label">
                    <p> Group Description </p>
                  </div>

                  <div>
                    <div className="edit_border_class nine_font_class" style={{ height: "270px" }}>
                      <p dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showPreviewCategoryModal && (
        <div className="preview_category" style={{ display: "block" }}>
          <div className="edit_inner">
            <div className="d-flex edit_inner_div">
              <label className="main_labels">Group</label>
              <img
                src="dist/img/Cancel.png"
                onClick={closeEditPreview}
                alt="dropdown"
                className="close_event ml-auto cancel_img"
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="preview_form">
              <div className="edit_top_label">
                <p>Group Name & Category</p>
              </div>

              <div className="edit_border_class">
                <div className="row">
                  <div className="col-md-4">
                    <span className="preview_font">Group Name:</span>
                  </div>
                  <div className="col-md-8">
                    <input
                      className="edit_inputs_class"
                      type="name"
                      autoComplete="true"
                      value={group_name}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <span className="preview_font">Category :</span>
                  </div>
                  <div className="col-md-8">
                    <select
                      className="form-select form-select-sm edit_inputs_class"
                      id="communityName"
                      aria-label=".form-select-sm example"
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {groupData.map((grp, index) => {
                        return (
                          <option value={grp.category_name} key={index}>
                            {grp.category_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="edit_top_label">
                <p>Group Logo</p>
              </div>

              <div className="edit_border_class">
                <div className="p-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div style={{ width: "100%", marginTop: "0px" }}>
                        <div>
                          <label htmlFor="file-ip-1" style={{ height: "100%", marginBottom: "0px", cursor: "pointer" }}>
                            {previewLogo ? (
                              <img className="image_std preview_form_imgs" src={previewLogo} alt="Group logo" />
                            ) : (
                              <img
                                className="image_std preview_form_imgs"
                                src={require("../images/no_image.png")}
                                alt="No image"
                              />
                            )}
                          </label>
                          <input
                            type="file"
                            name="photo"
                            style={{ display: "none" }}
                            accept="image/png, image/gif, image/jpeg"
                            onChange={getImage}
                            id="file-ip-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="edit_top_label">
                <p> Group Description</p>
              </div>
              <div>
                <SummerNote
                  _onChange={handelSummenrnote}
                  value={description}
                  placeholder="Enter Your Message here.."
                />
              </div>

              <div className="d-flex form-buttons mt-3 edit_buttons_div border_class2" style={{ justifyContent: "end" }}>
                <input
                  type="button"
                  className="form-buttons3 edit_cancel_button"
                  defaultValue="Next Step"
                  onClick={closeEditPreview}
                  value="Cancel"
                />

                <input
                  type="button"
                  className="form-buttons3 edit_update_button"
                  defaultValue="Next Step"
                  onClick={closeEditPreview}
                  value="Save"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}