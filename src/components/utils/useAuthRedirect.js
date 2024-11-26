import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Ajusta la ruta según tu estructura de carpetas

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/not-authenticated");
    }
  }, [isAuthenticated, navigate]);
};

export default useAuthRedirect;
