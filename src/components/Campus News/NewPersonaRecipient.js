import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import DataTable from 'react-data-table-component';
import axios from "axios";
import $ from "jquery";
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

export function NewPersonaRecipient(props) {
  const token = localStorage.getItem('Token');
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deleteErrorCode, setDeleteErrorCode] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [data, setData] = useState([]);
  const [personaId, setPersonaId] = useState([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [campusId, setCampusId] = useState("");
  const [editPersonaId, setEditPersonaId] = useState("");
  const [editPersona, setEditPersona] = useState("");
  const [deletePersonaId, setDeletePersonaId] = useState("");
  const [deletePersona, setDeletePersona] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);

  // Fetch persona list
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
        setData(fetchPersonaResponse.data.data || []);
      } else {
        setData([]);
        toast.error("Failed to load personas");
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setData([]);
      toast.error("Error loading personas");
    }
  }

  // Get user details
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

  // Invite students function
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
        const persona_name = [];
        fetchNewsResponse.data.data.forEach((item) => {
          persona_name.push(item.persona_name);
        });

        if (props.passPersonaData) {
          props.passPersonaData(JSON.stringify(personaId), persona_name);
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

  // Handle persona selection
  const handlePersonaSelection = (row) => {
    const personaObj = {
      id: row.persona_id
    };

    setPersonaId(prev => {
      const isSelected = prev.some(item => item.id === row.persona_id);
      if (isSelected) {
        return prev.filter(item => item.id !== row.persona_id);
      } else {
        return [...prev, personaObj];
      }
    });
  };

  // Modal control functions
  const openEditModal = (persona_id, persona) => {
    setEditPersonaId(persona_id);
    setEditPersona(persona);
    setShowEditModal(true);
  };

  const openDeleteModal = (persona_id, persona) => {
    setDeletePersonaId(persona_id);
    setDeletePersona(persona);
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

  // Edit persona with password
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

  // Update persona form
  async function updateForm() {
    if (!editPersona.trim()) {
      toast.error("Please enter persona name");
      return;
    }

    setIsEditLoading(true);
    const formData = new FormData();
    formData.append("id", editPersonaId);
    formData.append("persona", editPersona);

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

  // Delete persona with password
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

  // Delete persona API call
  async function deleteNewsApi() {
    try {
      const formData = new FormData();
      formData.append("id", deletePersonaId);

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
      console.error("Delete failed", err);
      toast.error("Delete operation failed");
    }
  }

  // Table columns
  const columns = [
    {
      name: '',
      sortable: true,
      wrap: true,
      width: "10%",
      cell: (row) => {
        const isSelected = personaId.some(item => item.id === row.persona_id);
        
        return (
          <div onClick={() => handlePersonaSelection(row)} style={{ cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={isSelected}
              readOnly
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      }
    },
    {
      name: 'Persona Name',
      selector: row => row.persona || "No Name",
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
        );
      }
    }
  ];

  // Filtered items for search
  const filteredItems = useMemo(() => {
    return data.filter(item =>
      item &&
      JSON.stringify(item)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) !== -1
    );
  }, [data, filterText]);

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

  // Initialize component
  useEffect(() => {
    getUserDetails();
    fetchList();
  }, []);

  // Backdrop click handler
  useEffect(() => {
    const handleBackdropClick = (e) => {
      if (e.target.classList.contains('modaloverlay')) {
        closeAllModals();
      }
    };

    document.addEventListener('click', handleBackdropClick);
    return () => {
      document.removeEventListener('click', handleBackdropClick);
    };
  }, []);

  return (
    <div>
      <div className="recipient_class" style={{ marginTop: "0px", height: "100%", padding: "0", position: "relative" }}>
        
        {/* Edit Persona Modal */}
        {showEditModal && (
          <div className="modaloverlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050
          }}>
            <div className="modalContainer bg-white rounded shadow-lg" style={{ width: "500px", maxWidth: "90vw" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h5 className="mb-0">Edit Persona</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeAllModals}
                  ></button>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Enter Persona <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPersona}
                    onChange={(e) => setEditPersona(e.target.value)}
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
              </div>
            </div>
          </div>
        )}

        {/* Edit with Password Modal */}
        {showEditPasswordModal && (
          <div className="modaloverlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1060
          }}>
            <div className="modalContainer bg-white rounded shadow-lg" style={{ width: "500px", maxWidth: "90vw" }}>
              <div className="card-header bg-warning text-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Edit Persona - Admin Verification</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeAllModals}
                  ></button>
                </div>
              </div>

              <div className="card-body">
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
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modaloverlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050
          }}>
            <div className="modalContainer bg-white rounded shadow-lg" style={{ width: "500px", maxWidth: "90vw" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h5 className="mb-0">Delete Persona</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeAllModals}
                  ></button>
                </div>

                <p className="text-danger">
                  Are you sure you want to delete the persona "<strong>{deletePersona}</strong>"? This action cannot be undone.
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
              </div>
            </div>
          </div>
        )}

        {/* Delete with Password Modal */}
        {showDeletePasswordModal && (
          <div className="modaloverlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1060
          }}>
            <div className="modalContainer bg-white rounded shadow-lg" style={{ width: "500px", maxWidth: "90vw" }}>
              <div className="card-header bg-danger text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Delete Persona - Admin Verification</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeAllModals}
                  ></button>
                </div>
              </div>

              <div className="card-body">
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
              </div>
            </div>
          </div>
        )}

        {/* Search and Data Table */}
        <div className="mt-0" style={{ width: "100%", margin: "0", padding: "10px", borderBottom: "1px solid #edebeb" }}>
          <div className="d-flex flex-row" style={{ borderRadius: "2px", height: "35px", background: "rgba(228, 233, 243, 0.6)", padding: "0px", border: "none", margin: "0px 10px" }}>
            <img 
              src={require("../images/Search.png")} 
              alt="Search"
              style={{ width: "21px", height: "21px", margin: "5px 0px 0px 3px", background: "transparent" }} 
            />
            <Input
              id="search"
              type="text"
              placeholder="Search by Persona"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{ background: "transparent", height: "35px", width: "100%", border: "none", fontWeight: "600", borderRadius: "2PX" }}
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
          noDataComponent={
            <div className="text-center py-4">
              No personas found
            </div>
          }
        />

        {/* Invite Button */}
        <div className="d-flex mt-3 px-3">
          <button
            type="button"
            className="btn btn-primary ms-auto"
            onClick={InviteStudent}
            disabled={personaId.length === 0}
            style={{ 
              fontWeight: "500", 
              border: "none", 
              borderRadius: "6px", 
              padding: "7px 20px", 
              fontSize: "12PX", 
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", 
              marginBottom: "20px"
            }}
          >
            Invite ({personaId.length})
          </button>
        </div>
      </div>
    </div>
  );
}