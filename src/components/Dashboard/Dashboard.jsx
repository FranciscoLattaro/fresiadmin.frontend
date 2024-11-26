import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid2,
} from "@mui/material";
import dayjs from "dayjs"; // Usado para manejar fechas
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const Dashboard = () => {
  //const { user } = useAuth(); // Obtener el usuario autenticadoa
  //useAuthRedirect(user); //Redirigir si no está autenticado
  const [data, setData] = useState([]); // Datos originales
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // Mes seleccionado (1-12)
  const [selectedYear, setSelectedYear] = useState(dayjs().year()); // Año seleccionado
  const [chartInstance, setChartInstance] = useState(null); // Instancia del gráfico
  const [value, setValue] = useState("1");

  // Obtener los datos desde el endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://back.fresiaserver.lat/stock/log/CantidadFecha"
        );
        setData(response.data);
        applyFilter(response.data, selectedMonth, selectedYear); // Aplicar el filtro inicialmente
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]); // Ejecutar de nuevo cuando cambian mes o año

  // Aplicar filtro por mes y año
  const applyFilter = (rawData, month, year) => {
    const filtered = rawData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() + 1 === month && // Filtro por mes (1-12)
        itemDate.getFullYear() === year // Filtro por año
      );
    });

    setFilteredData(filtered);
    createChart(filtered);
  };

  // Crear gráfico de barras
  const createChart = (data) => {
    const ctx = document.getElementById("myChart").getContext("2d");

    // Destruir el gráfico anterior si existe
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Configurar etiquetas y valores
    const labels = data.map((item) => item.date);
    const values = data.map((item) => item.total_cantidad);

    // Crear nuevo gráfico
    const newChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Cantidad",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  // Manejar el cambio de mes
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Manejar el cambio de año
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Generar opciones de meses
  const monthOptions = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  // Generar opciones de años (de 2020 hasta el año actual)
  const yearOptions = Array.from(new Array(5), (val, index) => {
    const year = dayjs().year() - index;
    return { value: year, label: year.toString() };
  });

  //Manejar Tabulacion
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="col-lg-10 col-11">
      <TabContext className="mt-0 mb-3" value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Pestañas Dashboard">
            <Tab label={"Gráfica Inventario"} value="1" />
          </TabList>
        </Box>
        
        <TabPanel
          sx={{
            backgroundColor: "white",
            padding: 2,
            borderBottom: "3px solid",
            borderBottomLeftRadius: "1em",
            borderBottomRightRadius: "1em",
            marginBottom: 10,
            marginTop: 1,
            borderTop: 1,
            borderColor: "divider",
            minHeight: "5em",  // Altura mínima aquí también
          }}
          value="1"
        >
          {/* Combo box para seleccionar mes y año */}
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 item xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="month-label">Mes</InputLabel>
                <Select
                  labelId="month-label"
                  id="month-select"
                  value={selectedMonth}
                  label="Mes"
                  onChange={handleMonthChange}
                >
                  {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 item xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="year-label">Año</InputLabel>
                <Select
                  labelId="year-label"
                  id="year-select"
                  value={selectedYear}
                  label="Año"
                  onChange={handleYearChange}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year.value} value={year.value}>
                      {year.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          {/* Canvas para mostrar el gráfico */}
        <canvas id="myChart" width="400" height="200" style={{ minHeight: "5em" }}></canvas>
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default Dashboard;
