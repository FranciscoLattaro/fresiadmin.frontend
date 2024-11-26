import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  TextField,
  Box,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";

const URI = "https://back.fresiaserver.lat";

const CompMostrarInventarioFresia = () => {
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");
  const [skuFilter, setSkuFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    getStock();
  }, []);

  useEffect(() => {
    const filtered = stock
      .filter((item) => {
        const matchesSku = item.sku
          .toLowerCase()
          .includes(skuFilter.toLowerCase());
        const matchesDate = dateFilter
          ? item.updatedAt && item.updatedAt.startsWith(dateFilter)
          : true;
        return matchesSku && matchesDate;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    setFilteredStock(filtered);
  }, [skuFilter, dateFilter, stock]);

  const getStock = async () => {
    try {
      const res = await axios.get(URI + "/stock/");
      setStock(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSkuFilterChange = (event) => {
    setSkuFilter(event.target.value);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && view === "table") {
    return <CircularProgress className="mt-5" />;
  }

  return (
    <div className="col-lg-10 col-11">
      <TabContext value={view}>
        <Tabs
          value={view}
          onChange={(event, newValue) => setView(newValue)}
          aria-label="tabs"
        >
          <Tab label="log Inventario" value="table" />
        </Tabs>

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
          }}
          value="table"
        >
          {/* Filtros */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              mt: 3,
            }}
          >
            <TextField
              label="Filtrar por SKU"
              variant="outlined"
              size="small"
              value={skuFilter}
              onChange={handleSkuFilterChange}
              sx={{ width: "48%" }}
            />
            <TextField
              label="Filtrar por Fecha"
              type="date"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{ width: "48%" }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table aria-label="inventario de productos" size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "25%" }}>SKU</TableCell>
                  <TableCell style={{ width: "15%" }}>Talle</TableCell>
                  <TableCell style={{ width: "10%" }}>Cantidad</TableCell>
                  <TableCell style={{ width: "20%" }}>Motivo</TableCell>
                  <TableCell style={{ width: "30%" }}>Actualizado en</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStock
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        "& > *": {
                          padding: "4px 8px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "1px",
                        },
                      }}
                    >
                      <Tooltip title={item.sku} arrow>
                        <TableCell>{item.sku}</TableCell>
                      </Tooltip>
                      <Tooltip title={item.talle} arrow>
                        <TableCell>{item.talle}</TableCell>
                      </Tooltip>
                      <Tooltip title={item.cantidad.toString()} arrow>
                        <TableCell>{item.cantidad}</TableCell>
                      </Tooltip>
                      <Tooltip title={item.motivo || "N/A"} arrow>
                        <TableCell>{item.motivo || "N/A"}</TableCell>
                      </Tooltip>
                      <Tooltip title={item.updatedAt ? item.updatedAt.slice(0, 10) : "N/A"} arrow>
                        <TableCell>
                          {item.updatedAt ? item.updatedAt.slice(0, 10) : "N/A"}
                        </TableCell>
                      </Tooltip>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <TablePagination
            component="div"
            count={filteredStock.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Registros por página"
            rowsPerPageOptions={[10, 20, 50]}
          />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default CompMostrarInventarioFresia;
