import { useState } from 'react';

const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched when changed
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate field on change if it's already been touched
    if (touched[name]) {
      const fieldErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name] || ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Mark field as touched when blurred
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const fieldErrors = validate(values);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name] || ''
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const validateForm = () => {
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(fieldErrors).length === 0;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    validateForm,
    setValues
  };
};

export default useForm;