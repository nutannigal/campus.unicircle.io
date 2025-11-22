import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const customStyles = {
  head: {
    style: {
      borderBottom: "0.5px solid #C4C4C4",
      marginTop: "0PX",
    },
  },
  rows: {
    style: {
      background: "#f5f5f5",
      borderBottom: "0.5px solid #f5f5f5",
      padding: "0",
    },
  },
  table: {
    style: {
      height: "220px",
    },
  },
};

export function Recipient({ studentId, passData }) {
  const token = localStorage.getItem("Token");
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [stdid, updateStdid] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const format_array = (array) => {
    let mapping = array.map(item => {
      let obj = {
        id: item
      }
      return obj
    })
    updateStdid(mapping)
  }

  useEffect(() => {
    format_array(studentId)
  }, [])

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
        setTimeout(() => setShowSuccess(false), 3000);
        
        const std_name = [];
        fetchNewsResponse.data.data.forEach((item) => {
          std_name.push(item.name);
        });
        
        if (passData) {
          passData(JSON.stringify(stdid), std_name);
        }
        
        toast.success("Students invited successfully!");
      } else {
        toast.error("Failed to invite students");
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
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const filteredItems = data.filter(
    (item) =>
      item &&
      JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1
  );

  const subHeaderComponent = useMemo(() => {
    return <div></div>;
  }, [filterText, resetPaginationToggle]);

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
          <div
            style={{
              color: "black",
              marginLeft: "10px",
              fontSize: "12px",
              display: showSuccess ? "block" : "none",
            }}
            className="invitation"
          >
            Student Invited Successfully
          </div>
          
          <button
            className="btn btn-primary ms-auto me-3 mb-2"
            onClick={InviteStudent}
            disabled={stdid.length === 0}
            style={{
              fontWeight: "500",
              border: "none",
              color: "white",
              borderRadius: "6px",
              backgroundColor: "#1F3977",
              padding: "8px 40px",
              fontSize: "11PX",
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