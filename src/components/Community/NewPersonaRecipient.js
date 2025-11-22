import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import styled from "styled-components";

const Input = styled.input.attrs(props => ({
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
  head: {
    style: {
      borderBottom: "0.5px solid #edebeb",
      marginTop: "0PX",
      fontSize: "12px",
    },
  },
  rows: {
    style: {
      background: "#f5f5f5",
      borderBottom: "0.5px solid #edebeb",
      padding: "0",
      minHeight: "30px !important",
      fontSize: "12px",
    },
  },
  table: {
    style: {
      fontSize: "12px",
      height: "100%",
    },
  },
};

export function NewPersonaRecipient(props) {
  const token = localStorage.getItem("Token");
  const [data, setData] = useState([]);
  const [personaId, updatePersonaId] = useState([]);
  const [personaNames, setPersonaNames] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [emailAddress, updateEmailAddress] = useState("");
  const [campusId, updateCampusId] = useState("");
  const [deletePassword, updateDeletePassword] = useState("");
  const [deleteErrorMessage, updateDeleteErrorMessage] = useState("");
  const [deleteErrorCode, updateDeleteErrorCode] = useState("");

  useEffect(() => {
    getUserDetails();
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_KEY}get_persona_list`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      if (res.data.error_code === 200) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Fetch persona list failed:", err);
    }
  }

  async function getUserDetails() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_KEY}admin_get_Primary_user_info`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      if (res.data.error_code === 200) {
        const user = res.data.data[0];
        updateEmailAddress(user.email);
        updateCampusId(user.campus_id);
      }
    } catch (err) {
      console.error("User details fetch failed:", err);
    }
  }

  async function InviteStudent() {
    if (!personaId.length) {
      setInviteMessage("Please select Invitee");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("persona", JSON.stringify(personaId));

      const res = await axios.post(
        `${process.env.REACT_APP_API_KEY}admin_get_user_id_from_persona`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (res.data.error_code === 200) {
        const names = res.data.data.map(item => item.persona_name);
        setPersonaNames(names);
        setInviteMessage("Persona Invited Successfully ✅");

        // ✅ safely call the prop function
        if (typeof props.passPersonaData === "function") {
          props.passPersonaData(personaId, names);
        } else {
          console.warn("props.passPersonaData is not a function");
        }
      } else {
        setInviteMessage("Something went wrong!");
      }
    } catch (err) {
      console.error("Invite failed:", err);
      setInviteMessage("Error occurred while inviting.");
    }
  }

  const columns = [
    {
      name: "",
      width: "10%",
      cell: row => {
        const isSelected = personaId.some(i => i.id === row.persona_id);
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (isSelected) {
                updatePersonaId(prev =>
                  prev.filter(i => i.id !== row.persona_id)
                );
              } else {
                updatePersonaId(prev => [...prev, { id: row.persona_id }]);
              }
            }}
          />
        );
      },
    },
    {
      name: "Persona Name",
      selector: row => row.persona,
      wrap: true,
      width: "60%",
    },
  ];

  const filteredItems = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponent = useMemo(
    () => (
      <div></div>
    ),
    [filterText]
  );

  return (
    <div style={{ height: "100%" }}>
      <div
        className="mt-0"
        style={{
          width: "100%",
          margin: "0",
          padding: "10px",
          borderBottom: "1px solid #edebeb",
        }}
      >
        <div
          className="d-flex flex-row"
          style={{
            borderRadius: "2px",
            height: "35px",
            background: "rgba(228, 233, 243, 0.6)",
            padding: "0px",
            border: "none",
            margin: "0px 10px",
          }}
        >
          <img
            src={require("../images/Search.png")}
            style={{
              width: "21px",
              height: "21px",
              margin: "5px 0px 0px 3px",
              background: "transparent",
            }}
            alt="search"
          />
          <Input
            id="search"
            placeholder="Search by Persona"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{
              background: "transparent",
              height: "35px",
              width: "100%",
              border: "none",
              fontWeight: "600",
              borderRadius: "2PX",
            }}
          />
        </div>
      </div>

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

      <div className="d-flex align-items-center mt-2 px-3">
        <div
          style={{
            color:
              inviteMessage === "Persona Invited Successfully ✅"
                ? "green"
                : "red",
            fontSize: "12px",
          }}
        >
          {inviteMessage}
        </div>
        <input
          type="button"
          className="form-buttons3 ml-auto invite_button"
          value="Invite"
          onClick={InviteStudent}
          style={{
            fontWeight: "500",
            border: "none",
            color: "#ffffff",
            width: "130px",
            borderRadius: "3px",
            marginLeft: "auto",
            backgroundColor: "#000000",
            padding: "7px 20px",
            fontSize: "12PX",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            marginBottom: "20px",
            marginRight: "5px",
          }}
        />
      </div>
    </div>
  );
}
