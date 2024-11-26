import React, { useState } from "react";
import "react-tabs/style/react-tabs.css";
import Scanner from "./Scanner";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useAuth } from "../utils/AuthContext.js";
import useAuthRedirect from "../utils/useAuthRedirect.js";
import CompImportarArticulos from "../Importacion/ImportarArticulos.jsx";
import DownloadIcon from '@mui/icons-material/Download';

const MenuScanner = () => {
  //const { user } = useAuth(); // Obtener el usuario autenticadoa
  //useAuthRedirect(user); //Redirigir si no está autenticado
  const [value, setValue] = useState("1");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="col-lg-10 col-11">
      <TabContext className="mt-0 mb-3" value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Pestañas Scanner">
            <Tab label={<QrCodeScannerIcon />} value="1" />
            <Tab label={<DownloadIcon />} value="2" />
          </TabList>
        </Box>
        <TabPanel
          sx={{
            backgroundColor: "white",
            padding: 2,
            borderBottom: '3px solid', // Borde inferior
            borderBottomLeftRadius: '1em', // Borde inferior izquierdo redondeado
            borderBottomRightRadius: '1em', // Borde inferior derecho redondeado
            marginBottom: 10,
            marginTop: 1,
            borderTop: 1, borderColor: "divider"
            // Color del borde
          }}
          value="1"
        >
          <Scanner
           />
        </TabPanel>
        <TabPanel
          sx={{
            backgroundColor: "white",
            padding: 2,
            borderBottom: '3px solid', // Borde inferior
            borderBottomLeftRadius: '1em', // Borde inferior izquierdo redondeado
            borderBottomRightRadius: '1em', // Borde inferior derecho redondeado
            marginBottom: 10,
            marginTop: 1, 
            borderTop: 1, borderColor: "divider"// Color del borde
          }}
          value="2"
        >
          <CompImportarArticulos />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default MenuScanner;
