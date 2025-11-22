import React, { useState, useEffect, useMemo } from "react";
import { RiCameraLensLine } from "react-icons/ri";
import DataTable from "react-data-table-component";
import styled from "styled-components";
import axios from "axios";
import $ from "jquery";
import { BsFillPencilFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Input = styled.input.attrs(props => ({
  type: "text",
  size: props.small ? 5 : undefined
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
  head: {
    style: {
      marginTop: "0PX",
      fontSize: "11px",
      fontWeight: "600",
      color: "#4AA081",
    },
  },
  rows: {
    style: {
      background: "#f5f5f5",
      borderBottom: "0.5px solid #edebeb",
      padding: "0",
      minHeight: "30px !important",
      fontSize: "10px",
      fontWeight: "500"
    }
  },
  table: {
    style: {
      fontSize: "10px",
      height: "100%",
      fontWeight: "500",
      height: "360px"
    },
  },
};

export function NewRecipient(props) {
  const token = localStorage.getItem("Token");
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [stdid, updateStdid] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});

  async function fetchList() {
    try {
      setIsLoading(true);
      const fetchClassResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_students_list",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      
      console.log("Student API Response:", fetchClassResponse.data);
      
      if (fetchClassResponse.data.error_code === 200) {
        // Ensure we have an array and handle potential undefined data
        const studentData = Array.isArray(fetchClassResponse.data.data) 
          ? fetchClassResponse.data.data 
          : [];
        setData(studentData);
      } else {
        console.log("Failed to fetch students:", fetchClassResponse.data.message);
        setData([]);
        toast.error("Failed to load student data");
      }
    } catch (err) {
      console.log("Failed to fetch students", err);
      setData([]);
      toast.error("Error loading student data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleStudentSelection = (row) => {
    const studentId = row.student_id || row.id;
    
    if (!studentId) {
      console.error("No student ID found for row:", row);
      return;
    }

    setSelectedRows(prev => {
      const newSelection = { ...prev };
      
      if (newSelection[studentId]) {
        // Remove from selection
        delete newSelection[studentId];
        updateStdid(prevStd => prevStd.filter(item => item.id !== studentId));
      } else {
        // Add to selection
        newSelection[studentId] = true;
        const studentObj = {
          id: studentId,
          name: row.first_name || row.name || "Unknown Student"
        };
        updateStdid(prevStd => [...prevStd.filter(item => item.id !== studentId), studentObj]);
      }
      
      return newSelection;
    });
  };

  const deleteSelectedStudent = (studentId) => {
    setSelectedRows(prev => {
      const newSelection = { ...prev };
      delete newSelection[studentId];
      return newSelection;
    });
    
    updateStdid(prev => prev.filter(item => item.id !== studentId));
  };

  async function InviteStudent() {
    if (stdid.length === 0) {
      $(".invitee").show();
      $(".invitation").hide();
      setTimeout(() => {
        $(".invitee").hide();
      }, 3000);
      toast.error("Please select at least one student");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("users", JSON.stringify(stdid.map(item => item.id)));

      const fetchNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_user_id_name",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      console.log("Get_user_id_name", fetchNewsResponse.data);

      if (fetchNewsResponse.data.error_code === 200) {
        const stdNameArray = [];
        const responseData = fetchNewsResponse.data.data || [];
        
        responseData.forEach((item) => {
          if (item && item.name) {
            stdNameArray.push(item.name);
          }
        });

        $(".invitation").show();
        $(".invitee").hide();
        setTimeout(() => {
          $(".invitation").hide();
        }, 3000);

        // Pass data to parent component
        if (props.passData) {
          props.passData(JSON.stringify(stdid.map(item => item.id)), stdNameArray);
        }
        
        toast.success("Students invited successfully!");
      } else {
        $(".invitee").show();
        $(".invitation").hide();
        setTimeout(() => {
          $(".invitee").hide();
        }, 3000);
        toast.error(fetchNewsResponse.data.message || "Failed to invite students");
      }
    } catch (error) {
      console.error("Error inviting students:", error);
      toast.error("Error inviting students");
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    {
      name: "",
      sortable: false,
      wrap: true,
      width: "10%",
      cell: (row) => {
        const studentId = row.student_id || row.id;
        const isSelected = studentId ? selectedRows[studentId] : false;

        return (
          <div onClick={() => handleStudentSelection(row)}>
            <input 
              type="checkbox" 
              checked={isSelected || false}
              onChange={() => {}} // Handled by div onClick
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      },
    },
    {
      name: "Student Name",
      selector: (row) => {
        const firstName = row.first_name || "";
        const lastName = row.last_name || "";
        return `${firstName} ${lastName}`.trim() || "Unknown Student";
      },
      sortable: true,
      wrap: true,
      width: "auto",
    },
    {
      name: "Email",
      selector: (row) => row.email || "No email",
      sortable: true,
      wrap: true,
      width: "auto",
    },
  ];

  const [filterText, setFilterText] = React.useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  // Safe filtering with null checks
  const filteredItems = data.filter((item) => {
    if (!item) return false;
    
    try {
      const itemString = JSON.stringify(item).toLowerCase();
      return itemString.indexOf(filterText.toLowerCase()) !== -1;
    } catch (error) {
      console.error("Error filtering item:", item, error);
      return false;
    }
  });

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <div></div>
    );
  }, [filterText, resetPaginationToggle]);

  return (
    <div>
      <div className="recipient_class" style={{ marginTop: "0px", height: "100%", padding: "0" }}>
        <div className="mt-2" style={{ width: "100%" }}>
          <div className="d-flex flex-row" style={{ borderRadius: "2px", height: "35px", background: "rgba(228, 233, 243, 0.6)", padding: "0px", border: "none" }}>
            <img 
              src={require("../images/Search.png")} 
              style={{ width: "21px", height: "21px", margin: "5px 0px 0px 3px", background: "transparent" }} 
              alt="Search"
            />
            <Input
              id="search"
              type="text"
              placeholder="Search by Name"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{ background: "transparent", height: "35px", width: "100%", border: "none", fontWeight: "600", borderRadius: "2PX" }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredItems}
              striped
              subHeader
              subHeaderComponent={subHeaderComponent}
              highlightOnHover
              defaultSortFieldId={1}
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-4">
                  No students found
                </div>
              }
            />

            {/* Status Messages */}
            <div style={{ color: "green", marginLeft: "10px", fontSize: "12px", display: "none" }} className="invitation">
              Student Invited Successfully
            </div>

            <div style={{ color: "red", marginLeft: "10px", fontSize: "12px", display: "none" }} className="invitee">
              Please select Invitee
            </div>

            {/* Selected Students */}
            {stdid.length > 0 && (
              <div className="border_class2 selected_std_main_div mt-3 p-2">
                <h6 className="mb-2">Selected Students ({stdid.length}):</h6>
                <div className="d-flex flex-wrap gap-2">
                  {stdid.map((s_item) => (
                    <div key={s_item.id} className="selected_std_div d-flex align-items-center bg-light rounded-pill px-3 py-1">
                      <button 
                        style={{ background: "none", border: "none", padding: 0 }}
                        onClick={() => deleteSelectedStudent(s_item.id)}
                      >   
                        <img 
                          src="dist/img/selected_std_close.png"
                          className="selected_std_close_img"
                          alt="Remove"
                          style={{ width: "16px", height: "16px" }}
                        />
                      </button>  
                      <span className="ms-1 small">{s_item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publish Button */}
            <div className="d-flex form-buttons p-0 border_class2 box_padding buttons_div mt-3">
              <button
                type="button"
                className="publish_button btn btn-primary"
                onClick={InviteStudent}
                disabled={stdid.length === 0}
              >
                Publish ({stdid.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}