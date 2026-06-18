import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFormValidation, validators } from '../hooks/useFormValidation';
import FormField from '../components/FormField';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => ({
    email: [
      (v) => validators.required(v, 'El email'),
      validators.email,
    ],
    password: [
      (v) => validators.required(v, 'La contraseña'),
      validators.minLength(6),
    ],
  }), []);

  const { errors, touched, handleBlur, validateAll } = useFormValidation(rules);

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
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            error={errors.password}
            touched={touched.password}
            placeholder="Mínimo 6 caracteres"
            autoComplete="current-password"
            required
            minLength={6}
          />
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
