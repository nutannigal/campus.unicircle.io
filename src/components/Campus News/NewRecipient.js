import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import styled from "styled-components";
import axios from "axios";
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
      borderBottom: "0.5px solid #edebeb",
      marginTop: "0PX",
      fontSize: "12px"
    },
  },
  rows: {
    style: {
      background: "#f5f5f5",
      borderBottom: "0.5px solid #edebeb",
      padding: "0",
      minHeight: "30px !important",
      fontSize: "12px"
    }
  },
  table: {
    style: {
      fontSize: "12px",
      height: "100%",
    },
  },
};

export function NewRecipient(props) {
  const token = localStorage.getItem("Token");
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [stdid, updateStdid] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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

      if (fetchClassResponse.data.error_code === 200) {
        setData(fetchClassResponse.data.data);
      } else {
        toast.error("Failed to load students");
      }
    } catch (err) {
      console.log("Log in Fail", err);
      toast.error("Error loading students");
    }
  }

  async function InviteStudent() {
    if (stdid.length === 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      toast.error("Please select at least one student");
      return;
    }

    const formData = new FormData();
    formData.append("users", JSON.stringify(stdid));

    try {
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

      if (fetchNewsResponse.data.error_code === 200) {
        setShowSuccess(true);
        setShowError(false);
        setTimeout(() => setShowSuccess(false), 3000);
        
        const std_name = [];
        fetchNewsResponse.data.data.forEach((item) => {
          std_name.push(item.name);
        });
        
        if (props.passData) {
          props.passData(JSON.stringify(stdid), std_name);
        }
        
        toast.success("Students invited successfully!");
      } else {
        setShowError(true);
        setShowSuccess(false);
        setTimeout(() => setShowError(false), 3000);
        toast.error("Failed to invite students");
      }
    } catch (error) {
      console.error("Error inviting students:", error);
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => setShowError(false), 3000);
      toast.error("Error inviting students");
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    {
      name: "",
      sortable: true,
      wrap: true,
      width: "10%",
      cell: (row) => {
        const isSelected = stdid.some(i => i.id === row.student_id);
        
        return (
          <div
            onClick={() => {
              if (isSelected) {
                updateStdid((prev) =>
                  prev.filter((i) => i.id !== row.student_id)
                );
              } else {
                let obj = {
                  id: row.student_id,
                };
                updateStdid((prev) => [...prev, obj]);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <input 
              type="checkbox" 
              checked={isSelected}
              readOnly
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      },
    },
    {
      name: "Student Name",
      selector: "student_name",
      sortable: true,
      wrap: true,
      width: "auto",
    },
    {
      name: "Email",
      selector: "email",
      sortable: true,
      wrap: true,
      width: "auto",
    },
  ];

  const [filterText, setFilterText] = useState("");

  const filteredItems = data.filter(
    (item) =>
      item &&
      JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1
  );

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="mt-2" style={{ width: "100%", margin: "0", padding: "10px", borderBottom: "1px solid #edebeb" }}>
        <div className="d-flex flex-row" style={{ borderRadius: "2px", height: "35px", background: "rgba(228, 233, 243, 0.6)", padding: "0px", border: "none", margin: "0px 10px" }}>
          <img src={require("../images/Search.png")} style={{ width: "21px", height: "21px", margin: "5px 0px 0px 3px", background: "transparent" }} />
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
    );
  }, [filterText]);

  return (
    <div>
      <div
        className="recipient_class"
        style={{ marginTop: "0px", height: "100%", padding: "0" }}
      >
        <DataTable
          columns={columns}
          data={filteredItems}
          striped
          pagination
          subHeader
          paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
          subHeaderComponent={subHeaderComponent}
          highlightOnHover
          defaultSortFieldId={1}
          customStyles={customStyles}
        />
        
        <div className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <div style={{ color: "green", marginLeft: "10px", fontSize: "12px", display: showSuccess ? "block" : "none" }} className="invitation">
              Student Invited Successfully
            </div>
            <div style={{ color: "red", marginLeft: "10px", fontSize: "12px", display: showError ? "block" : "none" }} className="invitee">
              Please select Invitee
            </div>
          </div>
          
          <button
            className="btn btn-primary me-2 mb-2"
            onClick={InviteStudent}
            disabled={stdid.length === 0}
            style={{
              fontWeight: "500",
              border: "none",
              color: "white",
              borderRadius: "6px",
              backgroundColor: "#1F3977",
              padding: "7px 20px",
              fontSize: "12PX",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          >
            Invite ({stdid.length})
          </button>
        </div>
      </div>
    </div>
  );
}