function InputField({ type, placeholder, value, onChange, label, icon, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <div className="position-relative">
        {icon && (
          <i className={`bi ${icon}`} style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--gray-400)",
            zIndex: 5,
          }} />
        )}
        <input
          type={type}
          className={`form-control ${icon ? "ps-5" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
}

export default InputField;
