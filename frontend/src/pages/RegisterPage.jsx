import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFormValidation, validators } from '../hooks/useFormValidation';
import FormField from '../components/FormField';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', label: 'Débil', color: '#ef4444' };
  if (score <= 3) return { level: 'medium', label: 'Media', color: '#f59e0b' };
  return { level: 'strong', label: 'Fuerte', color: '#22c55e' };
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => ({
    nombre: [
      (v) => validators.required(v, 'El nombre'),
      validators.minLength(2),
    ],
    email: [
      (v) => validators.required(v, 'El email'),
      validators.email,
    ],
    telefono: [
      validators.phone,
    ],
    password: [
      (v) => validators.required(v, 'La contraseña'),
      validators.minLength(6),
    ],
    confirmPassword: [
      (v) => validators.required(v, 'Confirmá tu contraseña'),
      (v) => validators.match(form.password, 'Las contraseñas')(v),
    ],
  }), [form.password]);

  const { errors, touched, handleBlur, validateAll } = useFormValidation(rules);

  const passwordStrength = useMemo(() => {
    if (!form.password) return null;
    return getPasswordStrength(form.password);
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    handleBlur(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll(form)) {
      toast.warning('Por favor, corregí los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      await register(form.nombre, form.email, form.telefono, form.password);
      toast.success('¡Cuenta creada con éxito! Ya podés empezar a pedir.');
      navigate('/menu');
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      if (errorMsg?.includes('email') || errorMsg?.includes('registrado')) {
        toast.error('Este email ya está registrado. ¿Querés iniciar sesión?');
      } else {
        toast.error(errorMsg || 'No pudimos crear tu cuenta. Intentá en unos minutos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🚚 Truck &amp; Roll</h1>
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.nombre}
            touched={touched.nombre}
            placeholder="Tu nombre"
            autoComplete="name"
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.email}
            touched={touched.email}
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.telefono}
            touched={touched.telefono}
            placeholder="+54 11 1234-5678"
            autoComplete="tel"
            optional
          >
            {form.password && passwordStrength && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: passwordStrength.level === 'weak' ? '33%' : passwordStrength.level === 'medium' ? '66%' : '100%',
                      background: passwordStrength.color
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </FormField>
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.password}
            touched={touched.password}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <FormField
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            placeholder="Repetí tu contraseña"
            autoComplete="new-password"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creando cuenta…
              </>
            ) : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
