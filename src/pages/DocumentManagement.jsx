import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, getEmployee } from "../services/dataService";
import { addNotification } from "../services/notificationService";

function DocumentManagement() {
  const currentUser = getCurrentUser() || {};
  const [role] = useState(() => currentUser.role?.toLowerCase() || "employee");
  const currentEmpId = currentUser.employeeId || "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals / Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  // Form fields
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const perPage = 5;

  const API_BASE_URL = "https://7bbdlyp1wj.execute-api.ap-south-1.amazonaws.com";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getVal = (field) => {
    if (field && typeof field === 'object' && field.S !== undefined) return field.S;
    return field || "";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getEmbedUrl = (url, fileName) => {
    if (!url) return "";
    const ext = fileName ? fileName.split('.').pop().toLowerCase() : "";
    const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    
    if (imageExts.includes(ext)) {
      return url;
    }
    
    if (officeExts.includes(ext)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const fetchDocuments = async () => {
    if (!currentEmpId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/document/employee/${currentEmpId}`);
      if (response.ok) {
        const data = await response.json();
        const docs = Array.isArray(data) ? data : (data.documents || []);
        const formattedDocs = docs.map(doc => ({
          docid: getVal(doc.docid),
          empid: getVal(doc.empid),
          documentName: getVal(doc.documentName),
          documentType: getVal(doc.documentType),
          rawUploadedDate: getVal(doc.uploadedDate),
          uploadedDate: formatDate(getVal(doc.uploadedDate)),
          description: getVal(doc.description),
          fileName: getVal(doc.fileName),
          fileUrl: getVal(doc.fileUrl)
        }));
        setDocuments(formattedDocs);
      } else {
        showToast("Failed to fetch documents", "error");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast("Error fetching documents", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmpId]);

  const resetForm = () => {
    setDocumentName("");
    setDocumentType("");
    setDescription("");
    setFileName("");
    setFileContent("");
    setErrors({});
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFileContent(base64String);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, fileName: false });
    }
  };

  const validateForm = (isEdit = false) => {
    const newErrors = {};
    if (!documentName.trim()) newErrors.documentName = true;
    if (!documentType.trim()) newErrors.documentType = true;
    if (!description.trim()) newErrors.description = true;
    if (!isEdit && (!fileName || !fileContent)) newErrors.fileName = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    
    const newDocId = `DOC${Date.now()}`;
    const payload = {
      docid: { S: newDocId },
      empid: { S: currentEmpId },
      documentName: { S: documentName.trim() },
      documentType: { S: documentType.trim() },
      uploadedDate: { S: new Date().toISOString().split("T")[0] },
      description: { S: description.trim() },
      fileName: fileName,
      fileContent: fileContent
    };

    try {
      const response = await fetch(`${API_BASE_URL}/document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        // Send notification to manager
        getEmployee(currentEmpId).then(emp => {
          const managerId = emp?.ManagerEmpId || emp?.managerEmpId || emp?.managerId || emp?.Manager || 'manager';
          addNotification(managerId, {
            title: "New Document",
            text: `New document uploaded by ${currentUser.name || currentUser.FullName || currentEmpId} pending approval.`,
            iconType: 'document',
            color: '#3b82f6',
            bg: '#eff6ff'
          });
        }).catch(() => {});
        
        showToast("Document uploaded successfully!");
        setShowAddForm(false);
        resetForm();
        fetchDocuments();
      } else {
        showToast("Failed to upload document", "error");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      showToast("Error uploading document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (doc) => {
    setCurrentDocument(doc);
    setDocumentName(doc.documentName);
    setDocumentType(doc.documentType);
    setDescription(doc.description);
    setFileName("");
    setFileContent("");
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!validateForm(true)) return;
    setIsLoading(true);
    
    const payload = {
      docid: { S: currentDocument.docid },
      empid: { S: currentEmpId },
      documentName: { S: documentName.trim() },
      documentType: { S: documentType.trim() },
      uploadedDate: { S: currentDocument.rawUploadedDate || currentDocument.uploadedDate },
      description: { S: description.trim() }
    };
    
    if (fileName && fileContent) {
      payload.fileName = fileName;
      payload.fileContent = fileContent;
    } else {
       payload.fileName = currentDocument.fileName;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/document/${currentDocument.docid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast("Document updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchDocuments();
      } else {
        showToast("Failed to update document", "error");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      showToast("Error updating document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (doc) => {
    setCurrentDocument(doc);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!currentDocument) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/document/${currentDocument.docid}`, {
        method: "DELETE"
      });
      if (response.ok) {
        showToast("Document deleted successfully");
        setShowDeleteConfirm(false);
        fetchDocuments();
      } else {
        showToast("Failed to delete document", "error");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast("Error deleting document", "error");
    } finally {
      setIsLoading(false);
      setCurrentDocument(null);
    }
  };

  const filtered = documents.filter(d => {
    const search = searchTerm.toLowerCase();
    const ms = (d.documentName || "").toLowerCase().includes(search) ||
               (d.fileName || "").toLowerCase().includes(search) ||
               (d.documentType || "").toLowerCase().includes(search) ||
               (d.uploadedDate || "").toLowerCase().includes(search) ||
               (d.description || "").toLowerCase().includes(search);
    const mt = filterType === "All" || d.documentType === filterType;
    return ms && mt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const documentTypesList = [
    "Identity Proof", "Address Proof", "Resume", "Educational Certificate", 
    "Experience Letter", "Offer Letter", "Salary Slip", "Other"
  ];

  return (
    <div className="dashboard-wrapper">
      {toast && (
        <div className="toast-message" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1055 }}>
          <div className={`alert alert-${toast.type === "error" ? "danger" : "success"} d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className={`bi ${toast.type === "error" ? "bi-exclamation-triangle" : "bi-check-circle"}`} />
            {toast.message}
          </div>
        </div>
      )}
      <Sidebar role={role} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content position-relative">
          
          {isLoading && (
            <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1000 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          <div className="section-header">
            <div>
              <h4>Document Management</h4>
              <p>{documents.length} documents uploaded</p>
            </div>
            <button className={`btn-custom-${showAddForm ? "danger" : "primary"} d-flex align-items-center gap-2`} onClick={() => showAddForm ? setShowAddForm(false) : openAddForm()} disabled={isLoading}>
              <i className={`bi ${showAddForm ? "bi-x-lg" : "bi-upload"}`} />
              {showAddForm ? "Cancel" : "Upload Document"}
            </button>
          </div>

          {showAddForm && (
            <div className="card-dashboard p-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className="bi bi-file-earmark-plus me-2" style={{ color: "var(--primary)" }} />
                Upload New Document
              </h5>
              <div className="row g-3 form-custom">
                <div className="col-md-6">
                  <label className="form-label">Document Name *</label>
                  <input type="text" className={`form-control ${errors.documentName ? "is-invalid" : ""}`} placeholder="e.g. Aadhaar Card" value={documentName} onChange={(e) => { setDocumentName(e.target.value); setErrors({ ...errors, documentName: false }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Document Type *</label>
                  <select className={`form-select ${errors.documentType ? "is-invalid" : ""}`} value={documentType} onChange={(e) => { setDocumentType(e.target.value); setErrors({ ...errors, documentType: false }); }}>
                    <option value="">Select Type</option>
                    {documentTypesList.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description *</label>
                  <input type="text" className={`form-control ${errors.description ? "is-invalid" : ""}`} placeholder="Provide a brief description..." value={description} onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: false }); }} />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Upload File *</label>
                  <div className="d-flex align-items-center gap-3">
                    <label className={`btn-custom-outline d-flex align-items-center justify-content-center gap-2 m-0 ${errors.fileName ? "border-danger text-danger" : ""}`} style={{ cursor: "pointer", padding: "0.35rem 1rem" }}>
                      <i className="bi bi-paperclip" /> Select File
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fileName ? (
                        <span className="fw-semibold" style={{ fontSize: "0.9rem", color: "var(--gray-800)" }}>{fileName}</span>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--gray-400)" }}>No file selected</span>
                      )}
                    </div>
                  </div>
                  {errors.fileName && <small className="text-danger mt-1 d-block">Please select a file to upload.</small>}
                </div>
                <div className="col-md-12 d-flex justify-content-end mt-4">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={handleAddSubmit} disabled={isLoading}>
                    <i className="bi bi-cloud-upload" /> {isLoading ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="search-box">
                <i className="bi bi-search" />
                <input type="text" className="form-control" placeholder="Search by name, file, or type..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="bi bi-funnel" style={{ color: "var(--gray-400)" }} />
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Types</option>
                  {documentTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table-custom table text-nowrap">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Uploaded Date</th>
                    <th>Description</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-folder2-open" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem", color: "var(--gray-300)" }} />
                        <h6 className="mb-1">No Documents Found</h6>
                        <small>You haven't uploaded any documents yet, or none match your search.</small>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((doc) => (
                      <tr key={doc.docid}>
                        <td className="fw-semibold">{doc.documentName}</td>
                        <td><span className="badge-status badge-uploaded">{doc.documentType}</span></td>
                        <td>
                          <div className="d-flex align-items-center" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <i className="bi bi-file-earmark-text me-2 text-primary" />
                            <span className="text-truncate">{doc.fileName}</span>
                          </div>
                        </td>
                        <td>{doc.uploadedDate}</td>
                        <td style={{ maxWidth: "250px" }} className="text-truncate">{doc.description}</td>
                        <td>
                          <div className="action-btns justify-content-center">
                            <button className="btn-icon text-primary" title="View" onClick={() => { setCurrentDocument(doc); setShowViewModal(true); }} style={{ background: "none", border: "none" }}>
                              <i className="bi bi-eye" style={{ fontSize: '1.2rem' }} />
                            </button>
                            <button className="btn-icon text-warning" title="Edit" onClick={() => handleEditClick(doc)} style={{ background: "none", border: "none" }}>
                              <i className="bi bi-pencil" style={{ fontSize: '1.2rem' }} />
                            </button>
                            <button className="btn-icon text-danger" title="Delete" onClick={() => handleDeleteClick(doc)} style={{ background: "none", border: "none" }}>
                              <i className="bi bi-trash" style={{ fontSize: '1.2rem' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "1px solid var(--gray-100)" }}>
                <small style={{ color: "var(--gray-500)" }}>
                  Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}><i className="bi bi-chevron-left" /></button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}><i className="bi bi-chevron-right" /></button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && currentDocument && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-0">
                <h5 className="modal-title fw-bold">Document Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <small className="text-muted d-block">Document Name</small>
                    <div className="fw-semibold">{currentDocument.documentName}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Document Type</small>
                    <div><span className="badge-status badge-uploaded mt-1">{currentDocument.documentType}</span></div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Uploaded Date</small>
                    <div className="fw-semibold">{currentDocument.uploadedDate}</div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Description</small>
                    <div>{currentDocument.description}</div>
                  </div>
                </div>

                {currentDocument.fileUrl && (
                  <div className="document-preview-container border rounded" style={{ height: "400px", background: "var(--gray-100)" }}>
                    {getEmbedUrl(currentDocument.fileUrl, currentDocument.fileName) === currentDocument.fileUrl ? (
                      <img 
                        src={currentDocument.fileUrl} 
                        alt={currentDocument.fileName} 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(currentDocument.fileUrl, currentDocument.fileName)}
                        title="Document Preview"
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentDocument && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-0">
                <h5 className="modal-title fw-bold">Edit Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4 form-custom">
                <div className="mb-3">
                  <label className="form-label">Document Name *</label>
                  <input type="text" className={`form-control ${errors.documentName ? "is-invalid" : ""}`} value={documentName} onChange={(e) => { setDocumentName(e.target.value); setErrors({ ...errors, documentName: false }); }} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Document Type *</label>
                  <select className={`form-select ${errors.documentType ? "is-invalid" : ""}`} value={documentType} onChange={(e) => { setDocumentType(e.target.value); setErrors({ ...errors, documentType: false }); }}>
                    {documentTypesList.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea className={`form-control ${errors.description ? "is-invalid" : ""}`} rows="3" value={description} onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: false }); }}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Replace File (Optional)</label>
                  <div className="d-flex align-items-center gap-3">
                    <label className="btn-custom-outline d-flex align-items-center justify-content-center gap-2 m-0" style={{ cursor: "pointer", padding: "0.35rem 1rem" }}>
                      <i className="bi bi-paperclip" /> Select New File
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fileName ? (
                        <span className="fw-semibold text-primary">{fileName}</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>Current: {currentDocument.fileName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditSubmit} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && currentDocument && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow text-center p-4">
              <div className="mb-3">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "3rem" }} />
              </div>
              <h5 className="fw-bold mb-2">Delete Document?</h5>
              <p className="text-muted mb-4">Are you sure you want to delete <strong>{currentDocument.documentName}</strong>? This action cannot be undone.</p>
              <div className="d-flex gap-2 justify-content-center">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete} disabled={isLoading}>
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default DocumentManagement;
