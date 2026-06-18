export default function FormField({ 
  label, 
  name, 
  type = 'text',
  value, 
  onChange, 
  onBlur,
  error,
  touched,
  placeholder,
  autoComplete,
  required = false,
  optional = false,
  minLength,
  children
}) {
  const hasError = touched && error;

  return (
    <label className={hasError ? 'has-error' : ''}>
      <span>
        {label}
        {optional && <span className="field-optional"> (opcional)</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
      {hasError && (
        <span className="field-error" role="alert">{error}</span>
      )}
      {children}
    </label>
  );
}
