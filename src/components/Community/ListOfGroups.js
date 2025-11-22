import React, { useState, useEffect, useMemo } from "react";
import Stack from "@mui/material/Stack";
import styled from "styled-components";
import DataTable from "react-data-table-component";
import Alert from "@mui/material/Alert";
import axios from "axios";
import { Recipient } from "./Recipient";
import { NewRecipient } from "./NewRecipient";
import { NewClassRecipient } from "./NewClassRecipient";
import { PersonaRecipient } from "./PersonaRecipient";
import { NewPersonaRecipient } from "./NewPersonaRecipient";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import toast, { Toaster } from "react-hot-toast";
import SummerNote from "../SummerNote/SummerNote";

const Input = styled.input.attrs((props) => ({
  type: "text",
  size: props.small ? 5 : undefined,
}))`
  height: 32px;
  width: 200px;
  border-radius: 3px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #e5e5e5;
  padding: 0 32px 0 16px;
`;

const customStyles = {
  rows: {
    style: {
      background: "rgba(228, 233, 243, 0.6)",
      marginTop: "3PX",
      border: "none",
      fontSize: "9px",
      fontWeight: "500",
    },
  },
  headCells: {
    style: {
      color: "#1F3977",
      fontSize: "10px",
      fontWeight: "600",
    },
  },
  head: {
    style: {
      boxShadow: "0 0 1px rgba(0, 0, 0, .125), 0 1px 3px rgba(0, 0, 0, .2)",
    },
  },
};

