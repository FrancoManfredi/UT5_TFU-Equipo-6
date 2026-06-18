import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.telefono, form.password);
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🚚 Truck &amp; Roll</h1>
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>
          <label>Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Teléfono
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          </label>
          <label>Contraseña
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>
        <p>¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </div>
    </div>
  );
}
