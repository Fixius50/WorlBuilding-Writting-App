import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@features/App/store/useAppStore';

export const useLogin = () => {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    switch (!!user) {
      case true:
        navigate('/');
        break;
      default:
        break;
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulated local authentication for Local-First architecture
      await new Promise(resolve => setTimeout(resolve, 800)); // Aesthetic delay
      
      const userData = {
        username: formData.username || 'Architect',
        displayName: formData.username || 'Architect',
        success: true,
        localMode: true
      };

      await setUser(userData);
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return {
    isRegister,
    setIsRegister,
    formData,
    error,
    loading,
    handleSubmit,
    handleChange
  };
};

