import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.js";
import "../estilos.css";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";

const Login = () => {
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const URI = "https://back.fresiaserver.lat/login/in";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(URI, { email, password });
      console.log(response)
      const jwtToken = response.data.token;
      login(jwtToken);
      navigate("/scanner");
    } catch (err) {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="mt-5">
      <section className="h-80 gradient-form">
        <div className="login-container">
          <div className="row d-flex justify-content-center align-items-center h-50">
            <div className="col-xl-9">
              <div className="card rounded-3 shadow text-black">
                <div className="row g-0">
                  <div className="col-lg-6">
                    <div className="card-body p-md-5 mx-md-2">
                      <div className="text-center">
                        <h1 className="mt-1 mb-4 pb-1 logoFresia">
                        <LocalFloristIcon className="mx-2" sx={{ fontSize: 40 }} />
                          FRESIAdmin
                        </h1>
                      </div>
                      <form onSubmit={handleLogin}>
                        <p>Por favor ingresa a tu cuenta</p>
                        <div className="form-outline mb-2">
                          <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="form2Example11"
                            className="form-control"
                            placeholder="example@example.com"
                          />
                          <label
                            className="form-label"
                            htmlFor="form2Example11"
                          >
                            
                          </label>
                        </div>
                        <div className="form-outline mb-4">
                          <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="form2Example22"
                            className="form-control"
                            placeholder="Ingresa tu contraseña"
                          />
                          <label
                            className="form-label"
                            htmlFor="form2Example22"
                          >
                            
                          </label>
                        </div>
                        {error && <div className="text-danger">{error}</div>}
                        <div className="text-center pt-1 pb-1">
                          <button
                            className="btn col-8 btn-dark btn-block fa-lg gradient-custom-2 mb-3"
                            type="submit"
                          >
                            ENTRAR
                          </button>
                        </div>
                        <div className="text-center pt-1 mb-3 pb-1">
                          {/*<a className="text-muted" href="#!">Olvidaste tu Contraseña?</a>*/}
                        </div>
                        <div className="d-flex align-items-center justify-content-center pb-4">
                          <p className="mb-0 me-3">No tienes una cuenta?</p>
                          <a className="btn btn-outline-danger" href="/signUp/">
                            Crear nueva cuenta
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-6 d-flex align-items-center bg-1">
                    {/* Puedes agregar contenido adicional aquí */}
                    
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

export default Login;
