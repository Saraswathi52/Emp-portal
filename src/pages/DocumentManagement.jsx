import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DocumentManagement() {
  const [showForm, setShowForm] = useState(false);

  const [documents, setDocuments] = useState([
    {
      id: "DOC001",
      employeeId: "EMP1001",
      type: "Resume",
      fileName: "resume.pdf",
      status: "Uploaded",
    },
  ]);

  const [documentId, setDocumentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [fileName, setFileName] = useState("");

  const handleUpload = () => {
    if (
      documentId === "" ||
      employeeId === "" ||
      documentType === "" ||
      fileName === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    const newDocument = {
      id: documentId,
      employeeId,
      type: documentType,
      fileName,
      status: "Uploaded",
    };

    setDocuments([...documents, newDocument]);

    setDocumentId("");
    setEmployeeId("");
    setDocumentType("");
    setFileName("");

    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updatedDocuments = documents.filter(
      (document) => document.id !== id
    );

    setDocuments(updatedDocuments);
  };

  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "30px", flex: 1 }}>
          <h2>Document Management</h2>

          <hr />

          <button onClick={() => setShowForm(!showForm)}>
            Upload Document
          </button>

          <br />
          <br />

          {showForm && (
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Document ID"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />

              <br /><br />

              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />

              <br /><br />

              <input
                type="text"
                placeholder="Document Type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              />

              <br /><br />

              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />

              <br /><br />

              <button onClick={handleUpload}>
                Upload
              </button>
            </div>
          )}

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Employee ID</th>
                <th>Document Type</th>
                <th>File Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.id}</td>
                  <td>{document.employeeId}</td>
                  <td>{document.type}</td>
                  <td>{document.fileName}</td>
                  <td>{document.status}</td>

                  <td>
                    <button onClick={() => handleDelete(document.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default DocumentManagement;