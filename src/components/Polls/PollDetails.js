import React, { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import Previous_next_button from "./Previous_next_button";
import DataTable from "react-data-table-component";
import axios from "axios";
import { PersonaRecipient } from "./PersonaRecipient";
import { Recipient } from "./Recipient";
import { NewRecipient } from "./NewRecipient";
import { NewPersonaRecipient } from "./NewPersonaRecipient";
import moment from "moment";
import Swal from "sweetalert2";
import LoadingSpinner from "../LoadingSpinner";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import DonutChart from "react-donut-chart";
import "@patternfly/react-core/dist/styles/base.css";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Input = styled.input.attrs((props) => ({
  type: "text",
  size: props.small ? 5 : undefined,
  autoComplete: "off"
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
      border: "none",
      fontSize: "10px",
      fontWeight: "500",
    },
  },
  headCells: {
    style: {
      color: "#1F3977",
      fontWeight: "600",
      fontSize: "10px",
    },
  },
  table: {
    style: {
      padding: "0px 10px 0 10px",
      marginTop: "0PX",
    },
  },
};

export function PollDetails(props) {
  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectAllRowsItemText: "ALL",
  };

  const token = localStorage.getItem("Token");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // Search and filter states
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // State for modals visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteWithPassModal, setShowDeleteWithPassModal] = useState(false);
  const [showEditWithPassModal, setShowEditWithPassModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPreviewCategoryModal, setShowPreviewCategoryModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showActionsModal, setShowActionsModal] = useState({});

  // Form states
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [answer4, setAnswer4] = useState("");
  const [answer5, setAnswer5] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [pollStatus, setPollStatus] = useState("");
  const [pollSendTo, setPollSendTo] = useState("");
  const [editSendToStudent, setEditSendToStudent] = useState([]);

  const [getPollsTitle, setGetPollsTitle] = useState([]);
  const [getPollsID, setGetPollsID] = useState("");

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [childData, setChildData] = useState({});
  const [childPollData, setChildPollData] = useState([]);
  const [childId, setChildId] = useState({});

  // Filtered data
  const filteredItems = data && data.filter(
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

  const passEditData = (pollId) => {
    setChildData(pollId);
    edit_category(pollId);
  };

  const passDeleteData = (pollId) => {
    setChildData(pollId);
    delete_category(pollId);
  };

  const passData = (id, data) => {
    setChildId(id);
    setChildPollData(data);
  };

  const passPersonaData = (Pid, Pdata) => {
    setChildId(Pid);
    setChildPollData(Pdata);
  };

  function update_edited_News() {
    setShowEditWithPassModal(true);
  }

  const [addPersona, setAddPersona] = useState([]);
  const [errorMessagePersona, setErrorMessagePersona] = useState("");
  const [errorCodePersona, setErrorCodePersona] = useState("");

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
    
    // Show message for 3 seconds
    setTimeout(() => {
      setErrorMessagePersona("");
      setErrorCodePersona("");
    }, 3000);
  }

  const [excel, setExcel] = useState([]);
  const [excelError_code, setExcelError_code] = useState("");
  const [excelError_message, setExcelError_message] = useState("");

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
      setData(excelResponse.data.data);
      setExcelError_code(excelResponse.data.error_code);
      setExcelError_message(excelResponse.data.message);
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  function cancel_delete_poll() {
    setShowDeleteModal(false);
    setShowPreviewModal(true);
  }

  function closePreviewDescription() {
    setShowPreviewModal(false);
  }

  function closeRecipient() {
    setShowUserTypeModal(false);
  }

  async function previewDeleteWithPassword() {
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
      previewDeleteNewsApi();
    }
  }

  async function previewDeleteNewsApi() {
    try {
      const formData = new FormData();
      formData.append("poll_id", childData);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_polls",
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
        handleButton();
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  const [deleteErrorCode, setDeleteErrorCode] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const [emailAddress, setEmailAddress] = useState("");
  const [campudId, setCampudId] = useState("");
  const [getPollID, setGetPollID] = useState("");
  const [pId, setPid] = useState("");

  const [categoryIdForPreview, setCategoryIdForPreview] = useState("");

  async function viewDescription(pollId) {
    setShowPreviewModal(true);
  }

  function close_edit_modal() {
    setShowEditModal(false);
  }

  function close_preview_edit_modal() {
    setShowPreviewCategoryModal(false);
    setShowPreviewModal(true);
  }

  useEffect(() => {
    fetchList();
    getUserDetails();
    fetchPollsCategoryList();
  }, []);

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

  async function fetchList() {
    try {
      setIsLoading(true);
      const formData = new FormData();
      const fetchPollResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_poll",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setIsLoading(false);
      setData(fetchPollResponse.data.data);
    } catch (err) {
      console.log("Log in Fail", err);
      setIsLoading(false);
    }
  }

  function currentDate() {
    var date = new Date();
    const getDate = moment(date).format("YYYY-MM-DDThh:mm");
    setPublishDate(getDate);
  }

  const handleButton = () => {
    setShowEditWithPassModal(false);
    setShowDeleteWithPassModal(false);
    fetchList();
    toast.success("Poll Deleted Successfully!!");
  };

  const handleEditButton = () => {
    setShowEditWithPassModal(false);
    setShowEditModal(false);
    fetchList();
    toast.success("Poll Edited Successfully!!");
  };

  function deletePolls(poll_id, questions) {
    setGetPollsTitle(questions);
    setGetPollsID(poll_id);
    setShowDeleteModal(true);
  }

  function close_delete_modal() {
    setShowDeleteModal(false);
    setShowViewModal(false);
    setShowDeleteWithPassModal(false);
    setShowEditWithPassModal(false);
    setDeletePassword("");
  }

  const [editQuestionType, setEditQuestionType] = useState("");
  const [studentId, setStudentId] = useState("");

  async function edit_category(id) {
    setShowPreviewCategoryModal(true);
    const formData = new FormData();
    formData.append("poll_id", id);

    const fetchPollResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_get_single_poll",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    if (fetchPollResponse.data.error_code == 200) {
      fetchPollResponse.data.data.forEach((item) => {
        setCategoryId(item.category_id);
        setCategory(item.category);
        setQuestion(item.questions);
        setQuestionType(item.polls_que_type);
        if (item.polls_que_type == 2) {
          setAnswer1(item.option_1);
          setAnswer2(item.option_2);
          setAnswer3(item.option_3);
          setAnswer4(item.option_4);
          setAnswer5(item.option_5);
        }
        setDeliveryType(item.delivery_type);
        setPublishDate(item.publish_date);
        setExpireDate(item.expire_date);
        setPollSendTo(item.send_to);
        if (item.send_to == 2) {
          const name = item.sent_to_student.map((item) => item.student_name);
          const student_id = item.sent_to_student.map(
            (item) => item.student_id
          );
          setChildPollData(name);
          setStudentId(student_id);
        }
      });
    }
  }

  function delete_category(id) {
    setShowPreviewModal(false);
    setShowDeleteModal(true);
  }

  async function deleteNewsApi() {
    try {
      const formData = new FormData();
      formData.append("poll_id", getPollsID);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_polls",
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

  const [deletePassword, setDeletePassword] = useState("");

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
      deleteNewsApi();
    } else {
      toast.error(deleteNewsResponse.data.message);
    }
  }

  const [pollsCount, setPollsCount] = useState([]);
  const [positiveCount, setPositiveCount] = useState("");
  const [negativeCount, setNegativeCount] = useState("");
  const [neutralCount, setNeutralCount] = useState("");
  const [noCount, setNoCount] = useState("");
  const [viewQuestion, setViewQuestion] = useState("");
  const [pollId, setPollId] = useState("");

  async function viewGraph(polls_id, questions) {
    setPollId(polls_id);
    setViewQuestion(questions);
    setShowViewModal(true);
    try {
      const formData = new FormData();
      formData.append("poll_id", polls_id);

      const fetchPollResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_poll_analysis",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setPollsCount(fetchPollResponse.data.error_code);
      if (fetchPollResponse.data.error_code == 404) {
        setPositiveCount("0%");
        setNegativeCount("0%");
        setNeutralCount("0%");
        setNoCount("0%");
      } else {
        fetchPollResponse.data.data.forEach((pollsItem) => {
          setPositiveCount(pollsItem.positive);
          setNegativeCount(pollsItem.negative);
          setNeutralCount(pollsItem.netural);
          setNoCount(pollsItem.no);
        });
      }
    } catch (e) {
      console.log("ERROR OCCURED", e);
    }
  }

  const positiveNumber = positiveCount;
  const negativeNumber = negativeCount;
  const neutralNumber = neutralCount;
  const noNumber = noCount;
  const reactDonutChartdata = [
    {
      label: "Positive",
      value: positiveNumber,
      color: "green",
    },
    {
      label: "Negative",
      value: negativeNumber,
      color: "red",
    },
    {
      label: "Neutral",
      value: neutralNumber,
      color: "purple",
    },
    {
      label: "No Answer",
      value: noNumber,
      color: "blue",
    },
  ];

  const reactDonutChartBackgroundColor = ["green", "red", "purple", "blue"];
  const reactDonutChartInnerRadius = 0.8;
  const reactDonutChartSelectedOffset = 0;
  const reactDonutChartOuterRadius = 0.7;
  
  const reactDonutChartHandleClick = (item, toggled) => {
    if (toggled) {
      // console.log("item", item);
    }
  };
  
  let reactDonutChartStrokeColor = "#FFFFFF";
  const reactDonutChartOnMouseEnter = (item) => {
    let color = reactDonutChartdata.find((q) => q.label === item.label).color;
    reactDonutChartStrokeColor = color;
  };

  const openActionsModal = (pollId) => {
    setShowActionsModal(prev => ({
      ...prev,
      [pollId]: !prev[pollId]
    }));
  };

  const closeActionsModal = (pollId) => {
    setShowActionsModal(prev => ({
      ...prev,
      [pollId]: false
    }));
  };

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

  const [stdData, setStdData] = useState([]);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function viewStdentAnswer() {
    const formData = new FormData();
    formData.append("poll_id", pollId);

    const eventResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_get_poll_answer_result",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    setErrorCode(eventResponse.data.error_code);
    setErrorMessage(eventResponse.data.message);
    if (eventResponse.data.error_code == 200) {
      setStdData(eventResponse.data.data);
    }
  }

  const student_view = [
    {
      name: "Student Name",
      selector: "name",
      wrap: true,
      width: "50%",
    },
    {
      name: "Answer",
      selector: "answer",
      wrap: true,
      width: "50%",
    },
  ];

  const filteredPollItems = stdData.filter(
    (item) =>
      JSON.stringify(item)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) !== -1
  );

  // Edit polls
  const [editStartDate, setEditStartDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSendTo, setEditSendTo] = useState("");

  function editNews(
    poll_id,
    polls_que_type,
    questions,
    publish_date,
    expire_date,
    category,
    cat_id,
    option1,
    option2,
    option3,
    option4,
    option5,
    send_to,
    send_to_student,
    delivery_type
  ) {
    setShowEditModal(true);
    setCategoryId(cat_id);
    setPollId(poll_id);
    setQuestionType(polls_que_type);
    setQuestion(questions);
    setDeliveryType(delivery_type);
    setEditStartDate(publish_date);
    setExpireDate(expire_date);
    setEditCategory(category);
    setEditSendTo(send_to);

    if (send_to == 2) {
      const name = send_to_student.map((item) => item.student_name);
      const student_id = send_to_student.map((item) => item.student_id);
      setChildPollData(name);
      setStudentId(student_id);
    }

    setAnswer1(option1);
    setAnswer2(option2);
    setAnswer3(option3);
    setAnswer4(option4);
    setAnswer5(option5);
  }

  function all_student() {
    setShowUserTypeModal(false);
  }

  const [userType, setUserType] = useState([]);

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

  async function updateForm() {
    setIsEditLoading(true);
    const formData = new FormData();

    formData.append("poll_id", pollId);
    formData.append("category", categoryId);
    formData.append("polls_que_type", questionType);
    formData.append("delivery_type", deliveryType);
    formData.append("questions", question);
    formData.append("option_1", answer1);
    formData.append("option_2", answer2);
    formData.append("option_3", answer3);
    formData.append("option_4", answer4);
    formData.append("option_5", answer5);
    formData.append("publish_date", editStartDate);
    formData.append("expire_date", expireDate);
    formData.append("send_to", editSendTo);
    formData.append("users", childId);

    const eventResponse = await axios.post(
      process.env.REACT_APP_API_KEY + "admin_edit_poll",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );
    setIsEditLoading(false);
    if (eventResponse.data.error_code == 200) {
      setShowEditWithPassModal(false);
      setDeletePassword("");
      handleEditButton();
    } else {
      setShowEditWithPassModal(false);
    }
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
      updateForm();
    } else {
      toast.error(deleteNewsResponse.data.message);
    }
  }

  const [pollsCategory, setPollsCategory] = useState([]);

  async function fetchPollsCategoryList() {
    const token = localStorage.getItem("Token");
    try {
      const fetchPollsListResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_poll_categories",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      const PollsCategoryErrorCode = fetchPollsListResponse.data.error_code;
      const PollsCategoryErrorMsg = fetchPollsListResponse.data.message;
      if (PollsCategoryErrorCode == 200) {
        const PollsCategoryListArray = fetchPollsListResponse.data.data;
        setPollsCategory(PollsCategoryListArray);
      } else {
        setPollsCategory([]);
      }
    } catch (err) {
      console.log("Log in Fail", err);
    }
  }

  function onlyOne(checkbox) {
    var checkboxes = document.getElementsByName("check");
    checkboxes.forEach((item) => {
      if (item !== checkbox) item.checked = false;
    });
  }

  const close_welcome_modal = () => {
    setShowWelcomeModal(false);
  };

  const columns = [
    {
      name: "List of polls Created",
      wrap: true,
      width: "45%",
      cell: (row) => {
        return (
          <div className="d-flex">
            <div
              onClick={() => viewDescription(row.poll_id)}
              style={{
                marginLeft: "10px",
                color: "#1F3977",
                cursor: "pointer",
                fontFamily: "poppins",
                fontStyle: "normal",
              }}
            >
              {row.questions}
            </div>
          </div>
        );
      },
    },
    {
      name: "Start Date",
      wrap: true,
      width: "auto",
      cell: (row) => {
        const dateString = row.publish_date;
        const startDate = moment(dateString).format("DD MMM YYYY");
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => viewDescription(row.poll_id)}
          >
            {startDate}
          </div>
        );
      },
    },
    {
      name: "Expiry Date",
      wrap: true,
      width: "auto",
      cell: (row) => {
        const expire_date = row.expire_date;
        const expDate = moment(expire_date).format("DD MMM YYYY");
        return (
          <div>
            {row.expire_date == "" ? (
              <div>-</div>
            ) : (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => viewDescription(row.poll_id)}
              >
                {expDate}
              </div>
            )}
          </div>
        );
      },
    },
    {
      name: "Status",
      wrap: true,
      width: "auto",
      cell: (row) => {
        const Exp = row.expire_date;
        const expDate = moment(Exp).format("YYYY-MM-DD HH:mm");
        const date = new Date();
        const todayy = moment(date).format("YYYY-MM-DD HH:mm");
        
        return (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => viewDescription(row.poll_id)}
          >
            {expDate >= todayy ? (
              <div style={{ color: "#2D5DD0", fontStyle: "normal" }}>
                Schedule
              </div>
            ) : expDate <= todayy ? (
              <div style={{ color: "#15A312", fontStyle: "normal" }}>
                Completed
              </div>
            ) : (
              <div style={{ color: "red", fontStyle: "normal" }}>
                Last Date
              </div>
            )}
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
              onClick={() => openActionsModal(row.poll_id)}
            >
              Actions
            </button>

            {showActionsModal[row.poll_id] && (
              <div
                className="edit_campus_modal"
                style={{
                  display: "block",
                  position: "absolute",
                  top: "22px",
                  right: "0px",
                  zIndex: 1000,
                  backgroundColor: "white",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <div className="d-flex ml-auto">
                  <img
                    className="campus_img ml-auto"
                    src="dist/img/Cancel.png"
                    onClick={() => closeActionsModal(row.poll_id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div
                  className="d-flex flex-row hover_class"
                  onClick={() => viewGraph(row.poll_id, row.questions)}
                  style={{ color: "#000", cursor: "pointer", padding: "5px 0" }}
                >
                  <div className="d-flex flex-row">
                    <div>
                      <img className="campus_img" src="dist/img/Chart1.png" />
                    </div>
                    <div className="campus_inner_div">
                      <span>Results</span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex flex-row hover_class"
                  onClick={() =>
                    editNews(
                      row.poll_id,
                      row.polls_que_type,
                      row.questions,
                      row.publish_date,
                      row.expire_date,
                      row.category,
                      row.category_id,
                      row.option_1,
                      row.option_2,
                      row.option_3,
                      row.option_4,
                      row.option_5,
                      row.send_to,
                      row.send_to_student,
                      row.delivery_type
                    )
                  }
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
                  onClick={() => deletePolls(row.poll_id, row.questions)}
                  style={{ color: "#000", cursor: "pointer", padding: "5px 0", border: "none", background: "none" }}
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
      
      {/* Edit Modal */}
      {showEditModal && (
        <div id="edit" className="edit_container">
          {/* Add your edit modal content here */}
          <div>Edit Modal Content</div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="preview_polls">
          {/* Add your preview modal content here */}
          <div>Preview Modal Content</div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div id="view" className="modaloverlay view_container">
          {/* Add your view modal content here */}
          <div>View Modal Content</div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="welcome_modal">
          {/* Add your welcome modal content here */}
          <div>Welcome Modal Content</div>
        </div>
      )}

      {/* Delete Modals */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          {/* Add your delete modal content here */}
          <div>Delete Modal Content</div>
        </div>
      )}

      {showDeleteWithPassModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          {/* Add your delete with password modal content here */}
          <div>Delete with Password Modal Content</div>
        </div>
      )}

      {showEditWithPassModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          {/* Add your edit with password modal content here */}
          <div>Edit with Password Modal Content</div>
        </div>
      )}

      {/* Main Content */}
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
              placeholder="Search by question"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="col-md-9 d-flex flex-row" style={{ justifyContent: "end" }}>
          <div style={{ marginTop: "0px", padding: "0" }}>
            <Link to="/createPoll">
              <button type="button" className="d-flex create_button">
                <div className="create_button_inner">Create Polls</div>
                <img className="create_button_img" src="dist/img/Progress.png" alt="Create" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="border_class">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            style={{ marginTop: "10PX" }}
            data={filteredItems}
            striped
            pagination
            customStyles={customStyles}
            subHeader
            subHeaderComponent={subHeaderComponent}
            highlightOnHover
            defaultSortFieldId={1}
          />
        )}
      </div>
    </div>
  );
}