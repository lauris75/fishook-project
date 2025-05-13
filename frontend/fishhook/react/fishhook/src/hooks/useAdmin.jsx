import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAdmin = () => {
  const { currentUser } = useContext(AuthContext);
  
  const isAdmin = currentUser?.role === 'ADMIN';
  
  return { isAdmin };
};