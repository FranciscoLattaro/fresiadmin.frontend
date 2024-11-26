import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import VarianteCantidad from "./VarianteCantidad"; // Importar el componente VarianteCantidad
import { Search } from "@mui/icons-material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Scanner = () => {
  const urlBack = "https://back.fresiaserver.lat/";
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [searchSKU, setSearchSKU] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [cantidad, setCantidad] = useState(0);
  const [hasInventoryManagment, setHasInventoryManagement] = useState(true);
  const [
    variantsWithoutInventoryManagement,
    setVariantsWithoutInventoryManagement,
  ] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  

  const cleanValues = () => {
    setVariants([]);
    setProduct(null);
    setError("");
    setHasInventoryManagement(true);
    setVariantsWithoutInventoryManagement([]);
  };

  const fetchProduct = async () => {
    cleanValues();
    try {
      const response = await axios.get(urlBack + `producto/${searchSKU}`);
      const productsData = response.data.products;

      if (productsData) {
        let stockProduct = productsData.filter((product) =>
          product.vendor.toLowerCase().includes("stock")
        );
        let preventaProduct = productsData.filter((product) =>
          product.vendor.toLowerCase().includes("preventa")
        );

        if (stockProduct) {
          let productID = stockProduct[0].id.split("/").pop();

          getProductInfo(
            productID,
            stockProduct[0].image,
            stockProduct[0].vendor
          );
        } else if (preventaProduct) {
          setError(
            "Producto encontrado solo en preventa. Duplicalo en stock previo al escaneo."
          );
        } else {
          setError(
            "SKU no encontrado en Shopify. Recuerda subir el producto al sistema previo al escaneo."
          );
        }
      } else {
        setError(
          "SKU no encontrado en Shopify. Recuerda subir el producto al sistema previo al escaneo."
        );
      }
    } catch (err) {
      console.log(error);
    }
  };

  const getProductInfo = async (productID, productImage, productVendor) => {
    try {
      const response = await axios.get(urlBack + `variantes/${productID}`);
      const productData = response.data;

      if (productData) {
        const product = {
          ...productData,
          image: productImage,
          vendor: productVendor,
        };

        setTimeout(() => {}, 1500);

        checkInventoryManagement(product);

        setProduct(product);
        setVariants(product.variants);
        setCantidad(product.variants[0]?.inventoryQuantity || 0); // Establece la cantidad inicial
      } else {
        setError("No se encontró el producto.");
      }
    } catch (err) {
      setError("Hubo un error en la solicitud.");
    }
  };

  const checkInventoryManagement = (producto) => {
    let variants = producto.variants;
    let hasInventoryManagement = true;
    let variantsWithoutInventoryManagement = [];

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      // Verificar si la variante NO tiene manejo de inventario o su política de inventario no es "deny"
      if (
        variant.inventory_management !== "shopify" ||
        variant.inventory_policy !== "deny"
      ) {
        hasInventoryManagement = false;
        variantsWithoutInventoryManagement.push(variant); // Guardar la variante que no cumple los criterios
      }
    }

    // Actualizar el estado
    setHasInventoryManagement(hasInventoryManagement);
    setVariantsWithoutInventoryManagement(variantsWithoutInventoryManagement); // Asume que tienes un setter para este estado
  };

  const updateInventoryManagement = async () => {
    const urlTemplate = urlBack + "setInventoryManagementTrue/"; // URL base

    try {
      for (
        let index = 0;
        index < variantsWithoutInventoryManagement.length;
        index++
      ) {
        const variant = variantsWithoutInventoryManagement[index];
        const variantId = variant.id; // Obtén el ID de la variante

        const url = `${urlTemplate}${variantId}`; // Construye la URL completa

        await axios.put(url);

        fetchProduct();

        console.log(
          `Manejo de inventario actualizado para la variante ${variantId}`
        );
      }
    } catch (error) {
      console.error(
        "Error al actualizar el manejo de inventario:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSearch = async () => {
    if (!searchSKU) return;

    setLoading(true);
    setError("");
    setProduct(null);
    setHasInventoryManagement(true);

    await fetchProduct();
    setLoading(false);
  };

  // Limpia el código SKU
  const limpiarCodigo = (codigo) => {
    if (codigo === undefined || codigo === null) {
      console.error("Código SKU es undefined o null");
      return "";
    }

    let cleanedCode = codigo.replace(/\D/g, "");
    cleanedCode = cleanedCode.slice(-16);
    return cleanedCode;
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    const captureWidth = 1280;
    const captureHeight = 210;

    canvas.width = captureWidth;
    canvas.height = captureHeight;

    context.drawImage(
      video,
      0,
      300,
      captureWidth,
      captureHeight,
      0,
      0,
      2260,
      360
    );

    const imageDataUrl = canvas.toDataURL("image/jpeg", 1.0);
    setImageSrc(imageDataUrl);
    extractText(imageDataUrl);
  };

  const extractText = async (imageDataUrl) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const img = new Image();
    img.src = imageDataUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      Tesseract.recognize(canvas, "eng")
        .then(({ data: { text } }) => {
          if (text) {
            const cleanedCode = limpiarCodigo(text);
            const newText = `${selectedValue}${cleanedCode}`;

            setSearchSKU(newText);
            fetchProduct();
          } else {
            console.error("Texto no encontrado en la imagen.");
          }
        })
        .catch((err) => {
          console.error("Error extracting text", err);
        });
    };
  };

  const handleSearchSKUChange = (event) => {
    // Obtener el valor del campo de entrada
    const inputValue = event.target.value;
    const textClean = limpiarCodigo(inputValue);
    // Concatenar el valor del selectedValue con el valor del campo de entrada
    const newSearchSKU = `${selectedValue}${textClean}`;
    // Actualizar el estado searchSKU
    setSearchSKU(newSearchSKU);
  };

  const setProductFromChild = () => {
    setProduct(null);
  };

  const options = [
    { label: "sw", value: "sw" },
    { label: "si", value: "si" },
    { label: "sz", value: "sz" },
    { label: "se", value: "se" },
    { label: "swdress", value: "swdress" },
    { label: "st", value: "st" },
    { label: "sf", value: "sf" },
    { label: "swswim", value: "swswim" },
    { label: "sS", value: "sS" },
    { label: "swvest", value: "swvest" },
    { label: "swblouse", value: "swblouse" },
    { label: "swbelt", value: "swbelt" },
    { label: "swshorts", value: "swshorts" },
    { label: "sg", value: "sg" },
    { label: "sc", value: "sc" },
    { label: "sWR", value: "sWR" },
    { label: "swskirt", value: "swskirt" },
    { label: "ri", value: "ri" },
    { label: "swtwop", value: "swtwop" },
    { label: "swtee", value: "swtee" },
  ];

  return (
    <div styles={styles.container}>
      <Accordion className="mb-3">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>1. Seleccionar prefijo</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={checkedItems[option.value] || false}
                  onChange={(e) => {
                    const newChecked = e.target.checked;

                    if (newChecked) {
                      // Si se selecciona este checkbox, deseleccionar todos los demás
                      setCheckedItems(
                        options.reduce((acc, opt) => {
                          acc[opt.value] = opt.value === option.value; // Solo este checkbox se selecciona
                          return acc;
                        }, {})
                      );
                      setSelectedValue(option.value); // Solo el valor del checkbox seleccionado
                    } else {
                      // Si se deselecciona, dejar el valor vacío
                      setCheckedItems((prev) => ({
                        ...prev,
                        [option.value]: false,
                      }));
                      setSelectedValue(""); // Limpiar el valor seleccionado
                    }
                  }}
                  name={option.value}
                />
              }
              label={option.label}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      <Accordion className="mb-3">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>2. Desplegar Scanner</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box style={styles.cameraContainer}>
              <video ref={videoRef} autoPlay style={styles.video}></video>
              <div style={styles.overlayTop}></div>
              <div style={styles.overlayBottom}></div>
              <div style={styles.overlayCenter}></div>
            </Box>
            <Box style={styles.imageContainer}>
              {imageSrc && (
                <img src={imageSrc} alt="captured" style={styles.image} />
              )}
            </Box>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={captureImage}
            disabled={loading || !selectedValue}
            sx={{ width: "100%" }}
          >
            <DocumentScannerIcon />
          </Button>
        </AccordionDetails>
      </Accordion>
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <TextField
          label="3. Buscar por SKU"
          variant="outlined"
          value={searchSKU}
          onChange={handleSearchSKUChange}
          fullWidth
          sx={{ maxWidth: 500, mb: 2 }}
        >
          {" "}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading || !searchSKU}
          sx={{ width: "100%", mb: 2 }}
        >
          <Search />
        </Button>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
        {loading && <CircularProgress />}
      </Box>

      {error && (
        <Typography color="error" align="center" mt={2}>
          {error}
        </Typography>
      )}

      {product && (
        <Paper
          elevation={3}
          sx={{ padding: 2, mt: 3, width: "100%", maxWidth: 600 }}
        >
          <Typography variant="h6" align="center">
            {product.title}
          </Typography>

          {product.image && product.image.src ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <img
                src={product.image.src}
                alt={product.image.altText}
                style={{ maxWidth: "100%", maxHeight: "300px" }}
              />
            </Box>
          ) : (
            <Typography align="center" color="textSecondary" mt={2}>
              No se encontró imagen para este producto.
            </Typography>
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Proveedor: {product.vendor}
          </Typography>

          {!hasInventoryManagment && (
            <Button
              variant="contained"
              color="primary"
              onClick={updateInventoryManagement}
              sx={{ mb: 2, width: "100%" }}
            >
              Manejar inventario para todas las variantes
            </Button>
          )}

          {product.variants.map((variant) => (
            <Box key={variant.id} sx={{ mt: 1 }}>
              <hr />
              <Typography variant="body2">
                <strong>ID:</strong> {variant.id}
              </Typography>
              <Typography variant="body2">
                <strong>Tamaño:</strong> {variant.title}
              </Typography>
              <Typography variant="body2">
                <strong>Cantidad en inventario:</strong>{" "}
                {variant.inventory_quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Manejo de Inventario:</strong>{" "}
                {variant.inventory_management !== null
                  ? "Cuenta con manejo de inventario"
                  : "No tiene manejo de Inventario"}
              </Typography>
            </Box>
          ))}

          <VarianteCantidad
            variants={variants}
            cantidad={cantidad}
            discartProductHandler={setProductFromChild}
            reSearchProduct={fetchProduct}
          />
        </Paper>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "80vh",
    margin: "0 ",
  },
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: "150px",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: 16,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "5%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  overlayCenter: {
    position: "absolute",
    top: "30%",
    left: "0",
    width: "100%",
    height: "35%",
    borderTop: "2px solid #FF0000	",
    boxSizing: "border-box",
    borderBottom: "2px solid #FF0000	",
  },
  imageContainer: {
    margin: "20px 0",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "grey",
  },
  image: {
    maxWidth: "100%",
    borderRadius: "4px",
  },
  select: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "#f1f1f1",
    height: "55px",
    marginBottom: "10px",
    width: "100%",
  },
  menuItem: {},
};

export default Scanner;
