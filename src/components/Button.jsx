function Button({ text, onClick, variant = "primary", icon, className = "", ...props }) {
  const cls = variant === "danger" ? "btn-custom-danger" :
             variant === "success" ? "btn-custom-success" :
             variant === "outline" ? "btn-custom-outline" :
             "btn-custom-primary";

  return (
    <button className={`${cls} ${className}`} onClick={onClick} {...props}>
      {icon && <i className={`bi ${icon} me-1`} />}
      {text}
    </button>
  );
}

export default Button;
