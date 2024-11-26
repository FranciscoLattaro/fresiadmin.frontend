import React, { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import "../estilos.css";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import {Typography} from "@mui/material"

import { useNavigate } from "react-router-dom";

const URI = "https://back.fresiaserver.lat/user/create";

const SignUp = () => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Enviar la solicitud POST para crear el usuario
      await axios.post(URI, {
        name: nombreCompleto,
        email: email,
        password: hashedPassword,
      });

      setSuccess("Registro exitoso, redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error al registrar el usuario. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 mb-5">
      <section className="h-80 gradient-form ">
        <div>
          <div className="row d-flex justify-content-center align-items-center h-50 ">
            <div className="col-xl-9 ">
              <div className="card rounded-3 shadow text-black">
                <div className="row g-0">
                  <div className="col-lg-6">
                    <div className="card-body p-md-5 mx-md-2">
                      <div className="text-center">
                        <Typography sx={{ fontSize: 30 }} className="mt-1 mb-4 pb-1 logoFresia">
                        <LocalFloristIcon className="mx-2" sx={{ fontSize: 40 }} />

                          FRESIAdmin - Crear una Nueva Cuenta
                        </Typography>
                      </div>
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                      {success && (
                        <div className="alert alert-success">{success}</div>
                      )}
                      <form onSubmit={handleSubmit}>
                        <div className="form-outline mb-4">
                          <input
                            onChange={(event) =>
                              setNombreCompleto(event.target.value)
                            }
                            type="text"
                            value={nombreCompleto}
                            id="nombreCompleto"
                            className="form-control"
                            placeholder="Ingresa tu nombre completo"
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <input
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            id="email"
                            value={email}
                            className="form-control"
                            placeholder="Ingresa tu e-mail"
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <input
                            onChange={(event) => setPass(event.target.value)}
                            type="password"
                            id="password"
                            value={password}
                            className="form-control"
                            placeholder="Ingresa tu contraseña"
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <input
                            onChange={(event) =>
                              setConfirmPass(event.target.value)
                            }
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            className="form-control"
                            placeholder="Confirma tu contraseña"
                            required
                          />
                        </div>
                        <div className="text-center pt-1 pb-1 ">
                          <button
                            className="btn col-8 btn-dark btn-block fa-lg gradient-custom-2 mb-3"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? "Cargando..." : "CREAR"}
                          </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                          <a
                            type="button"
                            className="btn btn-outline-success"
                            href="/login"
                          >
                            Volver a Inicio de Sesión
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-6 bg-light align-items-center">
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
