import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const cookies = new Cookies();
    const token = cookies.get("jwt_authorization");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Usa jwtDecode aquí
        setUserName(decoded.name); // Asume que el nombre está en el payload del token
      } catch (err) {
        setUserName(""); // Token inválido o error en la decodificación
      }
    }
  }, []);

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove("jwt_authorization"); // Remover el token
    setUserName(""); // Resetear el estado del nombre de usuario
    // Redirigir al usuario a la página de login o inicio
    window.location.href = "/login";
  };

 
  return (
    <nav>
      <Link className="title" to="/">
        <LocalFloristIcon className="mx-2" sx={{ fontSize: 40 }} />
        FRESIAdmin
      </Link>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : "closed"}>
      <li>
          <NavLink to="/" onClick={() => setMenuOpen(!menuOpen)}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/scanner/" onClick={() => setMenuOpen(!menuOpen)}>Manejo de Productos e Inventario</NavLink>
        </li>
        <li>
          <NavLink to="/inventario/fresia" onClick={() => setMenuOpen(!menuOpen)}>Historial de Inventario</NavLink>
        </li>
        <li>
          <NavLink onClick={handleLogout} to="/login">
            <LogoutIcon></LogoutIcon> Salirr
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
