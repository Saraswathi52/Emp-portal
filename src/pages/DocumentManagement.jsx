import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DocumentManagement() {
  const [role] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role.toLowerCase() : "employee";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [documents, setDocuments] = useState([
    { id: "DOC001", employeeId: "EMP1001", type: "Resume", fileName: "resume.pdf", status: "Uploaded", size: "1.2 MB" },
    { id: "DOC002", employeeId: "EMP1002", type: "ID Proof", fileName: "aadhar.pdf", status: "Uploaded", size: "0.8 MB" },
    { id: "DOC003", employeeId: "EMP1003", type: "Certification", fileName: "certificate.pdf", status: "Uploaded", size: "2.1 MB" },
  ]);

  const [documentId, setDocumentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const perPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = () => {
    const newErrors = {};
    if (!documentId.trim()) newErrors.documentId = true;
    if (!employeeId.trim()) newErrors.employeeId = true;
    if (!documentType.trim()) newErrors.documentType = true;
    if (!fileName.trim()) newErrors.fileName = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setDocuments([...documents, {
      id: documentId.trim(),
      employeeId: employeeId.trim(),
      type: documentType.trim(),
      fileName: fileName.trim(),
      status: "Uploaded",
      size: fileSize || "—",
    }]);

    setDocumentId(""); setEmployeeId(""); setDocumentType(""); setFileName(""); setFileSize("");
    setErrors({}); setShowForm(false); setCurrentPage(1);
    showToast("Document uploaded successfully!");
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter(d => d.id !== id));
    showToast("Document deleted", "warning");
  };

  const docTypes = [...new Set(documents.map(d => d.type))];
  const filtered = documents.filter(d => {
    const ms = d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase());
    const mt = filterType === "All" || d.type === filterType;
    return ms && mt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="dashboard-wrapper">
      {toast && (
        <div className="toast-message">
          <div className={`alert alert-${toast.type === "warning" ? "warning" : "success"} d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: "10px", border: "none", padding: "0.75rem 1.25rem" }}>
            <i className={`bi ${toast.type === "warning" ? "bi-exclamation-circle" : "bi-check-circle"}`} />
            {toast.message}
          </div>
        </div>
      )}
        <Sidebar role={role} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <div className="section-header">
            <div>
              <h4>Document Management</h4>
              <p>{documents.length} documents uploaded</p>
            </div>
            <button className={`btn-custom-${showForm ? "danger" : "primary"} d-flex align-items-center gap-2`} onClick={() => { setShowForm(!showForm); setErrors({}); }}>
              <i className={`bi ${showForm ? "bi-x-lg" : "bi-upload"}`} />
              {showForm ? "Cancel" : "Upload Document"}
            </button>
          </div>

          {showForm && (
            <div className="card-dashboard p-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "var(--gray-800)" }}>
                <i className="bi bi-file-earmark-plus me-2" style={{ color: "var(--primary)" }} />
                Upload New Document
              </h5>
              <div className="row g-3 form-custom">
                <div className="col-md-3">
                  <label className="form-label">Document ID</label>
                  <input type="text" className={`form-control ${errors.documentId ? "is-invalid" : ""}`} placeholder="DOC004" value={documentId} onChange={(e) => { setDocumentId(e.target.value); setErrors({ ...errors, documentId: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Employee ID</label>
                  <input type="text" className={`form-control ${errors.employeeId ? "is-invalid" : ""}`} placeholder="EMP1001" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setErrors({ ...errors, employeeId: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Document Type</label>
                  <select className={`form-select ${errors.documentType ? "is-invalid" : ""}`} value={documentType} onChange={(e) => { setDocumentType(e.target.value); setErrors({ ...errors, documentType: false }); }}>
                    <option value="">Select Type</option>
                    <option value="Resume">Resume</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Certification">Certification</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">File Name</label>
                  <input type="text" className={`form-control ${errors.fileName ? "is-invalid" : ""}`} placeholder="document.pdf" value={fileName} onChange={(e) => { setFileName(e.target.value); setErrors({ ...errors, fileName: false }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">File Size (optional)</label>
                  <input type="text" className="form-control" placeholder="1.2 MB" value={fileSize} onChange={(e) => setFileSize(e.target.value)} />
                </div>
                <div className="col-md-9 d-flex align-items-end">
                  <button className="btn-custom-primary d-flex align-items-center gap-2" onClick={handleUpload}>
                    <i className="bi bi-cloud-upload" /> Upload Document
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card-dashboard p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div className="search-box">
                <i className="bi bi-search" />
                <input type="text" className="form-control" placeholder="Search documents..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="bi bi-funnel" style={{ color: "var(--gray-400)" }} />
                <select className="form-select" style={{ width: "auto", borderRadius: "50px", fontSize: "0.85rem", padding: "0.35rem 2rem 0.35rem 0.75rem" }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Types</option>
                  {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table-custom table">
                <thead>
                  <tr>
                    <th>Doc ID</th>
                    <th>Employee ID</th>
                    <th>Type</th>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4" style={{ color: "var(--gray-400)" }}>
                        <i className="bi bi-folder2-open" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
                        No documents found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((doc) => (
                      <tr key={doc.id}>
                        <td className="fw-semibold">{doc.id}</td>
                        <td>{doc.employeeId}</td>
                        <td><span className="badge-status badge-uploaded">{doc.type}</span></td>
                        <td>
                          <i className="bi bi-file-earmark-text me-1" style={{ color: "var(--primary)" }} />
                          {doc.fileName}
                        </td>
                        <td style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>{doc.size}</td>
                        <td><span className="badge-status badge-approved">{doc.status}</span></td>
                        <td>
                          <div className="action-btns justify-content-center">
                            <button className="btn-custom-outline d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }}>
                              <i className="bi bi-download" /> Download
                            </button>
                            <button className="btn-custom-danger d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => handleDelete(doc.id)}>
                              <i className="bi bi-trash" /> Delete
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
    </div>
  );
}

export default DocumentManagement;
