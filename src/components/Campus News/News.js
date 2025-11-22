import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import styled from "styled-components";
import moment from "moment";
import { Recipient } from "./Recipient";
import { NewRecipient } from "./NewRecipient";
import { PersonaRecipient } from "./PersonaRecipient";
import { NewPersonaRecipient } from "./NewPersonaRecipient";
import Alert from "@mui/material/Alert";
import LoadingSpinner from "../LoadingSpinner";
import SummerNote from "../SummerNote/SummerNote";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Input = styled.input.attrs((props) => ({
  type: "text",
  size: props.small ? 5 : undefined,
  autoComplete: "off",
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

// Recipient Selection Modal Component
const RecipientSelectionModal = ({ 
  isOpen, 
  onClose, 
  onRecipientsSelected,
  initialRecipients = [],
  recipientType = "students"
}) => {
  const [activeTab, setActiveTab] = useState("students");
  const [selectedRecipients, setSelectedRecipients] = useState(initialRecipients);

  const handleRecipientsUpdate = (ids, names) => {
    setSelectedRecipients({
      ids: JSON.parse(ids),
      names: names
    });
  };

  const handleConfirm = () => {
    if (selectedRecipients.ids && selectedRecipients.ids.length > 0) {
      onRecipientsSelected(selectedRecipients);
      onClose();
    } else {
      toast.error("Please select at least one recipient");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Recipients</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  Students
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'personas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personas')}
                >
                  Personas
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {activeTab === 'students' && (
                <div className="tab-pane fade show active">
                  <NewRecipient 
                    studentId={selectedRecipients.ids || []}
                    passData={handleRecipientsUpdate}
                  />
                </div>
              )}
              
              {activeTab === 'personas' && (
                <div className="tab-pane fade show active">
                  <NewPersonaRecipient 
                    studentId={selectedRecipients.ids || []}
                    passPersonaData={handleRecipientsUpdate}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              Confirm Selection ({selectedRecipients.ids ? selectedRecipients.ids.length : 0})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Table Component
const NewsTable = ({
  data,
  onViewDescription,
  onEdit,
  onDelete,
  isLoading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('publish_date');
  const [sortDirection, setSortDirection] = useState('desc');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No news found</h5>
        <p className="text-muted">Get started by creating your first news item</p>
        <Link to="/createNews" className="btn btn-primary mt-2">
          Create News
        </Link>
      </div>
    );
  }

  // Sorting
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';

    if (sortField === 'publish_date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Announcement': return '#2D5DD0';
      case 'Circular': return '#C0A200';
      case 'Notice': return '#EB2424';
      case '': return 'black';
      default: return '#15A312';
    }
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th
                style={{ cursor: 'pointer', width: '35%' }}
                onClick={() => handleSort('news_title')}
              >
                Title {getSortIcon('news_title')}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('category')}
              >
                Category {getSortIcon('category')}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('publish_date')}
              >
                Publish Date {getSortIcon('publish_date')}
              </th>
              <th>Recipients</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.news_id}>
                <td>
                  <div
                    className="ten_font_class"
                    onClick={() => onViewDescription(row.news_id)}
                    style={{
                      cursor: "pointer",
                      fontWeight: "600",
                      color: "black",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                    title={row.news_title}
                  >
                    {row.news_title || "No Title"}
                  </div>
                </td>
                <td>
                  <div
                    className="ten_font_class"
                    onClick={() => onViewDescription(row.news_id)}
                    style={{
                      cursor: "pointer",
                      color: getCategoryColor(row.category),
                      fontWeight: '500'
                    }}
                  >
                    {row.category || "-"}
                  </div>
                </td>
                <td>
                  <div
                    className="ten_font_class"
                    onClick={() => onViewDescription(row.news_id)}
                    style={{
                      color: "rgba(0, 0, 0, 0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {row.publish_date ? moment(row.publish_date).format("DD MMM YYYY") : "No date"}
                  </div>
                </td>
                <td>
                  <div
                    className="ten_font_class"
                    onClick={() => onViewDescription(row.news_id)}
                    style={{
                      color: "rgba(0, 0, 0, 0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {row.send_to === 1 ? "All Students" : "Specific Recipient"}
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit(row.news_id)}
                      title="Edit news"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(row.news_id, row.news_title)}
                      title="Delete news"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center">
            <span className="me-2">Show:</span>
            <select
              className="form-select form-select-sm w-auto"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span className="ms-2 text-muted">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} items
            </span>
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <li
                      key={pageNumber}
                      className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                }
                return null;
              })}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

// Custom Modal Component
const Modal = ({ isOpen, onClose, children, title, size = "modal-lg" }) => {
  const modalRef = useRef(null);

  useEffect(() => {
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

export function News() {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");
  
  // Main states
  const [news, updateNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  
  // User and auth states
  const [emailAddress, updateEmailAddress] = useState("");
  const [campusId, updateCampusId] = useState("");
  
  // News form states
  const [newsId, updateNewsId] = useState("");
  const [categoryId, updateCategoryId] = useState("");
  const [categoryName, updateCategoryName] = useState("");
  const [title, updateTitle] = useState("");
  const [description, updateDescription] = useState("");
  const [deliveryType, updateDeliveryType] = useState("");
  const [publishDate, updatePublishDate] = useState("");
  const [expireDate, updateExpireDate] = useState("");
  const [sendTo, updateSendTo] = useState(1); // 1: All Students, 2: Specific
  
  // File states
  const [chooseFile, setChooseFile] = useState("");
  const [chooseFileImage, setChooseFileImage] = useState("");
  const [chooseFileAny, setChooseFileAny] = useState("");
  const [newsFile, updateNewsFile] = useState([]);
  const [image, updateImage] = useState("");
  const [anyFile, updateAnyFile] = useState("");
  
  // Recipient states
  const [selectedRecipients, setSelectedRecipients] = useState({
    ids: [],
    names: []
  });
  
  // Category and deletion states
  const [newsCategorydata, setNewsCategoryData] = useState([]);
  const [getNewsTitle, updateGetNewsTitle] = useState("");
  const [getNewsID, updateGetNewsID] = useState("");
  const [deletePassword, updateDeletePassword] = useState("");
  const [deleteErrorCode, updatedeleteErrorCode] = useState("");
  const [deleteErrorMessage, updatedeleteErrorMessage] = useState("");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteWithPassModal, setShowDeleteWithPassModal] = useState(false);
  const [showEditWithPassModal, setShowEditWithPassModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showPreviewCategory, setShowPreviewCategory] = useState(false);

  // Filter news based on search text
  const filteredItems = news.filter(
    (item) =>
      item &&
      JSON.stringify(item)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) !== -1
  );

  // Prevent numbers in title input
  const handleTitleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key >= 48 && key <= 57) {
      e.preventDefault();
    }
  };

  // User Management
  const getUserDetails = useCallback(async () => {
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

      if (fetchResponse.data.error_code === 200) {
        fetchResponse.data.data.forEach((fetchItem) => {
          updateEmailAddress(fetchItem.email || "");
          updateCampusId(fetchItem.campus_id || "");
        });
      }
    } catch (error) {
      console.error("Failed to get user details:", error);
    }
  }, [token]);

  // Fetch news list
  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("sort_flag", 0);
      const fetchClassResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "get_all_news",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setIsLoading(false);
      if (fetchClassResponse.data.error_code === 200) {
        updateNews(fetchClassResponse.data.data || []);
      } else {
        updateNews([]);
      }
    } catch (err) {
      console.log("Fetch failed", err);
      setIsLoading(false);
      updateNews([]);
      toast.error("Failed to load news");
    }
  }, [token]);

  // Fetch news category list
  const fetchNewsList = useCallback(async () => {
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
  }, [token]);

  // Recipient handlers
  const handleRecipientsSelected = (recipients) => {
    setSelectedRecipients(recipients);
    updateSendTo(2); // Set to specific recipients
    toast.success(`Selected ${recipients.ids.length} recipients`);
  };

  const handleOpenRecipientModal = () => {
    setShowRecipientModal(true);
  };

  // Edit news functionality
  const editNewsRow = useCallback(async (NewsId) => {
    updateNewsId("");
    setShowPreviewCategory(false);
    setShowEditModal(true);

    const formData = new FormData();
    formData.append("news_id", NewsId);

    try {
      const editNewsResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "get_good_news",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (editNewsResponse.data.error_code === 200) {
        editNewsResponse.data.data.forEach((item) => {
          updateNewsId(item.news_id || "");
          updateCategoryId(item.cat_id || "");
          updateCategoryName(item.category || "");
          updateTitle(item.news_title || "");
          updateDescription(item.news_description || "");
          updateDeliveryType(item.delivery_type || "");
          updatePublishDate(item.publish_date || "");
          updateExpireDate(item.expire_date || "");
          updateSendTo(item.send_to || "");

          if (item.send_to === 2 && item.send_to_student) {
            const studentIds = item.send_to_student.map((stdItem) => stdItem.student_id || "").filter(id => id);
            const studentNames = item.send_to_student.map((stdItem) => stdItem.student_name || "").filter(name => name);
            
            setSelectedRecipients({
              ids: studentIds.map(id => ({ id })),
              names: studentNames
            });
          } else {
            setSelectedRecipients({ ids: [], names: [] });
          }
        });
      } else {
        toast.error("Failed to load news data");
      }
    } catch (error) {
      console.error("Error editing news:", error);
      toast.error("Error loading news data");
    }
  }, [token]);

  // View description function
  const viewDescription = useCallback((new_news_id) => {
    navigate("/newspreview", { state: { new_news_id } });
  }, [navigate]);

  // Delete news functions
  const deleteNews = useCallback((news_id, news_title) => {
    updateGetNewsTitle(news_title || "this news");
    updateGetNewsID(news_id);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteNewsModal = useCallback(() => {
    setShowDeleteModal(false);
    setShowDeleteWithPassModal(false);
    setShowEditWithPassModal(false);
    updateDeletePassword("");
  }, []);

  const deletePopupFunc = useCallback(() => {
    setShowDeleteWithPassModal(true);
    setShowDeleteModal(false);
  }, []);

  // File upload handlers
  const uploadingFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateNewsFile(file);
      setChooseFile(file.name);
    }
  };

  const uploadingFileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateImage(file);
      setChooseFileImage(file.name);
    }
  };

  const uploadingFileAny = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateAnyFile(file);
      setChooseFileAny(file.name);
    }
  };

  // Clear file functions
  const clearFile = () => {
    updateNewsFile([]);
    setChooseFile("");
  };

  const clearImage = () => {
    updateImage("");
    setChooseFileImage("");
  };

  const clearAnyFile = () => {
    updateAnyFile("");
    setChooseFileAny("");
  };

  // Edit with password
  const editWithPassword = useCallback(async () => {
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
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      updatedeleteErrorCode(deleteNewsResponse.data.error_code);
      updatedeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        await updateForm();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }, [deletePassword, emailAddress, campusId, token]);

  // Update form
  const updateForm = useCallback(async () => {
    if (!newsId) {
      toast.error("No news ID found");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter news title");
      return;
    }

    setIsEditLoading(true);
    const formData = new FormData();

    formData.append("news_id", newsId);
    formData.append("category", categoryId);
    formData.append("title", title);
    formData.append("news_content", description);
    formData.append("delivery_type", deliveryType);
    formData.append("publish_date", publishDate);
    formData.append("expire_date", expireDate);
    formData.append("send_to", sendTo);
    formData.append("file", newsFile);
    formData.append("image", image);
    
    // Add recipients if specific selection
    if (sendTo === 2 && selectedRecipients.ids.length > 0) {
      formData.append("users", JSON.stringify(selectedRecipients.ids));
    }

    try {
      const eventResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_edit_news",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      setIsEditLoading(false);
      if (eventResponse.data.error_code === 200) {
        setShowEditWithPassModal(false);
        updateDeletePassword("");
        setShowEditModal(false);
        fetchList();
        toast.success("News updated successfully!");
      } else {
        toast.error(eventResponse.data.message);
      }
    } catch (error) {
      console.error("Error updating news:", error);
      setIsEditLoading(false);
      toast.error("Error updating news");
    }
  }, [newsId, categoryId, title, description, deliveryType, publishDate, expireDate, sendTo, newsFile, image, selectedRecipients, token, fetchList]);

  // Delete with password
  const deleteWithPassword = useCallback(async () => {
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
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      updatedeleteErrorCode(deleteNewsResponse.data.error_code);
      updatedeleteErrorMessage(deleteNewsResponse.data.message);

      if (deleteNewsResponse.data.error_code === 200) {
        await deleteNewsApi();
      } else {
        toast.error(deleteNewsResponse.data.message);
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      toast.error("Password verification failed");
    }
  }, [deletePassword, emailAddress, campusId, token]);

  // Delete news API
  const deleteNewsApi = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("news_id", getNewsID);

      const deleteResponse = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_delete_news",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (deleteResponse.data.error_code === 200) {
        setShowDeleteWithPassModal(false);
        updateDeletePassword("");
        fetchList();
        toast.success("News deleted successfully!");
      } else {
        toast.error(deleteResponse.data.message);
      }
    } catch (err) {
      console.log("Delete failed", err);
      toast.error("Delete operation failed");
    }
  }, [getNewsID, token, fetchList]);

  // Modal control functions
  const close_edit_modal = useCallback(() => {
    setShowEditModal(false);
    // Reset form state
    updateNewsId("");
    updateCategoryId("");
    updateCategoryName("");
    updateTitle("");
    updateDescription("");
    updateDeliveryType("");
    updatePublishDate("");
    updateExpireDate("");
    updateSendTo(1);
    setSelectedRecipients({ ids: [], names: [] });
    setChooseFile("");
    setChooseFileImage("");
    setChooseFileAny("");
    updateNewsFile([]);
    updateImage("");
    updateAnyFile("");
  }, []);

  const update_edited_News = useCallback(() => {
    if (!title.trim()) {
      toast.error("Please enter news title");
      return;
    }
    setShowEditWithPassModal(true);
  }, [title]);

  const handleButton = useCallback(() => {
    setShowEditModal(false);
    setShowDeleteWithPassModal(false);
    fetchList();
  }, [fetchList]);

  const handelSummenrnote = useCallback((content) => {
    updateDescription(content);
  }, []);

  // Fixed Select Component
  const FixedSelect = ({ value, onChange, options, placeholder }) => {
    return (
      <select
        className="form-select-sm edit_inputs_class"
        value={value || ""}
        onChange={onChange}
        style={{ fontWeight: 'bold', fontSize: '14px', padding: "5px", width: "100%" }}
      >
        <option value="">{placeholder || "Select an option"}</option>
        {options.map((option, index) => (
          <option key={index} value={option.cat_id}>
            {option.category_name}
          </option>
        ))}
      </select>
    );
  };

  // Fixed Read-only Input Component for file names
  const ReadOnlyInput = ({ value, placeholder }) => {
    return (
      <input
        type="text"
        className="form-control"
        value={value}
        placeholder={placeholder}
        readOnly
        style={{ fontSize: "12px", background: "#f8f9fa" }}
      />
    );
  };

  // Recipient type change handler
  const handleRecipientTypeChange = (e) => {
    const newSendTo = parseInt(e.target.value);
    updateSendTo(newSendTo);
    
    if (newSendTo === 1) {
      // Clear selected recipients when switching to "All Students"
      setSelectedRecipients({ ids: [], names: [] });
    }
  };

  useEffect(() => {
    fetchList();
    getUserDetails();
    fetchNewsList();

    // Add event listener for title input
    const titleInput = document.getElementById('news_title');
    if (titleInput) {
      titleInput.addEventListener('keypress', handleTitleKeyPress);
    }

    return () => {
      if (titleInput) {
        titleInput.removeEventListener('keypress', handleTitleKeyPress);
      }
    };
  }, [fetchList, getUserDetails, fetchNewsList]);

  return (
    <div className="content-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Search and Create Section */}
      <div className="row border_class2 search_box_padding">
        <div className="col-md-3 d-flex flex-row ">
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
              placeholder="Search by title, category..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="col-md-9 d-flex flex-row" style={{ justifyContent: "end" }}>
          <div style={{ marginTop: "0px", padding: "0" }}>
            <Link to="/createNews">
              <button
                type="button"
                className="d-flex create_button btn btn-primary"
              >
                <div className="create_button_inner">Create News</div>
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

      {/* Edit News Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={close_edit_modal}
        title="Edit Campus News"
        size="modal-xl"
      >
        <div className="preview_form">
          <div className="mb-4">
            <div className="edit_top_label mb-3">
              <p className="fw-bold text-primary">Category & Title</p>
            </div>
            <div className="edit_border_class p-3 rounded">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-medium">Category:</label>
                  <FixedSelect
                    value={categoryId}
                    onChange={(e) => updateCategoryId(e.target.value)}
                    options={newsCategorydata}
                    placeholder={categoryName || "Select Category"}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-medium">Title:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Enter news title"
                    autoComplete="true"
                    id="news_title"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Selection Section */}
            <div className="mt-4">
              <div className="edit_top_label mb-3">
                <p className="fw-bold text-primary">Recipients</p>
              </div>
              <div className="edit_border_class p-3 rounded">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-medium">Send To:</label>
                    <select
                      className="form-select"
                      value={sendTo}
                      onChange={handleRecipientTypeChange}
                    >
                      <option value={1}>All Students</option>
                      <option value={2}>Specific Recipients</option>
                    </select>
                  </div>

                  {sendTo === 2 && (
                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <label className="form-label fw-medium">Selected Recipients:</label>
                          <div className="text-muted">
                            {selectedRecipients.names.length > 0 
                              ? `${selectedRecipients.names.length} recipients selected` 
                              : "No recipients selected"}
                          </div>
                          {selectedRecipients.names.length > 0 && (
                            <div className="mt-2">
                              <small className="text-muted">
                                {selectedRecipients.names.slice(0, 3).join(", ")}
                                {selectedRecipients.names.length > 3 && ` and ${selectedRecipients.names.length - 3} more...`}
                              </small>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleOpenRecipientModal}
                        >
                          {selectedRecipients.ids.length > 0 ? 'Change Selection' : 'Select Recipients'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="edit_top_label mb-3">
                <p className="fw-bold text-primary">News Description</p>
              </div>
              <div className="border rounded">
                <SummerNote
                  _onChange={handelSummenrnote}
                  value={description}
                  placeholder="Enter your news description here..."
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mt-4">
              <div className="edit_top_label mb-3">
                <p className="fw-bold text-primary">Attachments</p>
              </div>
              <div className="border rounded p-3">
                {/* Document Upload */}
                <div className="mb-3">
                  <label htmlFor="news-document" className="btn btn-outline-primary btn-sm me-2">
                    Add Document
                  </label>
                  <input
                    type="file"
                    id="news-document"
                    accept=".xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                    onChange={uploadingFile}
                    style={{ display: 'none' }}
                  />
                  {chooseFile && (
                    <div className="d-flex align-items-center mt-2">
                      <ReadOnlyInput value={chooseFile} placeholder="No document selected" />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={clearFile}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label htmlFor="news-image" className="btn btn-outline-primary btn-sm me-2">
                    Add Image
                  </label>
                  <input
                    type="file"
                    id="news-image"
                    accept="image/png, image/gif, image/jpeg, image/jpg"
                    onChange={uploadingFileImage}
                    style={{ display: 'none' }}
                  />
                  {chooseFileImage && (
                    <div className="d-flex align-items-center mt-2">
                      <ReadOnlyInput value={chooseFileImage} placeholder="No image selected" />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={clearImage}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Any File Upload */}
                <div className="mb-3">
                  <label htmlFor="news-any-file" className="btn btn-outline-primary btn-sm me-2">
                    Add File
                  </label>
                  <input
                    type="file"
                    id="news-any-file"
                    onChange={uploadingFileAny}
                    style={{ display: 'none' }}
                  />
                  {chooseFileAny && (
                    <div className="d-flex align-items-center mt-2">
                      <ReadOnlyInput value={chooseFileAny} placeholder="No file selected" />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={clearAnyFile}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
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
              onClick={update_edited_News}
              disabled={isEditLoading}
            >
              {isEditLoading ? "Updating..." : "Update News"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Recipient Selection Modal */}
      <RecipientSelectionModal
        isOpen={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        onRecipientsSelected={handleRecipientsSelected}
        initialRecipients={selectedRecipients}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={closeDeleteNewsModal}
        title="Delete News"
      >
        <p>Are you sure you want to delete the news "{getNewsTitle}"? This action cannot be undone.</p>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={deletePopupFunc}>
            Delete
          </button>
        </div>
      </Modal>

      {/* Delete with Password Modal */}
      <Modal 
        isOpen={showDeleteWithPassModal} 
        onClose={closeDeleteNewsModal}
        title="Confirm Deletion"
      >
        <div className="alert alert-warning">
          <strong>Warning:</strong> You are about to delete a news item. This operation cannot be undone.
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
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={deleteWithPassword}>
            Confirm Delete
          </button>
        </div>
      </Modal>

      {/* Edit with Password Modal */}
      <Modal 
        isOpen={showEditWithPassModal} 
        onClose={closeDeleteNewsModal}
        title="Confirm Edit"
      >
        <div className="alert alert-warning">
          <strong>Warning:</strong> You are editing a news item. Please confirm your identity.
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
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={closeDeleteNewsModal}>
            Cancel
          </button>
          <button type="button" className="btn btn-warning" onClick={editWithPassword}>
            Confirm Edit
          </button>
        </div>
      </Modal>

      {/* Main Content - Custom News Table */}
      <div className="container-fluid py-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Campus News</h5>
          </div>
          <div className="card-body">
            <NewsTable
              data={filteredItems}
              onViewDescription={viewDescription}
              onEdit={editNewsRow}
              onDelete={deleteNews}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}