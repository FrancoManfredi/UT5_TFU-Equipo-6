import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'email') {
      if (!value) {
        newErrors.email = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Formato de email inválido';
      } else {
        delete newErrors.email;
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
    
    setTouched({ email: true, password: true });
    validate('email', form.email);
    validate('password', form.password);
    
    if (Object.keys(errors).length > 0) {
      toast.warning('Por favor, corregí los errores del formulario');
      return;
    }
    
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/menu');
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      if (errorMsg?.includes('credenciales')) {
        toast.error('Email o contraseña incorrectos. Verificá tus datos e intentá de nuevo.');
      } else if (err.response?.status === 401) {
        toast.error('Credenciales inválidas. ¿Olvidaste tu contraseña?');
      } else {
        toast.error(errorMsg || 'No pudimos iniciar sesión. Intentá en unos minutos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🚚 Truck &amp; Roll</h1>
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              aria-describedby="email-help"
            />
            {touched.email && errors.email && (
              <span className="field-error" role="alert">{errors.email}</span>
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
              autoComplete="current-password"
              minLength={6}
            />
            {touched.password && errors.password && (
              <span className="field-error" role="alert">{errors.password}</span>
            )}
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Ingresando…
              </>
            ) : 'Ingresar'}
          </button>
        </form>
        <p className="auth-footer">
          ¿No tenés cuenta? <Link to="/register">Registrate acá</Link>
        </p>
      </div>
    </div>
  );
}
