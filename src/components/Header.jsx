function Header() {
  return (
    <div className="d-flex align-items-center gap-2 justify-content-center mb-4">
      <i className="bi bi-buildings" style={{ fontSize: "2rem", color: "var(--primary)" }} />
      <h1 className="fw-bold" style={{ color: "var(--gray-800)", fontSize: "1.8rem", margin: 0 }}>SHAHO</h1>
    </div>
  );
}

export default Header;
