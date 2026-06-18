import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!form.password) return null;
    return getPasswordStrength(form.password);
  }, [form.password]);

  const validate = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'nombre') {
      if (!value.trim()) {
        newErrors.nombre = 'El nombre es obligatorio';
      } else if (value.trim().length < 2) {
        newErrors.nombre = 'Mínimo 2 caracteres';
      } else {
        delete newErrors.nombre;
      }
    }
    
    if (name === 'email') {
      if (!value) {
        newErrors.email = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Formato de email inválido';
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'telefono') {
      if (value && !/^\+?[\d\s-()]+$/.test(value)) {
        newErrors.telefono = 'Formato de teléfono inválido';
      } else {
        delete newErrors.telefono;
      }
    }
    
    if (name === 'password') {
      if (!value) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (value.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      } else {
        delete newErrors.password;
      }
      if (form.confirmPassword && value !== form.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      } else if (form.confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }
    
    if (name === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Confirmá tu contraseña';
      } else if (value !== form.password) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = { nombre: true, email: true, telefono: true, password: true, confirmPassword: true };
    setTouched(allTouched);
    
    validate('nombre', form.nombre);
    validate('email', form.email);
    validate('telefono', form.telefono);
    validate('password', form.password);
    validate('confirmPassword', form.confirmPassword);
    
    if (Object.keys(errors).length > 0) {
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
          <label className={touched.nombre && errors.nombre ? 'has-error' : ''}>
            <span>Nombre</span>
            <input 
              name="nombre" 
              value={form.nombre} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tu nombre"
              autoComplete="name"
            />
            {touched.nombre && errors.nombre && (
              <span className="field-error" role="alert">{errors.nombre}</span>
            )}
          </label>
          <label className={touched.email && errors.email ? 'has-error' : ''}>
            <span>Email</span>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <span className="field-error" role="alert">{errors.email}</span>
            )}
          </label>
          <label className={touched.telefono && errors.telefono ? 'has-error' : ''}>
            <span>Teléfono <span className="field-optional">(opcional)</span></span>
            <input 
              name="telefono" 
              type="tel"
              value={form.telefono} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+54 11 1234-5678"
              autoComplete="tel"
            />
            {touched.telefono && errors.telefono && (
              <span className="field-error" role="alert">{errors.telefono}</span>
            )}
          </label>
          <label className={touched.password && errors.password ? 'has-error' : ''}>
            <span>Contraseña</span>
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
            />
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
            {touched.password && errors.password && (
              <span className="field-error" role="alert">{errors.password}</span>
            )}
          </label>
          <label className={touched.confirmPassword && errors.confirmPassword ? 'has-error' : ''}>
            <span>Confirmar contraseña</span>
            <input 
              name="confirmPassword" 
              type="password" 
              value={form.confirmPassword} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error" role="alert">{errors.confirmPassword}</span>
            )}
          </label>
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