export function ListOfGroups() {
  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPreviewCategoryModal, setShowPreviewCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteWithPassModal, setShowDeleteWithPassModal] = useState(false);
  const [showEditWithPassModal, setShowEditWithPassModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showActionsModal, setShowActionsModal] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Data states
  const [childData, setChildData] = useState([]);
  const [childId, setChildId] = useState({});
  const [childNewsData, setChildNewsData] = useState([]);
  
  // Form states
  const [grpId, setGrpId] = useState("");
  const [grpName, setGrpName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [campudId, setCampudId] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErrorCode, setDeleteErrorCode] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupCategory, setGroupCategory] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState("");
  const [groupStatus, setGroupStatus] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [studentId, setStudentId] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [addPersona, setAddPersona] = useState([]);
  const [errorMessagePersona, setErrorMessagePersona] = useState("");
  const [errorCodePersona, setErrorCodePersona] = useState("");
  const [userType, setUserType] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [data, setData] = useState([]);

  // Search and filter
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectAllRowsItemText: "ALL",
  };

  const token = localStorage.getItem("Token");
  const navigate = useNavigate();

  // Filtered data
  const filteredItems = data.filter(
    (item) =>
      JSON.stringify(item)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) !== -1
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return <div></div>;
  }, [filterText, resetPaginationToggle]);

  // Event handlers
  function viewDescription(
    groupId,
    groupName,
    groupCategory,
    groupDescription,
    groupIcon,
    groupStatus,
    sendTo
  ) {
    setShowPreviewModal(true);
    setGroupId(groupId);
    setGroupName(groupName);
    setGroupCategory(groupCategory);
    setGroupDescription(groupDescription);
    setGroupIcon(groupIcon);
    setGroupStatus(groupStatus);
    setSendTo(sendTo);
  }

  const passData = (id, data) => {
    setChildId(id);
    setChildData(data);
  };

  const passPersonaData = (Pid, Pdata) => {
    console.log("Received from child: Pid , Pdata", Pid, Pdata);
    setChildId(Pid);
    setChildData(Pdata);
  };

  const passEditData = (newsId) => {
    setChildNewsData(newsId);
    edit_category(newsId);
  };

  const passDeleteData = (newsId) => {
    setChildNewsData(newsId);
  };

  function edit_category() {
    setShowPreviewModal(false);
    setShowPreviewCategoryModal(true);
  }

  function cancelEdit() {
    setShowPreviewCategoryModal(false);
  }

  function closePreview() {
    setShowPreviewModal(false);
  }

  function closeEditPreview() {
    setShowPreviewCategoryModal(false);
    setShowPreviewModal(true);
  }

  function all_student() {
    setShowUserTypeModal(false);
  }

  async function specific_class() {
    setShowUserTypeModal(true);
    try {
      const fetchClassResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_classes_list",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setUserType(fetchClassResponse.data.data);
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  async function editGroupRow(GroupId) {
    setShowEditModal(true);
    const formData = new FormData();
    formData.append("group_id", GroupId);

    const eventResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_get_single_group",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );

    if (eventResponse.data.error_code == 200) {
      eventResponse.data.data.forEach((item) => {
        setGroupId(item.group_id);
        setGroupName(item.group_name);
        setGroupCategory(item.category);
        setGroupDescription(item.description);
        setGroupIcon(item.group_icon);
        setGroupType(item.type);
        setSendTo(item.user_type);

        if (item.user_type == 2) {
          const name = item.group_member_details.map((item) => item.name);
          const student_id = item.group_member_details.map(
            (item) => item.member_id
          );
          const persona_name = item.group_member_details.map(
            (item) => item.persona
          );
          const persona_id = item.group_member_details.map(
            (item) => item.persona_id
          );

          setChildNewsData([...name, ...persona_name]);
          setStudentId(student_id);
          setPersonaId(persona_id);
        }
      });
    }
  }

  function close_button() {
    setShowPreviewModal(false);
  }

  async function editGroup() {
    const formData = new FormData();
    formData.append("group_id", groupId);
    formData.append("group_name", groupName);
    formData.append("category", groupCategory);
    formData.append("group_description", groupDescription);
    formData.append("image", groupIcon);
    
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
    
    if (eventResponse.data.error_code == 200) {
      setShowEditWithPassModal(false);
      handleEditButton();
    }
  }

  const handleEditButton = () => {
    fetchList();
    setShowEditModal(false);
    toast.success("Group Edited Successfully!!");
  };

  const getImage = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setGroupIcon(file);
      const src = URL.createObjectURL(file);
      setShowImagePreview(true);
    }
  };

  const getImageEdit = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setGroupIcon(file);
      const src = URL.createObjectURL(file);
      setShowImagePreview(true);
    }
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

  async function fetchList() {
    try {
      setIsLoading(true);
      const fetchGroupResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "admin_get_all_group",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setIsLoading(false);

      const GroupErrorCode = fetchGroupResponse.data.error_code;
      const GroupErrorMsg = fetchGroupResponse.data.message;

      if (GroupErrorCode == 200) {
        const groupListArray = fetchGroupResponse.data.data;
        setData(groupListArray);
      } else {
        setData([]);
      }
    } catch (err) {
      console.log("Log in Fail", err);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUserDetails();
    fetchList();
  }, []);

  function deleteGroup(grpId, grpName) {
    setGrpId(grpId);
    setGrpName(grpName);
    setShowDeleteModal(true);
  }

  const handleButton = () => {
    fetchList();
    setShowEditWithPassModal(false);
    toast.success("Group Deleted Successfully!!");
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

    setErrorMessagePersona(personaResponse.data.message);
    setErrorCodePersona(personaResponse.data.error_code);

    setTimeout(() => {
      setErrorMessagePersona("");
      setErrorCodePersona("");
    }, 3000);
  }

  async function getUserDetails() {
    const fetchResponse = await axios.get(
      process.env.REACT_APP_API_KEY + "admin_get_Primary_user_info",
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );

    fetchResponse.data.data.forEach((fetchItem) => {
      setEmailAddress(fetchItem.email);
      setCampudId(fetchItem.campus_id);
    });
  }

  async function deleteWithPassword() {
    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campudId);

    const deleteNewsResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_check_password",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    
    setDeleteErrorCode(deleteNewsResponse.data.error_code);
    setDeleteErrorMessage(deleteNewsResponse.data.message);

    if (deleteNewsResponse.data.error_code == 200) {
      setDeletePassword("");
      deleteGroupApi();
    } else {
      toast.error(deleteNewsResponse.data.message);
    }
  }

  async function deleteGroupApi() {
    try {
      const formData = new FormData();
      formData.append("group_id", grpId);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_group",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      
      if (deleteResponse.data.error_code == 200) {
        setShowDeleteWithPassModal(false);
        setDeletePassword("");
        handleButton();
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  function close_delete_modal() {
    setShowDeleteModal(false);
    setShowEditModal(false);
  }

  function close_edit_modal() {
    setShowEditModal(false);
  }

  function fetchGroup(getgroupid) {
    setTimeout(() => {
      navigate("/club", { state: { getgroupid } });
    }, 1000);
  }

  async function editWithPassword() {
    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campudId);

    const deleteNewsResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_check_password",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    
    setDeleteErrorCode(deleteNewsResponse.data.error_code);
    setDeleteErrorMessage(deleteNewsResponse.data.message);

    if (deleteNewsResponse.data.error_code == 200) {
      setDeletePassword("");
      editGroup();
    } else {
      toast.error(deleteNewsResponse.data.message);
    }
  }

  const openActionsModal = (groupId) => {
    setShowActionsModal(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const closeActionsModal = (groupId) => {
    setShowActionsModal(prev => ({
      ...prev,
      [groupId]: false
    }));
  };

  function update_edit_group() {
    setShowEditWithPassModal(true);
  }

  function deletePopupFunc() {
    setShowDeleteWithPassModal(true);
    setShowDeleteModal(false);
  }

  function closeDeleteNewsModal() {
    setShowDeleteModal(false);
    setShowDeleteWithPassModal(false);
    setShowEditWithPassModal(false);
    setDeletePassword("");
  }

  function closeUserType() {
    setShowUserTypeModal(false);
  }

  const handelSummenrnote = (e) => {
    setGroupDescription(e.target.value);
  };

  const close_welcome_modal = () => {
    setShowWelcomeModal(false);
  };

  const columns = [
    {
      name: "Community Name",
      selector: "group_name",
      sortable: true,
      wrap: true,
      width: "30%",
      cell: (row) => {
        return (
          <div className="d-flex">
            <img
              src={row.group_icon}
              alt="view"
              style={{ height: "30px", width: "40px" }}
            />
            <div
              style={{
                marginLeft: "10px",
                fontWeight: "700",
                color: "black",
                marginTop: "9px",
              }}
            >
              {row.group_name}
            </div>
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div>
            <div
              style={{ cursor: "pointer", fontWeight: "700" }}
              onClick={() =>
                viewDescription(
                  row.group_id,
                  row.group_name,
                  row.category,
                  row.description,
                  row.group_icon,
                  row.status,
                  row.group_member_count,
                  row.type
                )
              }
            >
              {row.status}
            </div>
          </div>
        );
      },
    },
    {
      name: "Active Members",
      selector: "group_member_count",
      sortable: true,
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontWeight: "700", cursor: "pointer" }}>
              {row.group_member_count}
            </div>
          </div>
        );
      },
    },
    {
      name: "Community Type",
      selector: "category",
      sortable: true,
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div style={{ fontWeight: "700", cursor: "pointer" }}>
            {row.category}
          </div>
        );
      },
    },
    {
      name: "",
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div className="action_buttons_end_css">
            <button
              className="all_action_buttons"
              onClick={() => openActionsModal(row.group_id)}
            >
              Actions
            </button>

            {showActionsModal[row.group_id] && (
              <div
                className="edit_campus_modal"
                style={{
                  display: "block",
                  position: "absolute",
                  top: "22px",
                  right: "0px",
                  backgroundColor: "white",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  zIndex: 1000,
                }}
              >
                <div className="d-flex ml-auto">
                  <img
                    className="campus_img ml-auto"
                    src="dist/img/Cancel.png"
                    onClick={() => closeActionsModal(row.group_id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div
                  className="d-flex flex-row hover_class"
                  onClick={() => editGroupRow(row.group_id)}
                  style={{ cursor: "pointer", padding: "5px 0" }}
                >
                  <div className="d-flex flex-row">
                    <div>
                      <img className="campus_img" src="dist/img/Pencil.png" />
                    </div>
                    <div className="campus_inner_div">
                      <span>Edit</span>
                    </div>
                  </div>
                </div>

                <button
                  className="d-flex flex-row hover_class"
                  onClick={() => deleteGroup(row.group_id, row.group_name)}
                  style={{ 
                    color: "#000", 
                    cursor: "pointer", 
                    padding: "5px 0", 
                    border: "none", 
                    background: "none" 
                  }}
                >
                  <div className="d-flex flex-row">
                    <div>
                      <img
                        className="campus_img"
                        src={require("../images/delete.png")}
                      />
                    </div>
                    <div className="campus_inner_div">
                      <span>Delete</span>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="content-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Modals */}
      {showPreviewModal && (
        <div className="preview_polls">
          {/* Add preview modal content here */}
          <div>Preview Modal Content</div>
        </div>
      )}

      {showPreviewCategoryModal && (
        <div className="preview_category">
          {/* Add preview category modal content here */}
          <div>Preview Category Modal Content</div>
        </div>
      )}

      {showEditModal && (
        <div id="edit" className="edit_container">
          {/* Edit modal content */}
          <div className="edit_container_inner">
            <div className="d-flex edit_top_container">
              <label className="main_labels">Edit Group</label>
              <img
                src="dist/img/Cancel.png"
                onClick={() => close_edit_modal()}
                alt="dropdown"
                className="close_event ml-auto cancel_img"
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="card-body" style={{ margin: "0px", padding: "0" }}>
              <div className="preview_form">
                <div className="edit_top_label">
                  <p>Name & Community</p>
                </div>
                <div className="edit_border_class">
                  <div className="row">
                    <div className="col-md-4">
                      <div>
                        <label className="all_labels">Group Name :</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <input
                        type="name"
                        className="input-field edit_inputs_class"
                        placeholder="Group name goes here..."
                        autoComplete="true"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <div>
                        <label className="all_labels">Community :</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <select
                        className="edit_inputs_class"
                        id="news_category"
                        aria-label=".form-select-sm example"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      >
                        <option value={categoryName}>
                          {groupCategory}
                        </option>
                        {groupData.length > 0 ? (
                          groupData.map((news, index) => (
                            <option value={news.cat_id} key={index}>
                              {news.category_name}
                            </option>
                          ))
                        ) : (
                          <option>Data Not Found</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="edit_top_label">
                  <p> Group Logo</p>
                </div>
                <div className="edit_border_class">
                  <div className="row">
                    <div className="col-md-12">
                      <div style={{ padding: "5px" }}>
                        <label htmlFor="file-ip-1" style={{ cursor: "pointer" }}>
                          {groupIcon && showImagePreview ? (
                            <img
                              src={typeof groupIcon === 'string' ? groupIcon : URL.createObjectURL(groupIcon)}
                              alt="dropdown"
                              style={{ height: "60px", width: "60px" }}
                            />
                          ) : (
                            <img
                              className="image_std"
                              src={require("../images/no_image.png")}
                              alt="dropdown"
                              style={{ height: "60px", width: "60px" }}
                            />
                          )}
                        </label>
                        <input
                          type="file"
                          name="photo"
                          style={{ display: "none" }}
                          onChange={getImageEdit}
                          id="file-ip-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="edit_top_label">
                    <p> Group Description</p>
                  </div>
                  <div>
                    <textarea
                      className="edit_border_class edit_inputs_class"
                      value={groupDescription}
                      onChange={handelSummenrnote}
                      name="birthdaytime"
                      style={{ height: "200px", width: "100%" }}
                    />
                  </div>
                </div>

                <div className="d-flex mt-3 edit_buttons_div border_class2">
                  <button
                    className="edit_cancel_button"
                    onClick={() => close_edit_modal()}
                  >
                    Cancel
                  </button>
                  <button
                    className="edit_update_button"
                    onClick={() => update_edit_group()}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Message</h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeDeleteNewsModal}
                >
                  <span aria-hidden="true">
                    <img src="dist/img/Cancel.png" className="cancel_img" />
                  </span>
                </button>
              </div>
              <div className="modal-body">
                <p className="pl-3 pb-2">
                  Your thoughtful reconsideration is encouraged, as this
                  information holds significance. Thank you for your
                  consideration.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="delete_cancel_btn"
                  onClick={closeDeleteNewsModal}
                >
                  Cancel
                </button>
                <button className="delete_btn" onClick={deletePopupFunc}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteWithPassModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {/* Delete with password modal content */}
          <div>Delete with Password Modal</div>
        </div>
      )}

      {showEditWithPassModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {/* Edit with password modal content */}
          <div>Edit with Password Modal</div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="welcome_modal">
          <div className="row">
            <div className="col-md-6 p-0">
              <div className="welcome_msg_main_div">
                <div className="d-flex" style={{justifyContent:"space-between"}}>
                  <p className="welcome_msg_main_p">WELCOME TO GROUPS!</p>
                  <img
                    src="dist/img/Welcom_msg_close.png"
                    onClick={close_welcome_modal}
                    alt="dropdown"
                    className="close_event ml-auto cancel_img"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div>
                  <p className="welcome_msg_inner_p"> 
                    Forge meaningful connections and foster community spirit
                    by creating student groups on Unicircle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Type Modal */}
      {showUserTypeModal && (
        <div className="user_type">
          {/* User type modal content */}
          <div>User Type Modal Content</div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ width: "100%" }}>
        <div className="row border_class2 search_box_padding">
          <div className="col-md-3 d-flex flex-row">
            <div className="search_box_div">
              <img
                className="search_box_img"
                src={require("../images/Search.png")}
                alt="Search"
              />
              <Input
                className="search_box"
                id="search"
                type="text"
                placeholder="Search by group name"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="col-md-9 d-flex flex-row" style={{ justifyContent: "end" }}>
            <div style={{ marginTop: "0px", padding: "0" }}>
              <Link to="/createGroup">
                <button type="button" className="d-flex create_button">
                  <div className="create_button_inner">Create Group</div>
                  <img
                    className="create_button_img"
                    src="dist/img/Progress.png"
                    alt="Create"
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="border_class">
          {filteredItems && filteredItems.length === 0 ? (
            <div className="no_data_main_div">
              <p>No data available</p>
              <Link to="/createGroup">Create group</Link>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredItems}
              striped
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              paginationComponentOptions={paginationComponentOptions}
              subHeader
              subHeaderComponent={subHeaderComponent}
              highlightOnHover
              defaultSortFieldId={1}
              customStyles={customStyles}
            />
          )}
        </div>
      )}
    </div>
  );
}