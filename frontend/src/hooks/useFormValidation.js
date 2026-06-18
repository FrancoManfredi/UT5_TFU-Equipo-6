import { useState, useCallback } from 'react';

export const validators = {
  required: (value, fieldName = 'Este campo') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} es obligatorio`;
    }
    return null;
  },

  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Formato de email inválido';
    }
    return null;
  },

  minLength: (min) => (value, fieldName = 'Este campo') => {
    if (value && value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  phone: (value) => {
    if (value && !/^\+?[\d\s-()]+$/.test(value)) {
      return 'Formato de teléfono inválido';
    }
    return null;
  },

  match: (otherField, fieldName = 'Los campos') => (value) => {
    if (value !== otherField) {
      return `${fieldName} no coinciden`;
    }
    return null;
  },
};

export function useFormValidation(rules) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((name, value) => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = typeof rule === 'function' ? rule(value) : null;
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
      }
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return null;
  }, [rules]);

  const handleBlur = useCallback((name, value) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    return validate(name, value);
  }, [validate]);

  const validateAll = useCallback((values) => {
    let hasErrors = false;
    const allTouched = {};
    
    Object.keys(rules).forEach((name) => {
      allTouched[name] = true;
      const error = validate(name, values[name]);
      if (error) hasErrors = true;
    });
    
    setTouched(allTouched);
    return !hasErrors;
  }, [rules, validate]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validate,
    handleBlur,
    validateAll,
    reset,
  };
}
