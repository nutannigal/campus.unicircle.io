import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./StudentTable.css";
import DataTable from "react-data-table-component";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import FileSaver from "file-saver";
import toast, { Toaster } from "react-hot-toast";
import styled from "styled-components";

// Custom hooks
const useApi = () => {
  const token = localStorage.getItem("Token");
  
  const apiCall = useCallback(async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        url: `${process.env.REACT_APP_API_KEY}${endpoint}`,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
        ...(data && { data })
      };
      
      const response = await axios(config);
      return { 
        success: response.data.error_code === 200, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { success: false, message: 'Network error occurred' };
    }
  }, [token]);

  return apiCall;
};

const useStudents = () => {
  const apiCall = useApi();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall("get_students_list");
      if (result.success) {
        setStudents(result.data || []);
      } else {
        setError(result.message || "Failed to load students");
        setStudents([]);
      }
    } catch (err) {
      setError("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const deleteStudent = useCallback(async (studentId) => {
    const formData = new FormData();
    formData.append("student_id", studentId);
    
    const result = await apiCall("admin_delete_student", "POST", formData);
    if (result.success) {
      toast.success("Student deleted successfully");
      fetchStudents();
      return true;
    } else {
      toast.error(result.message || "Failed to delete student");
      return false;
    }
  }, [apiCall, fetchStudents]);

  const updateStudent = useCallback(async (studentData) => {
    const formData = new FormData();
    Object.keys(studentData).forEach(key => {
      formData.append(key, studentData[key]);
    });

    const result = await apiCall("edit_student", "POST", formData);
    if (result.success) {
      toast.success("Student updated successfully");
      fetchStudents();
      return true;
    } else {
      toast.error(result.message || "Failed to update student");
      return false;
    }
  }, [apiCall, fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    deleteStudent,
    updateStudent
  };
};

const useDropdownData = () => {
  const apiCall = useApi();
  const [dropdownData, setDropdownData] = useState({
    classes: [],
    departments: [],
    personas: [],
    courses: []
  });
  const [loading, setLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        { key: 'classes', url: 'get_classes_list' },
        { key: 'departments', url: 'get_department_list' },
        { key: 'personas', url: 'get_persona_list' },
        { key: 'courses', url: 'campus_get_course' }
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => apiCall(endpoint.url))
      );

      const newData = {};
      results.forEach((result, index) => {
        const endpoint = endpoints[index];
        if (result.status === 'fulfilled' && result.value.success) {
          newData[endpoint.key] = result.value.data || [];
        } else {
          newData[endpoint.key] = [];
        }
      });

      setDropdownData(newData);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { dropdownData, loading, refetch: fetchAllData };
};

// Styled Components
const SearchInput = styled.input.attrs({ type: "text" })`
  height: 32px;
  width: 200px;
  border-radius: 3px;
  border: 1px solid #e5e5e5;
  padding: 0 32px 0 16px;
  font-size: 12px;
  &:focus {
    outline: none;
    border-color: #1F3977;
  }
`;

