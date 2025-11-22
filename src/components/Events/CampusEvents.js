import React, { useState, useEffect, useMemo, useRef } from "react";
import { IoCloseCircleSharp } from "react-icons/io5";
import moment from "moment";
import Alert from "@mui/material/Alert";
import DataTable from "react-data-table-component";
import axios from "axios";
import $ from "jquery";
import Stack from "@mui/material/Stack";
import Swal from "sweetalert2";
import { PreviousNext_Button_upcoming } from "./PreviousNext_Button_upcoming";
import { PreviousNext_Button_past } from "./PreviousNext_Button_past";
import styled from "styled-components";
import { PersonaRecipient } from "./PersonaRecipient";
import { NewPersonaRecipient } from "./NewPersonaRecipient";
import { Recipient } from "./Recipient";
import { NewRecipient } from "./NewRecipient";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import LoadingSpinner from "../LoadingSpinner";
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
      height: "45px"
    },
  },
};

export function CampusEvents() {
  const token = localStorage.getItem("Token");
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState(true);
  const [counter, setCounter] = useState(0);
  const [deletePassword, updateDeletePassword] = useState("");
  const [emailAddress, updateEmailAddress] = useState("");
  const [campudId, updateCampudId] = useState("");
  const [deleteErrorCode, updatedeleteErrorCode] = useState("");
  const [deleteErrorMessage, updatedeleteErrorMessage] = useState("");
  const [eventID, updateEventID] = useState("");
  const [eventName, updateEventName] = useState("");
  const [eventDescription, updateEventDescription] = useState("");
  const [eventImageID, updateEventImageID] = useState("");
  const [eventImage, updateEventImage] = useState([]);
  const [venue, updateVenue] = useState("");
  const [eventDate, updateEventDate] = useState("");
  const [startTime, updateStartTime] = useState("");
  const [endTime, updateEndTime] = useState("");
  const [eventFee, updateEventFee] = useState("");
  const [eventCapacity, updateEventCapacity] = useState("");
  const [ticketUrl, updateTicketUrl] = useState("");
  const [sendTo, updateSendTo] = useState("");
  const [studentId, updateStudentId] = useState([]);
  const [newEventId, updateNewEventId] = useState();

  const navigate = useNavigate();

  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectAllRowsItemText: "ALL",
  };

  const [childNewsData, setChildNewsData] = useState([]);

  // Upcoming events handlers
  const passEditDataUpcoming = (eventId) => {
    setChildNewsData(eventId);
    edit_category(eventId);
  };

  const passDeleteDataUpcoming = (eventId) => {
    setChildNewsData(eventId);
    delete_category(eventId);
  };

  // Past events handlers
  const passEditDataPast = (eventId) => {
    setChildNewsData(eventId);
    edit_category(eventId);
  };

  const passDeleteDataPast = (eventId) => {
    setChildNewsData(eventId);
    delete_category(eventId);
  };

  async function edit_category(eventId) {
    $(".preview_polls_upcoming").hide();
    $(".preview_polls_past").hide();
    await editNews(eventId);
  }

  function delete_category() {
    $(".delete_preview_container").show();
    $(".preview_polls_upcoming").hide();
    $(".preview_polls_past").hide();
  }

  async function previewDeleteWithPassword() {
    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campudId);

    try {
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

      updatedeleteErrorCode(deleteNewsResponse.data.error_code);
      updatedeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        await deletePreviewMessage();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }

  async function deletePreviewMessage() {
    $(".delete_preview_container").hide();
    try {
      const formData = new FormData();
      formData.append("e_id", childNewsData);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      updatedeleteErrorMessage(deleteResponse.data.message);
      if (deleteResponse.data.error_code === 200) {
        $(".delete_popup_password").hide();
        handleButton();
        toast.success("Event deleted successfully!");
      } else {
        toast.error(deleteResponse.data.message);
      }
    } catch (err) {
      console.log("Delete failed", err);
      toast.error("Delete operation failed");
    }
  }

  // Persona Management
  const [errorMessagePersona, updateErrorMessagePersona] = useState("");
  const [addPersona, updatePersona] = useState("");
  const [errorCodePersona, updateErrorCodePersona] = useState("");

  async function createPersona() {
    if (!addPersona.trim()) {
      toast.error("Please enter a persona name");
      return;
    }

    const formData = new FormData();
    formData.append("persona", addPersona);

    try {
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

      updateErrorMessagePersona(personaResponse.data.message);
      updateErrorCodePersona(personaResponse.data.error_code);

      if (personaResponse.data.error_code === 200) {
        toast.success(personaResponse.data.message);
        updatePersona("");
        $(".personaMsg").show();
        setTimeout(() => $(".personaMsg").hide(), 3000);
      } else {
        toast.error(personaResponse.data.message);
      }
    } catch (error) {
      console.error("Create persona failed:", error);
      toast.error("Failed to create persona");
    }
  }

  const [childData, setChildData] = useState([]);
  const [childId, setChildId] = useState({});

  const passData = (id, data) => {
    setChildId(id);
    setChildData(data);
  };

  const passPersonaData = (Pid, Pdata) => {
    setChildId(Pid);
    setChildData(Pdata);
  };

  async function getUserDetails() {
    try {
      const fetchResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "admin_get_Primary_user_info",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (fetchResponse.data.error_code === 200 && fetchResponse.data.data) {
        fetchResponse.data.data.forEach((fetchItem) => {
          updateEmailAddress(fetchItem.email || "");
          updateCampudId(fetchItem.campus_id || "");
        });
      }
    } catch (error) {
      console.error("Failed to get user details:", error);
    }
  }

  const [newData, setNewData] = useState([]);
  const [newEId, setNewEId] = useState("");
  const [rowIndex, setRowIndex] = useState(0);

  async function viewUpcomingDescription(e_id, rowIndex) {
    updateNewEventId(e_id);
    setRowIndex(rowIndex);

    try {
      const formData = new FormData();
      const fetchNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_all_campus_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (fetchNewsResponse.data.error_code === 200) {
        const allData = fetchNewsResponse.data.data || [];
        setNewData(allData);
        navigate("/eventpreview", { state: { e_id } });
      } else {
        toast.error("Failed to load event details");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Error loading event details");
    }
  }

  function viewDescriptionPast(e_id) {
    navigate("/eventpreview", { state: { e_id } });
  }

  // Fixed fetchList function to properly handle student data
  async function fetchList() {
    try {
      const fetchClassResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_students_list",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      console.log("Student Details", fetchClassResponse.data.data);

      if (fetchClassResponse.data.error_code === 200) {
        const studentData = fetchClassResponse.data.data || [];
        setEventData(studentData);
        console.log("Processed student data:", studentData);
      } else {
        console.log("Failed to fetch student data");
        setEventData([]);
      }
    } catch (err) {
      console.log("Failed to fetch student list", err);
      setEventData([]);
      toast.error("Failed to load student data");
    }
  }

  const summernoteCssFunc = () => {
    setTimeout(() => {
      $(".note-statusbar").hide();
      $(".note-toolbar").hide();
      $(".note-editable").css("height", "250px");
    }, 100);
  };

  useEffect(() => {
    fetchList();
    getUserDetails();
    summernoteCssFunc();

    // Event listeners for modal closures
    $(document).on('click', '.close_event', function () {
      $(".preview_polls_upcoming").hide();
      $(".preview_polls_past").hide();
      $(".user_type").hide();
    });
  }, []);

  async function deleteWithPassword() {
    if (!deletePassword) {
      toast.error("Please enter admin password");
      return;
    }

    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campudId);

    try {
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

      updatedeleteErrorCode(deleteNewsResponse.data.error_code);
      updatedeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        updateDeletePassword("");
        await deleteMessage();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }

  async function editWithPassword() {
    if (!deletePassword) {
      toast.error("Please enter admin password");
      return;
    }

    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campudId);

    try {
      const editNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_check_password",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      updatedeleteErrorCode(editNewsResponse.data.error_code);
      updatedeleteErrorMessage(editNewsResponse.data.message);

      if (editNewsResponse.data.error_code === 200) {
        await updateForm();
      } else {
        toast.error(editNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }

  const [filterEventText, setFilterEventText] = useState("");
  const [resetEventPaginationToggle, setEventResetPaginationToggle] = useState(false);

  const filteredEventItems = eventData.filter(
    (item) =>
      item &&
      JSON.stringify(item)
        .toLowerCase()
        .indexOf(filterEventText.toLowerCase()) !== -1
  );

  const subHeaderEventComponent = useMemo(() => {
    const handleClear = () => {
      if (filterEventText) {
        setEventResetPaginationToggle(!resetEventPaginationToggle);
        setFilterEventText("");
      }
    };

    return <div></div>;
  }, [filterEventText, resetEventPaginationToggle]);

  const [data, setData] = useState([]);

  async function fetchUpcomingEvents() {
    try {
      setIsLoading(true);
      const formData = new FormData();

      const fetchEventResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_all_campus_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      console.log("all events---------", fetchEventResponse);

      if (fetchEventResponse.data.error_code === 404) {
        setData(fetchEventResponse.data.data || []);
      } else {
        setData([]);
        console.log("Failed to fetch events");
      }
    } catch (err) {
      console.log("Failed to fetch events", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const openActionsModal = (e) => {
    // Close all other modals first
    $(".edit_campus_modal").hide();
    // Toggle the specific modal
    $(`.actions_modal${e}`).toggle();
  };

  const closeActionsModal = () => {
    $(".edit_campus_modal").hide();
    $(".actions_modal").hide();
  };

  function deleteNews(event_id, event_title) {
    updateGetEventTitle(event_title);
    updateGetEventID(event_id);
    $(".deleteEventModal").show();
  }

  function deletePopupFunc() {
    $(".deleteEventWithPass").show();
    $(".deleteEventModal").hide();
  }

  function closeDeleteNewsModal() {
    $(".deleteEventModal").hide();
    $(".edit_campus_modal").hide();
    $(".deleteEventWithPass").hide();
    $(".editWithPassModal").hide();
    updateDeletePassword("");
  }

  // Fixed upcomingColumns to handle data properly
  const upcomingColumns = [
    {
      name: "Event Name",
      wrap: true,
      width: "30%",
      cell: (row, rowIndex) => {
        const array = [];
        // Safely handle image array
        if (row.image && Array.isArray(row.image)) {
          row.image.forEach((itemimage) => {
            if (itemimage && itemimage.image) {
              array.push(itemimage.image);
            }
          });
        }

        return (
          <div className="d-flex align-items-center">
            {array.length === 0 ? (
              <div>
                <img
                  src={require("../images/no_image.png")}
                  style={{ padding: "5px", width: "40px", height: "30px", objectFit: "cover" }}
                  alt="No image"
                />
              </div>
            ) : (
              <div>
                <img
                  className="event_column_img"
                  src={array[0]}
                  alt="Event"
                  style={{ width: "40px", height: "30px", objectFit: "cover", borderRadius: "4px" }}
                />
              </div>
            )}
            <div className="ms-2">
              <p
                className="ten_font_class m-0"
                onClick={() => viewUpcomingDescription(row.event_id, rowIndex)}
                style={{
                  color: "black",
                  cursor: "pointer",
                  width: "160px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                title={row.label || row.title || "No Title"}
              >
                {row.label || row.title || "No Title"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      name: "Date",
      wrap: true,
      width: "auto",
      cell: (row, rowIndex) => {
        const dateString = row.start_date;
        if (!dateString) {
          return <div className="ten_font_class">No date</div>;
        }

        try {
          const date = new Date(dateString + "T00:00:00");
          if (isNaN(date.getTime())) {
            return <div className="ten_font_class">Invalid date</div>;
          }

          const options = {
            day: "numeric",
            month: "long",
            year: "numeric",
          };
          const getDate = date.toLocaleString("en-GB", options);

          return (
            <div onClick={() => viewUpcomingDescription(row.event_id, rowIndex)}>
              <div className="ten_font_class" style={{ cursor: "pointer" }}>
                {getDate}
              </div>
            </div>
          );
        } catch (error) {
          return <div className="ten_font_class">Invalid date</div>;
        }
      },
    },
    {
      name: "Venue",
      wrap: true,
      width: "20%",
      cell: (row, rowIndex) => {
        return (
          <div
            className="ten_font_class"
            style={{
              cursor: "pointer",
              width: "160px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
            onClick={() => viewUpcomingDescription(row.event_id, rowIndex)}
            title={row.location || "No venue"}
          >
            {row.location || "No venue"}
          </div>
        );
      },
    },
    {
      name: "Invitees",
      wrap: true,
      width: "auto",
      cell: (row, rowIndex) => {
        const inviteeText = row.send_to == 1 ? "All Students" : "Specific Recipient";
        return (
          <div
            className="ten_font_class"
            style={{ cursor: "pointer" }}
            onClick={() => viewUpcomingDescription(row.event_id, rowIndex)}
            title={inviteeText}
          >
            {inviteeText}
          </div>
        );
      },
    },
    {
      name: "Entry Fee",
      wrap: true,
      width: "auto",
      cell: (row, rowIndex) => {
        const fee = row.entry_fee || row.fee || "Free";
        return (
          <div
            className="ten_font_class"
            style={{ cursor: "pointer" }}
            onClick={() => viewUpcomingDescription(row.event_id, rowIndex)}
            title={fee}
          >
            {fee}
          </div>
        );
      },
    },
    {
      name: "Status",
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div
            className="ten_font_class"
            style={{ cursor: "pointer" }}
            onClick={() => viewDescriptionPast(row.event_id)}
            title={row.event_type || "No status"}
          >
            {row.event_type || "No status"}
          </div>
        );
      },
    },
    {
      name: "Actions",
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div className="action_buttons_end_css position-relative">
            <button
              className="all_action_buttons"
              onClick={() => openActionsModal(row.event_id)}
            >
              Actions
            </button>

            <div
              className={`edit_campus_modal actions_modal${row.event_id} bg-white shadow rounded p-2`}
              style={{
                display: "none",
                position: "absolute",
                top: "100%",
                right: "0",
                zIndex: 1000,
                minWidth: "120px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-bold">Actions</span>
                <img
                  src="dist/img/Cancel.png"
                  onClick={closeActionsModal}
                  alt="Close"
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>

              <div
                className="d-flex align-items-center hover_class py-1 px-2 rounded"
                onClick={() => editNews(row.event_id)}
                style={{ cursor: "pointer" }}
              >
                <img src="dist/img/Pencil.png" alt="Edit" style={{ width: "16px", height: "16px" }} />
                <span className="small ms-2">Edit</span>
              </div>

              <div
                className="d-flex align-items-center hover_class py-1 px-2 rounded"
                onClick={() => deleteNews(row.event_id, row.label || row.title)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={require("../images/delete.png")}
                  alt="Delete"
                  style={{ width: "16px", height: "16px" }}
                />
                <span className="small ms-2">Delete</span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const filteredItems = data.filter(
    (item) =>
      item &&
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

    return (
      <div className="d-flex align-items-center">
        <Input
          placeholder="Search events..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          autoComplete="off"
        />
        {filterText && (
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  // Edit event functionality
  const [categoryId, updateCategoryId] = useState("");
  const [newsCategorydata, setNewsCategoryData] = useState([]);

  async function editNews(e_id) {
    const formData = new FormData();
    formData.append("e_id", e_id);

    try {
      const eventResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      console.log("eventResponse________", eventResponse);
      $(".edit_campus_modal").hide();
      $(".actions_modal").hide();

      if (eventResponse.data.error_code === 200 && eventResponse.data.data) {
        const item = eventResponse.data.data[0]; // Assuming first item
        updateEventID(item.event_id || "");
        updateEventName(item.title || "");
        updateEventDescription(item.description || "");
        updateEventImage(item.image || []);
        updateVenue(item.location || "");

        if (item.start_date) {
          const StartDate = moment(item.start_date).format("YYYY-MM-DD");
          updateEventDate(StartDate);
        } else {
          updateEventDate("");
        }

        updateStartTime(item.start_time || "");
        updateEndTime(item.end_time || "");
        updateEventFee(item.fee || "");
        updateEventCapacity(item.capacity || "");
        updateTicketUrl(item.url || "");
        updateSendTo(item.send_to || "");

        if (item.send_to == 2 && item.send_to_student) {
          const name = item.send_to_student.map(
            (stditem) => stditem.student_name || ""
          ).filter(name => name);
          const student_id = item.send_to_student.map(
            (stditem) => stditem.student_id || ""
          ).filter(id => id);

          setChildData(name);
          updateStudentId(student_id);
        } else {
          setChildData([]);
          updateStudentId([]);
        }
        $(".edit_container").show();
      } else {
        toast.error("Failed to load event data");
      }
    } catch (error) {
      console.error("Error editing event:", error);
      toast.error("Error loading event data");
    }
  }

  async function fetchNewsList() {
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

      if (fetchnewsListResponse.data.error_code === 200) {
        const NewsCategoryListArray = fetchnewsListResponse.data.data || [];
        setNewsCategoryData(NewsCategoryListArray);
      } else {
        setNewsCategoryData([]);
      }
    } catch (err) {
      console.log("Failed to fetch news list", err);
      setNewsCategoryData([]);
    }
  }

  useEffect(() => {
    fetchNewsList();
  }, []);

  function all_student() {
    $(".user_type").hide();
  }

  const [userType, updateUserType] = useState([]);

  async function specific_class() {
    $(".user_type").show();
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

      if (fetchClassResponse.data.error_code === 200) {
        updateUserType(fetchClassResponse.data.data || []);
      } else {
        updateUserType([]);
      }
    } catch (err) {
      console.log("Failed to fetch classes", err);
      updateUserType([]);
    }
  }

  const handleButton = () => {
    $(".edit_popup_password").hide();
    fetchUpcomingEvents();
  };

  const handleEditButton = () => {
    $(".edit_popup_password").hide();
    fetchUpcomingEvents();
  };

  async function showEventImage() {
    if (!eventID) {
      console.warn("No event ID for image upload");
      return;
    }

    const formData = new FormData();
    formData.append("event_id", eventID);

    if (photo && photo.length > 0) {
      for (let i = 0; i < photo.length; i++) {
        formData.append("File[]", photo[i]);
      }

      try {
        await axios.post(
          process.env.REACT_APP_API_KEY + "admin_add_event_image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );
      } catch (error) {
        console.error("Error uploading event image:", error);
      }
    }
  }

  async function updateForm() {
    if (!eventID) {
      toast.error("No event ID found");
      return;
    }

    if (!eventName.trim()) {
      toast.error("Please enter event name");
      return;
    }

    const formData = new FormData();
    formData.append("event_id", eventID);
    formData.append("title", eventName);
    formData.append("location", venue);
    formData.append("description", eventDescription);
    formData.append("url", ticketUrl);

    console.log('Updating event with data:', {
      event_id: eventID,
      title: eventName,
      location: venue,
      description: eventDescription,
      url: ticketUrl
    });

    try {
      const eventResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_edit_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      // Handle image upload if there are new photos
      if (photo && photo.length > 0) {
        await showEventImage();
      }

      if (eventResponse.data.error_code === 200) {
        $(".editWithPassModal").hide();
        updateDeletePassword("");
        handleEditButton();
        toast.success("Event updated successfully!");
      } else {
        toast.error(eventResponse.data.message);
      }

      $(".edit_container").hide();
      $(".edit_campus_modal").hide();
      $(".actions_modal").hide();

    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event");
    }
  }

  // Delete events functionality
  const [getEventTitle, updateGetEventTitle] = useState("");
  const [getEventID, updateGetEventID] = useState("");

  async function deleteMessage() {
    if (!getEventID) {
      toast.error("No event ID found");
      return;
    }

    $(".delete_container").hide();
    $(".edit_campus_modal").hide();
    $(".actions_modal").hide();

    try {
      const formData = new FormData();
      formData.append("e_id", getEventID);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_event",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      updatedeleteErrorMessage(deleteResponse.data.message);
      if (deleteResponse.data.error_code === 200) {
        $(".delete_popup_password").hide();
        updateDeletePassword("");
        handleButton();
        toast.success("Event deleted successfully!");
      } else {
        toast.error(deleteResponse.data.message);
      }
    } catch (err) {
      console.log("Delete failed", err);
      toast.error("Delete operation failed");
    }
  }

  async function showEventNoImage() {
    if (!eventID) return;

    const formData = new FormData();
    if (eventImage) {
      formData.append("File[]", eventImage);
    }
    formData.append("event_id", eventID);

    try {
      await axios.post(
        process.env.REACT_APP_API_KEY + "admin_add_event_image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
    } catch (error) {
      console.error("Error handling event image:", error);
    }
  }

  function close_delete_modal() {
    $(".delete_container").hide();
    $(".edit_campus_modal").hide();
    $(".actions_modal").hide();
    updateDeletePassword("");
  }

  const [photo, updatePhotos] = useState([]);
  const [imgData, setImgData] = useState([]);
  const [imgDataMarketplace, setImgDataMarketplace] = useState([]);

  const getMultipleImage = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      updatePhotos(files);

      const newImgData = [];
      const newImgDataMarketplace = [];

      files.forEach((file) => {
        const src = URL.createObjectURL(file);
        newImgData.push(src);
        newImgDataMarketplace.push(src);
      });

      setImgData(newImgData);
      setImgDataMarketplace(newImgDataMarketplace);
    }
  };

  function close_edit_modal() {
    $(".edit_container").hide();
    // Reset form state
    updateEventID("");
    updateEventName("");
    updateEventDescription("");
    updateEventImage([]);
    updateVenue("");
    updateEventDate("");
    updateStartTime("");
    updateEndTime("");
    updateEventFee("");
    updateEventCapacity("");
    updateTicketUrl("");
    updateSendTo("");
    updateStudentId([]);
    setChildData([]);
    setImgData([]);
    updatePhotos([]);
  }

  function update_edited_Event() {
    if (!eventName.trim()) {
      toast.error("Please enter event name");
      return;
    }
    $(".editWithPassModal").show();
  }

  function closePreviewDescription() {
    $(".preview_polls_upcoming").hide();
    $(".preview_polls_past").hide();
  }

  function showImage() {
    $(".image_std").hide();
    $("#file-ip-1-preview").show();
  }

  function deleteFile(index) {
    const newImgData = imgData.filter((item, i) => i !== index);
    setImgData(newImgData);

    const newPhotos = Array.from(photo).filter((item, i) => i !== index);
    updatePhotos(newPhotos);
  }

  const handelSummenrnote = (content) => {
    updateEventDescription(content);
  };

  const close_welcome_modal = () => {
    $(".welcome_modal").hide();
  }

  // Add missing function to delete individual images
  const deleteImage = (image_id, index, evt) => {
    evt.stopPropagation();
    evt.preventDefault();

    // Create a new array without the deleted image
    const newEventImages = eventImage.filter((img, i) => i !== index);
    updateEventImage(newEventImages);

    // You might want to make an API call here to delete the image from the server
    console.log("Delete image from server:", image_id);

    toast.success("Image removed successfully");
  };

  // Add this function to handle outside clicks for modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close modals when clicking outside
      if (!event.target.closest('.edit_campus_modal') && !event.target.closest('.all_action_buttons')) {
        $(".edit_campus_modal").hide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="content-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Edit Event Modal */}
      <div id="edit" className="edit_container" style={{ display: 'none' }}>
        <div className="edit_container_inner bg-white rounded shadow-lg">
          <div className="d-flex edit_top_container p-3 border-bottom">
            <label className="main_labels fs-5 fw-bold">Edit Campus Events</label>
            <img
              src="dist/img/Cancel.png"
              onClick={close_edit_modal}
              alt="Close"
              className="close_event ml-auto cancel_img"
              style={{ cursor: 'pointer', width: '24px', height: '24px' }}
            />
          </div>
          <div className="card-body p-3">
            <div className="preview_form">
              <div className="mb-4">
                <div className="edit_top_label mb-3">
                  <p className="fw-bold text-primary">Name, Venue & URL</p>
                </div>
                <div className="edit_border_class p-3 rounded">
                  <div className="row g-3">
                    <div className="col-md-3 d-flex align-items-center">
                      <label className="all_labels fw-medium">Name:</label>
                    </div>
                    <div className="col-md-9">
                      <input
                        type="text"
                        className="form-control"
                        value={eventName}
                        onChange={(e) => updateEventName(e.target.value)}
                        placeholder="Enter event name"
                        autoComplete="true"
                      />
                    </div>

                    <div className="col-md-3 d-flex align-items-center">
                      <label className="all_labels fw-medium">Venue:</label>
                    </div>
                    <div className="col-md-9">
                      <input
                        type="text"
                        className="form-control"
                        value={venue}
                        onChange={(e) => updateVenue(e.target.value)}
                        placeholder="Enter venue"
                      />
                    </div>

                    <div className="col-md-3 d-flex align-items-center">
                      <label className="all_labels fw-medium">Event URL:</label>
                    </div>
                    <div className="col-md-9">
                      <input
                        type="text"
                        className="form-control"
                        value={ticketUrl}
                        onChange={(e) => updateTicketUrl(e.target.value)}
                        placeholder="Enter event URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="edit_top_label mb-3">
                    <p className="fw-bold text-primary">Event Description</p>
                  </div>
                  <div className="border rounded">
                    <SummerNote
                      _onChange={handelSummenrnote}
                      value={eventDescription}
                      placeholder="Enter your event description here..."
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="mt-4">
                  <div className="edit_top_label mb-3">
                    <p className="fw-bold text-primary">Event Images</p>
                  </div>
                  <div className="border rounded p-3">
                    <div className="mb-3">
                      <label htmlFor="event-images" className="btn btn-outline-primary btn-sm">
                        Add Images
                      </label>
                      <input
                        type="file"
                        id="event-images"
                        multiple
                        accept="image/*"
                        onChange={getMultipleImage}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {/* Current Images */}
                    {eventImage.length > 0 && (
                      <div className="mb-3">
                        <h6>Current Images:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {eventImage.map((img, index) => (
                            <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                              <IoCloseCircleSharp
                                className="position-absolute top-0 end-0 bg-white rounded-circle"
                                style={{ cursor: 'pointer', zIndex: 1 }}
                                onClick={(evt) => deleteImage(img.image_id || index, index, evt)}
                                size={20}
                              />
                              <img
                                src={img.image || img}
                                alt={`Event ${index + 1}`}
                                className="img-thumbnail w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images */}
                    {imgData.length > 0 && (
                      <div>
                        <h6>New Images:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {imgData.map((src, index) => (
                            <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                              <IoCloseCircleSharp
                                className="position-absolute top-0 end-0 bg-white rounded-circle"
                                style={{ cursor: 'pointer', zIndex: 1 }}
                                onClick={() => deleteFile(index)}
                                size={20}
                              />
                              <img
                                src={src}
                                alt={`New ${index + 1}`}
                                className="img-thumbnail w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                <button
                  className="btn btn-secondary"
                  onClick={close_edit_modal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={update_edited_Event}
                >
                  Update Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade deleteEventModal" tabIndex="-1" style={{ display: 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Event</h5>
              <button type="button" className="btn-close" onClick={closeDeleteNewsModal}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the event "{getEventTitle}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={deletePopupFunc}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete with Password Modal */}
      <div className="modal fade deleteEventWithPass" tabIndex="-1" style={{ display: 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeDeleteNewsModal}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Warning:</strong> You are about to delete an event. This operation cannot be undone.
              </div>
              <div className="mb-3">
                <label htmlFor="deletePassword" className="form-label">Admin Password:</label>
                <input
                  type="password"
                  className="form-control"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => updateDeletePassword(e.target.value)}
                  placeholder="Enter your admin password"
                />
              </div>
              {deleteErrorCode !== 200 && deleteErrorMessage && (
                <div className="alert alert-danger">{deleteErrorMessage}</div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={deleteWithPassword}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit with Password Modal */}
      <div className="modal fade editWithPassModal" tabIndex="-1" style={{ display: 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title">Confirm Edit</h5>
              <button type="button" className="btn-close" onClick={closeDeleteNewsModal}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Warning:</strong> You are editing an event. Please confirm your identity.
              </div>
              <div className="mb-3">
                <label htmlFor="editPassword" className="form-label">Admin Password:</label>
                <input
                  type="password"
                  className="form-control"
                  id="editPassword"
                  value={deletePassword}
                  onChange={(e) => updateDeletePassword(e.target.value)}
                  placeholder="Enter your admin password"
                />
              </div>
              {deleteErrorCode !== 200 && deleteErrorMessage && (
                <div className="alert alert-danger">{deleteErrorMessage}</div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-warning" onClick={editWithPassword}>
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <div className="welcome_modal" style={{ display: 'none' }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="welcome_msg_main_div bg-primary text-white rounded p-4 shadow">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="welcome_msg_main_p mb-0">WELCOME TO EVENTS!</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={close_welcome_modal}
                ></button>
              </div>
              <div>
                <p className="welcome_msg_inner_p mb-0">
                  Seamlessly create, share, and manage every aspect of campus events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Search and Create Section */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="search_box_div position-relative">
              <img
                className="search_box_img position-absolute"
                src={require("../images/Search.png")}
                alt="Search"
                style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
              />
              <Input
                className="search_box w-100 ps-5"
                type="text"
                placeholder="Search by event name, venue, or date..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-md-4 text-end">
            <Link to="/createEvent" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Create Event
            </Link>
          </div>
        </div>

        {/* Events Table */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Campus Events</h5>
          </div>
          <div className="card-body">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No events found</h5>
                    <p className="text-muted">
                      {filterText ? 'Try adjusting your search terms' : 'Get started by creating your first event'}
                    </p>
                    {!filterText && (
                      <Link to="/createEvent" className="btn btn-primary mt-2">
                        Create Event
                      </Link>
                    )}
                  </div>
                ) : (
                  <DataTable
                    columns={upcomingColumns}
                    data={filteredItems}
                    striped
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 30, 50]}
                    paginationComponentOptions={paginationComponentOptions}
                    subHeader
                    subHeaderComponent={subHeaderComponent}
                    highlightOnHover
                    responsive
                    customStyles={customStyles}
                    noDataComponent={
                      <div className="text-center py-4">
                        No events match your search criteria
                      </div>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/*  group tab content */}
      <div class="tab-pane" id="2">
        <h3>This Is Group</h3>
      </div>

      <div class="tab-pane" id="3">
        {/*  individual content  */}

        <div
          id="exTab3"
          class="container"
          style={{ marginTop: "0PX", height: "100%" }}
        >
          <ul class="nav nav_tabs">
            <li class="active">
              <a href="#6" data-toggle="tab">
                Recipient
              </a>
            </li>
            <li style={{ marginLeft: "5px" }}>
              <a href="#7" data-toggle="tab">
                Upload Recipient
              </a>
            </li>
          </ul>

          <div
            class="tab-content "
            style={{ padding: "0px", height: "auto" }}
          >
            <div
              class="tab-pane active"
              id="6"
              style={{ height: "100%" }}
            >
              {studentId != "" ? (
                <Recipient
                  style={{ height: "100%" }}
                  studentId={studentId}
                  passData={passData}
                />
              ) : (
                <NewRecipient
                  style={{ height: "100%" }}
                  passData={passData}
                />
              )}
            </div>
            <div class="tab-pane" id="7">
              <h3 style={{ fontWeight: "600" }}>UPLOAD RECIPIENT</h3>

              <div className="mt-2 p-0">
                <div class="row">
                  <div class="col-md-12">
                    <div
                      style={{
                        width: "100%",
                        marginTop: "0px",
                        paddingRight: "0",
                      }}
                    >
                      <div className="d-flex">
                        <label
                          style={{
                            color: "#1F3977",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Upload ExcelSheet
                        </label>

                        <p
                          style={{
                            color: "#EB2424",
                            fontWeight: "600",
                            marginLeft: "3PX",
                          }}
                        >
                          *
                        </p>
                      </div>

                      <input
                        type="file"
                        id="excelSheet"
                        placeholder="Your Title goes here..."
                        autoComplete="true"
                        style={{
                          boxSizing: "border-box",
                          fontSize: "12px",
                          paddingLeft: "5PX",
                        }}
                      />

                      <div className="d-flex mt-3">
                        <input
                          type="button"
                          className=" form-buttons3"
                          defaultValue="Sign Up"
                          value="Publish"
                          style={{
                            marginLeft: "auto",
                            fontWeight: "500",
                            border: "none",
                            color: "white",
                            borderRadius: "6px",
                            backgroundColor: "#1F3977",
                            padding: "6px 20px",
                            fontSize: "12PX",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ color: "green", marginLeft: "50px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}