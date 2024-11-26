import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import axios from "axios";

const VarianteCantidad = ({
  variants = [],
  cantidad = 0,
  discartProductHandler,
  reSearchProduct,
}) => {
  const [variante, setVariante] = useState("");
  const [cantidadInput, setCantidadInput] = useState(1);
  const [currentCantidad, setCurrentCantidad] = useState(cantidad);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [motivo, setMotivo] = useState(""); // Estado para controlar el motivo
  const [nroPedidoOriginal, setNroPedidoOriginal] = useState("");
  const [nombreClienta, setNombreClienta] = useState("");
  const [notas, setNotas] = useState("");
  const [formError, setFormError] = useState("");
  const urlBack = "https://back.fresiaserver.lat/";

  useEffect(() => {
    setCurrentCantidad(cantidad);
  }, [cantidad]);

  const selectedVariant = variants.find(
    (variant) => variant.title === variante
  );

  const handleVarianteChange = (event) => {
    setVariante(event.target.value);
    const variant = variants.find((v) => v.title === event.target.value);
    setCurrentCantidad(variant.inventory_quantity); // Actualiza la cantidad actual
  };

  const handleCantidadChange = (action) => {
    if (action === "increment") {
      setCantidadInput(cantidadInput + 1);
    } else if (action === "decrement" && cantidadInput > 1) {
      setCantidadInput(cantidadInput - 1);
    }
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setCantidadInput(value);
    }
  };

  const handleUpdateStock = async (operation, motivoString = "") => {
    if (!selectedVariant) return;
    const inventoryItemId = selectedVariant.inventory_item_id;
    const newCantidad = operation === "add" ? +cantidadInput : -cantidadInput;
    const url = `${urlBack}producto/edit/${inventoryItemId}/${newCantidad}`;

    try {
      const response = await axios.post(url, { motivo: motivoString });
      if (response.data.inventoryAdjustQuantities?.userErrors?.length === 0) {
        updateFresiaInventory(selectedVariant, newCantidad, motivoString);
        updateProductView();
      } else {
        setError("Error al actualizar el stock");
        console.error(
          "Error al actualizar el stock:",
          response.data.inventoryAdjustQuantities.userErrors[0].message
        );
      }
    } catch (error) {
      console.error("Error al actualizar el stock:", error);
    }
  };

  const updateFresiaInventory = async (variant, quantity, motivoString) => {
    let productSKU = variant.sku;
    let newQuantityInteger = parseInt(quantity);

    try {
      const response = await axios.get(`${urlBack}stock/${productSKU}`);

      if (response.status === 200) {
        let urlCreate = `${urlBack}stock/create`;
        await axios.post(urlCreate, {
          sku: productSKU,
          cantidad: newQuantityInteger,
          talle: variant.title,
          motivo: motivoString,
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        let urlCreate = `${urlBack}stock/create`;
        await axios.post(urlCreate, {
          sku: productSKU,
          cantidad: newQuantityInteger,
          talle: variant.title,
          motivo: motivoString,
        });
      } else {
        console.error("Error al realizar la solicitud:", error);
      }
    }
  };

  const discartProduct = () => {
    discartProductHandler(null);
  };

  const updateProductView = () => {
    reSearchProduct();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = () => {
    if (!motivo) {
      setFormError("El motivo es obligatorio.");
      return false;
    }
    if ((motivo === "Arreglo" || motivo === "Cambio") && (!nroPedidoOriginal || !nombreClienta)) {
      setFormError("Por favor, complete todos los campos requeridos.");
      return false;
    }
    if (motivo === "Arreglo" && !notas) {
      setFormError("Las notas son obligatorias para el motivo 'Arreglo'.");
      return false;
    }
    setFormError("");
    return true;
  };
  
  const handleConfirmReduction = () => {
    if (validateForm()) {
      let motivoString = "";
    if (motivo !== "") {
      motivoString +=`Motivo: ${motivo}`;
    }


     
    if (motivo === "Arreglo" || motivo === "Cambio") {
      if (!nroPedidoOriginal || !nombreClienta) {
        setFormError("Por favor complete todos los campos obligatorios.");
        return;
      }
      motivoString += `, Nro. Pedido Original: ${nroPedidoOriginal}, Nombre Clienta: ${nombreClienta}`;
    }

    if (motivo === "Arreglo") {
      if (!notas) {
        setFormError("Las notas son obligatorias para los arreglos.");
        return;
      }
      motivoString += `, Notas: ${notas}`;
    }

    handleUpdateStock("remove", motivoString);
    handleCloseDialog();
    }
  };
 
  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="variante-label">Variante</InputLabel>
        <Select
          labelId="variante-label"
          value={variante}
          onChange={handleVarianteChange}
          label="Variante"
        >
          {variants.map((variant) => (
            <MenuItem key={variant.id} value={variant.title}>
              {variant.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          color="primary"
          onClick={() => handleCantidadChange("decrement")}
        >
          <RemoveIcon />
        </IconButton>
        <TextField
          type="number"
          label="Cantidad"
          value={cantidadInput}
          onChange={handleInputChange}
          inputProps={{ min: 1 }}
          sx={{
            "& input": {
              textAlign: "center",
            },
            width: "100%",
            maxWidth: 400,
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleCantidadChange("increment")}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#4CAF50", color: "white" }}
          onClick={() => handleUpdateStock("add")}
          disabled={!selectedVariant}
        >
          Agregar Stock
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "red" }}
          onClick={handleOpenDialog}
          disabled={!selectedVariant}
        >
          Reducir Stock
        </Button>
        <Button variant="outlined" color="dark" onClick={() => discartProduct()}>
          Descartar
        </Button>
      </Box>

      {error && (
        <Typography color="error" align="center" marginTop={2}>
          {error}
        </Typography>
      )}

      {/* Diálogo de confirmación para Reducción de stock */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-reduction-dialog"
      >
        <DialogTitle id="confirm-reduction-dialog">
          Confirmar reducción de stock
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Complete el siguiente formulario para confirmar la reducción de
            stock.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="motivo-label" required>Motivo</InputLabel>
            <Select
              labelId="motivo-label"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              label="Motivo"
            >
              <MenuItem value="">Seleccionar una opción</MenuItem>
              <MenuItem value="Arreglo">Arreglo</MenuItem>
              <MenuItem value="Cambio">Cambio</MenuItem>
              <MenuItem value="Control de stock">Control de stock</MenuItem>
            </Select>
          </FormControl>

          {(motivo === "Arreglo" || motivo === "Cambio") && (
            <>
              <TextField
                fullWidth
                label="Nro. Pedido Original"
                value={nroPedidoOriginal}
                onChange={(e) => setNroPedidoOriginal(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Nombre Clienta"
                value={nombreClienta}
                onChange={(e) => setNombreClienta(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
            </>
          )}

          {motivo === "Arreglo" && (
            <TextareaAutosize
              minRows={3}
              placeholder="Notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              style={{
                width: "100%",
                marginTop: 16,
                padding: 8,
                fontFamily: "Arial",
                fontSize: 16,
              }}
              required
            />
          )}

          {formError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReduction}
            color="warning"
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VarianteCantidad;
