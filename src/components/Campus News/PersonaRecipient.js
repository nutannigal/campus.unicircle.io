import React, { useState, useEffect, useMemo } from "react";
import DataTable from 'react-data-table-component';
import axios from "axios";
import styled from "styled-components";
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
      borderBottom: "0.5px solid #C4C4C4",
      marginTop: "0PX"
    },
  },
  rows: {
    style: {
      background: "#f5f5f5",
      borderBottom: "0.5px solid #f5f5f5",
      padding: "0"
    }
  },
  table: {
    style: {
      height: "220px",
    },
  },
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title, size = "modal-md" }) => {
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27) onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`modal-dialog ${size} modal-dialog-centered`} ref={modalRef}>
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export function PersonaRecipient({ studentId, passPersonaData }) {
  const token = localStorage.getItem('Token');
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deleteErrorCode, setDeleteErrorCode] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [data, setData] = useState([]);
  const [personaId, setPersonaId] = useState([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [campusId, setCampusId] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [currentPersona, setCurrentPersona] = useState({ id: "", name: "" });

  const format_array = (array) => {
    let mapping = array.map(item => {
      let obj = {
        id: item
      }
      return obj
    })
    setPersonaId(mapping)
  }

  useEffect(() => {
    format_array(studentId)
  }, [])

  async function fetchList() {
    try {
      const fetchPersonaResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "get_persona_list",
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      if (fetchPersonaResponse.data.error_code === 200) {
        setData(fetchPersonaResponse.data.data);
      } else {
        toast.error("Failed to load personas");
      }
    } catch (err) {
      console.log("Log in Fail", err);
      toast.error("Error loading personas");
    }
  }

  async function getUserDetails() {
    try {
      const fetchResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "admin_get_Primary_user_info",
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      if (fetchResponse.data.error_code === 200) {
        fetchResponse.data.data.forEach((fetchItem) => {
          setEmailAddress(fetchItem.email || "");
          setCampusId(fetchItem.campus_id || "");
        });
      }
    } catch (error) {
      console.error("Failed to get user details:", error);
    }
  }

  async function InviteStudent() {
    if (personaId.length === 0) {
      toast.error("Please select at least one persona");
      return;
    }

    const formData = new FormData();
    formData.append("persona", JSON.stringify(personaId));

    try {
      const fetchNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_user_id_from_persona",
        formData,
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      if (fetchNewsResponse.data.error_code === 200) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        const persona_name = [];
        fetchNewsResponse.data.data.forEach((item) => {
          persona_name.push(item.persona_name);
        });
        
        if (passPersonaData) {
          passPersonaData(JSON.stringify(personaId), persona_name);
        }
        
        toast.success("Persona invited successfully!");
      } else {
        toast.error("Failed to invite persona");
      }
    } catch (error) {
      console.error("Error inviting persona:", error);
      toast.error("Error inviting persona");
    }
  }

  // Edit functions
  const openEditModal = (persona_id, persona) => {
    setCurrentPersona({ id: persona_id, name: persona });
    setShowEditModal(true);
  };

  const openDeleteModal = (persona_id, persona) => {
    setCurrentPersona({ id: persona_id, name: persona });
    setShowDeleteModal(true);
  };

  const closeAllModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowEditPasswordModal(false);
    setShowDeletePasswordModal(false);
    setDeletePassword("");
    setDeleteErrorCode("");
    setDeleteErrorMessage("");
  };

  async function editWithPassword() {
    if (!deletePassword) {
      toast.error("Please enter admin password");
      return;
    }

    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campusId);

    try {
      const deleteNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_check_password",
        formData,
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      setDeleteErrorCode(deleteNewsResponse.data.error_code);
      setDeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        await updateForm();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }

  async function updateForm() {
    if (!currentPersona.name.trim()) {
      toast.error("Please enter persona name");
      return;
    }

    setIsEditLoading(true);
    const formData = new FormData();
    formData.append("id", currentPersona.id);
    formData.append("persona", currentPersona.name);

    try {
      const eventResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_edit_persona",
        formData,
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      setIsEditLoading(false);
      if (eventResponse.data.error_code === 200) {
        closeAllModals();
        fetchList();
        toast.success("Persona updated successfully!");
      } else {
        toast.error(eventResponse.data.message);
      }
    } catch (error) {
      console.error("Error updating persona:", error);
      setIsEditLoading(false);
      toast.error("Error updating persona");
    }
  }

  async function deleteWithPassword() {
    if (!deletePassword) {
      toast.error("Please enter admin password");
      return;
    }

    const formData = new FormData();
    formData.append("username", emailAddress);
    formData.append("password", deletePassword);
    formData.append("campus_id", campusId);

    try {
      const deleteNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_check_password",
        formData,
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      setDeleteErrorCode(deleteNewsResponse.data.error_code);
      setDeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        await deleteNewsApi();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }

  async function deleteNewsApi() {
    try {
      const formData = new FormData();
      formData.append("id", currentPersona.id);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_persona",
        formData,
        {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": token,
          }
        }
      );

      if (deleteResponse.data.error_code === 200) {
        closeAllModals();
        fetchList();
        toast.success("Persona deleted successfully!");
      } else {
        toast.error(deleteResponse.data.message);
      }
    } catch (err) {
      console.log("Delete failed", err);
      toast.error("Delete operation failed");
    }
  }

  const columns = [
    {
      name: '',
      sortable: true,
      wrap: true,
      width: "10%",
      cell: (row) => {
        const isSelected = personaId.some(i => i.id === row.persona_id);
        
        return (
          <div onClick={() => {
            if (isSelected) {
              setPersonaId((prev) => prev.filter((i) => i.id !== row.persona_id));
            } else {
              let obj = {
                id: row.persona_id
              }
              setPersonaId(prev => [...prev, obj])
            }
          }} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              value={row.persona_id}
              checked={isSelected}
              readOnly
              style={{ cursor: "pointer" }}
            />
          </div>
        )
      }
    },
    {
      name: 'Persona Name',
      selector: 'persona',
      wrap: true,
      width: "60%",
    },
    {
      name: '',
      wrap: true,
      width: "auto",
      cell: (row) => {
        return (
          <div className="d-flex">
            <button
              className="btn btn-link p-0 border-0 me-2"
              onClick={() => openEditModal(row.persona_id, row.persona)}
              style={{ backgroundColor: "transparent" }}
              title="Edit persona"
            >
              <img src={require("../images/Pencil.png")} alt="edit" style={{ width: "15px", height: "15px" }} />
            </button>

            <button
              className="btn btn-link p-0 border-0"
              onClick={() => openDeleteModal(row.persona_id, row.persona)}
              style={{ backgroundColor: "transparent" }}
              title="Delete persona"
            >
              <img style={{ width: "15px", height: "15px" }} src={require('../images/delete.png')} alt="delete" />
            </button>
          </div>
        )
      }
    }
  ];

  const [filterText, setFilterText] = useState("");

  const filteredItems = data.filter(
    (item) =>
      item &&
      JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1
  );

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="mt-2" style={{ width: "100%", margin: "0", paddingBottom: "10px", borderBottom: "0.5px solid #C4C4C4" }}>
        <div className="d-flex flex-row" style={{ borderRadius: "10px", height: "98%", background: "rgba(228, 233, 243, 0.6)", padding: "0px", border: "1px solid #E5E5E5", margin: "0px 10px" }}>
          <img src={require("../images/Search.png")} style={{ width: "21px", height: "21px", margin: "5px 0px 0px 3px" }} />
          <Input
            id="search"
            type="text"
            placeholder="Search by Persona"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{ background: "rgba(228, 233, 243, 0.6)", height: "35px", width: "100%", border: "none", fontWeight: "600", borderRadius: "10PX" }}
          />
        </div>
      </div>
    );
  }, [filterText]);

  useEffect(() => {
    getUserDetails();
    fetchList();
  }, []);

  return (
    <div>
      <div className="recipient_class" style={{ marginTop: "0px", height: "100%", padding: "0" }}>

        {/* Edit Persona Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={closeAllModals}
          title="Edit Persona"
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Enter Persona <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={currentPersona.name}
              onChange={(e) => setCurrentPersona(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter persona name"
              autoComplete="off"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeAllModals}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowEditModal(false);
                setShowEditPasswordModal(true);
              }}
            >
              Update
            </button>
          </div>
        </Modal>

        {/* Edit with Password Modal */}
        <Modal
          isOpen={showEditPasswordModal}
          onClose={closeAllModals}
          title="Edit Persona - Admin Verification"
        >
          <div className="alert alert-warning">
            <strong>Warning:</strong> You are editing a persona. This operation requires admin verification.
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Admin Password:</label>
            <input
              type="password"
              className="form-control"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your admin password"
            />
          </div>

          {deleteErrorCode && deleteErrorCode !== 200 && (
            <div className="alert alert-danger">{deleteErrorMessage}</div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeAllModals}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={editWithPassword}
              disabled={isEditLoading}
            >
              {isEditLoading ? "Updating..." : "Confirm Edit"}
            </button>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={closeAllModals}
          title="Delete Persona"
        >
          <p className="text-danger">
            Are you sure you want to delete the persona "<strong>{currentPersona.name}</strong>"? This action cannot be undone.
          </p>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeAllModals}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setShowDeleteModal(false);
                setShowDeletePasswordModal(true);
              }}
            >
              Delete
            </button>
          </div>
        </Modal>

        {/* Delete with Password Modal */}
        <Modal
          isOpen={showDeletePasswordModal}
          onClose={closeAllModals}
          title="Delete Persona - Admin Verification"
        >
          <div className="alert alert-danger">
            <strong>Warning:</strong> You are about to delete a persona. This operation cannot be undone.
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Admin Password:</label>
            <input
              type="password"
              className="form-control"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your admin password"
            />
          </div>

          {deleteErrorCode && deleteErrorCode !== 200 && (
            <div className="alert alert-danger">{deleteErrorMessage}</div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeAllModals}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={deleteWithPassword}
            >
              Confirm Delete
            </button>
          </div>
        </Modal>

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

        <div className="d-flex align-items-center mt-3">
          <div style={{ flex: 1 }}>
            <div style={{ color: "black", marginLeft: "10px", fontSize: "12px", display: showSuccess ? "block" : "none" }} className="invitation">
              Persona Invited Successfully
            </div>
          </div>
          
          <button
            className="btn btn-primary me-3 mb-2"
            onClick={InviteStudent}
            disabled={personaId.length === 0}
            style={{
              fontWeight: "500",
              border: "none",
              color: "white",
              borderRadius: "6px",
              backgroundColor: "#1F3977",
              padding: "10px 40px",
              fontSize: "12PX",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          >
            Invite ({personaId.length})
          </button>
        </div>
      </div>
    </div>
  );
}