const ActionButton = styled.button`
  border: none;
  background: transparent;
  color: #1F3977;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(31, 57, 119, 0.1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

// Memoized Components
const StudentActions = React.memo(({ row, onEdit, onDelete, onView, onEmail }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <ActionButton onClick={() => setShowMenu(!showMenu)}>
        Actions ▼
      </ActionButton>
      
      {showMenu && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          background: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          zIndex: 100,
          minWidth: "120px"
        }}>
          <button
            onClick={() => { onView(row.student_id); setShowMenu(false); }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "8px 12px",
              fontSize: "11px",
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            👁️ View
          </button>
          <button
            onClick={() => { onEdit(row); setShowMenu(false); }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "8px 12px",
              fontSize: "11px",
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => { onEmail(row); setShowMenu(false); }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "8px 12px",
              fontSize: "11px",
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            📧 Email
          </button>
          <button
            onClick={() => { onDelete(row); setShowMenu(false); }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: "8px 12px",
              fontSize: "11px",
              textAlign: "left",
              cursor: "pointer",
              color: "#dc3545"
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
});

const EditStudentModal = React.memo(({ 
  student, 
  dropdownData, 
  onClose, 
  onSave,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    persona: "",
    class_id: ""
  });

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        gender: student.gender || "",
        persona: student.persona_id || "",
        class_id: student.class_id || ""
      });
    }
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      student_id: student.student_id,
      ...formData
    });
  };

  if (!student) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ color: "#1F3977", margin: 0 }}>Edit Student</h5>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>First Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                style={{ fontSize: "12px" }}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Last Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                style={{ fontSize: "12px" }}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                style={{ fontSize: "12px" }}
              >
                <option value="">Select Gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Persona</label>
              <select
                className="form-select"
                value={formData.persona}
                onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                style={{ fontSize: "12px" }}
              >
                <option value="">Select Persona</option>
                {dropdownData.personas.map(persona => (
                  <option key={persona.persona_id} value={persona.persona}>
                    {persona.persona}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Class</label>
            <select
              className="form-select"
              value={formData.class_id}
              onChange={(e) => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
              style={{ fontSize: "12px" }}
            >
              <option value="">Select Class</option>
              {dropdownData.classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Student"}
            </button>
          </div>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
});

const SendEmailModal = React.memo(({ student, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    subject: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSend({
      user_id: student.student_id,
      email: student.email,
      ...formData
    });
    setLoading(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ color: "#1F3977", margin: 0 }}>Send Email</h5>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Email</label>
            <input
              type="email"
              className="form-control"
              value={student.email}
              readOnly
              style={{ fontSize: "12px", background: "#f8f9fa" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Subject</label>
            <input
              type="text"
              className="form-control"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              style={{ fontSize: "12px" }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: "12px", fontWeight: "500" }}>Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{ fontSize: "12px" }}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
});

const DeleteConfirmationModal = React.memo(({ student, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(student.student_id);
    setLoading(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="text-center">
          <div style={{ fontSize: "48px", color: "#dc3545", marginBottom: "16px" }}>
            ⚠️
          </div>
          <h5 style={{ color: "#1F3977", marginBottom: "8px" }}>Delete Student</h5>
          <p style={{ fontSize: "14px", color: "#6c757d" }}>
            Are you sure you want to delete <strong>{student.first_name} {student.last_name}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="d-flex justify-content-center gap-2 mt-4">
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-danger btn-sm"
              style={{ fontSize: "12px" }}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Student"}
            </button>
          </div>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
});

const StudentTable = React.memo(({ students, loading, onAction }) => {
  const customStyles = {
    rows: {
      style: {
        background: "rgba(228, 233, 243, 0.6)",
        marginTop: "3px",
        border: "none",
        fontSize: "11px",
      },
    },
    headCells: {
      style: {
        color: "#1F3977",
        fontWeight: "600",
        fontSize: "10px",
        background: "white",
      },
    },
    table: {
      style: {
        padding: "0px 10px",
        marginTop: "0px",
      },
    },
  };

  const columns = useMemo(() => [
    {
      name: "Student Name",
      selector: (row) => `${row.first_name} ${row.last_name}`,
      wrap: true,
      cell: (row) => (
        <div
          style={{ 
            fontWeight: "700", 
            cursor: "pointer",
            fontSize: "11px",
            color: "#1F3977"
          }}
          onClick={() => onAction('view', row)}
        >
          {row.first_name} {row.last_name}
        </div>
      ),
      width: "200px"
    },
    {
      name: "Student ID",
      selector: (row) => row.student_id,
      sortable: true,
      wrap: true,
      cell: (row) => <div style={{ fontSize: "11px" }}>{row.student_id}</div>,
      width: "120px"
    },
    {
      name: "Persona",
      selector: (row) => row.persona,
      wrap: true,
      cell: (row) => <div style={{ fontSize: "11px" }}>{row.persona}</div>,
      width: "120px"
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
      cell: (row) => (
        <div style={{ fontSize: "11px", width: "200px" }} className="text-truncate">
          {row.email}
        </div>
      ),
      width: "200px"
    },
    {
      name: "Class",
      selector: (row) => row.class,
      wrap: true,
      cell: (row) => (
        <div style={{ fontSize: "11px", width: "150px" }} className="text-truncate">
          {row.class}
        </div>
      ),
      width: "150px"
    },
    {
      name: "Actions",
      width: "100px",
      cell: (row) => (
        <StudentActions
          row={row}
          onEdit={() => onAction('edit', row)}
          onDelete={() => onAction('delete', row)}
          onView={() => onAction('view', row)}
          onEmail={() => onAction('email', row)}
        />
      ),
    }
  ], [onAction]);

  const [filterText, setFilterText] = useState("");

  const filteredStudents = useMemo(() => {
    if (!filterText) return students;
    
    const searchText = filterText.toLowerCase();
    return students.filter(student =>
      student.first_name?.toLowerCase().includes(searchText) ||
      student.last_name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.student_id?.toLowerCase().includes(searchText)
    );
  }, [students, filterText]);

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <SearchInput
              placeholder="Search students..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <i className="fa fa-search" style={{ 
              marginLeft: "-25px", 
              color: "#6c757d",
              fontSize: "14px"
            }} />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        striped
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        highlightOnHover
        customStyles={customStyles}
        progressPending={loading}
        noDataComponent={
          <div className="text-center py-5">
            <div style={{ fontSize: "48px", color: "#e9ecef", marginBottom: "16px" }}>
              👨‍🎓
            </div>
            <h5 style={{ color: "#6c757d" }}>
              {loading ? "Loading students..." : "No students found"}
            </h5>
            {!loading && (
              <p style={{ color: "#adb5bd", fontSize: "14px" }}>
                {filterText ? "Try adjusting your search" : "Add students to get started"}
              </p>
            )}
          </div>
        }
      />
    </div>
  );
});

// Main Component
export function StudentHeader() {
  const navigate = useNavigate();
  const apiCall = useApi();
  
  const { students, loading, error, fetchStudents, deleteStudent, updateStudent } = useStudents();
  const { dropdownData } = useDropdownData();
  
  const [modals, setModals] = useState({
    edit: false,
    delete: false,
    email: false
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle actions
  const handleAction = useCallback((action, student) => {
    setSelectedStudent(student);
    
    switch (action) {
      case 'edit':
        setModals(prev => ({ ...prev, edit: true }));
        break;
      case 'delete':
        setModals(prev => ({ ...prev, delete: true }));
        break;
      case 'email':
        setModals(prev => ({ ...prev, email: true }));
        break;
      case 'view':
        navigate("/viewStudent", { state: { student_id: student.student_id } });
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleEditSave = useCallback(async (studentData) => {
    setActionLoading(true);
    await updateStudent(studentData);
    setActionLoading(false);
    setModals(prev => ({ ...prev, edit: false }));
  }, [updateStudent]);

  const handleDeleteConfirm = useCallback(async (studentId) => {
    setActionLoading(true);
    await deleteStudent(studentId);
    setActionLoading(false);
    setModals(prev => ({ ...prev, delete: false }));
  }, [deleteStudent]);

  const handleSendEmail = useCallback(async (emailData) => {
    setActionLoading(true);
    const result = await apiCall("admin_send_imp_message", "POST", emailData);
    if (result.success) {
      toast.success("Email sent successfully");
      setModals(prev => ({ ...prev, email: false }));
    } else {
      toast.error(result.message || "Failed to send email");
    }
    setActionLoading(false);
  }, [apiCall]);

  const closeModals = useCallback(() => {
    setModals({ edit: false, delete: false, email: false });
    setSelectedStudent(null);
  }, []);

  // Download template
  const downloadTemplate = useCallback(() => {
    toast.success("Downloading template...");
    // Add actual download logic here
  }, []);

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchStudents}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style={{ color: "#1F3977", margin: 0 }}>Students Management</h4>
          <p style={{ color: "#6c757d", fontSize: "14px", margin: "4px 0 0 0" }}>
            Manage all students in your institution
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button
            onClick={downloadTemplate}
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
            style={{ fontSize: "12px" }}
          >
            <i className="fa fa-download me-2"></i>
            Download Template
          </button>
          
          <Link to="/addStudent" className="btn btn-primary btn-sm d-flex align-items-center">
            <i className="fa fa-plus me-2"></i>
            Add Student
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <StudentTable
        students={students}
        loading={loading}
        onAction={handleAction}
      />

      {/* Modals */}
      {modals.edit && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          dropdownData={dropdownData}
          onClose={closeModals}
          onSave={handleEditSave}
          loading={actionLoading}
        />
      )}

      {modals.delete && selectedStudent && (
        <DeleteConfirmationModal
          student={selectedStudent}
          onClose={closeModals}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {modals.email && selectedStudent && (
        <SendEmailModal
          student={selectedStudent}
          onClose={closeModals}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}