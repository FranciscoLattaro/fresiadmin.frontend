import React, { useState, useEffect } from "react";
//import '../estilos.css'
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { Search } from "@mui/icons-material";
import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";

//const URI = "https://back.fresiaserver.lat/";
const URI = "https://back.fresiaserver.lat/";

const CompImportarArticulos = () => {
  const [sku, setSku] = useState("");
  const [goodsId, setGoodsId] = useState(null);
  const [goodsName, setGoodsName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [images, setImages] = useState([]);
  const [talles, setTalles] = useState([]);
  const [tallesText, setTallesText] = useState("");
  const [tableInfo, setTableInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productLoaded, setProductLoaded] = useState(false);
  const [publicationType, setPublicationType] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [comparationPrice, setComparationPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tableHtml, setTableHtml] = useState("");

  const tallesOrder = ["XS", "S", "M", "L", "XL", "XXL"];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setProductLoaded(false);

      const response = await axios.get(`${URI}shein/${sku}`);

      if (response.data) {
        const { goods_id, goods_img, goods_name, retail_price, detail_image } =
          response.data;

        // Inserta la imagen goods_img como la primera del array de detail_image
        const mergedImages = [goods_img, ...detail_image];

        let cleanedGoodsName = goods_name;
        cleanedGoodsName = cleanedGoodsName.replace(/\bSHEIN\b/gi, "").trim();
        cleanedGoodsName = cleanedGoodsName
          .replace(/\b[A-Z]{3,}\b/g, "")
          .trim();

        setGoodsId(goods_id);
        setGoodsName(cleanedGoodsName);
        setRetailPrice(retail_price);
        setImages(mergedImages); // Ahora usamos mergedImages en lugar de detail_image

        // await delay(8000); // (si no es necesario, puedes eliminar esto)

        const detailResponse = await axios.get(
          `${URI}shein/details/${goods_id}`
        );
        if (detailResponse.data.info) {
          const tallesTable = detailResponse.data.info.attrSizeDict;
          const descriptionArr = detailResponse.data.info.productDetails;
          let resultText = "";
          for (let i = 0; i < descriptionArr.length; i++) {
            const current = descriptionArr[i];
            const next = descriptionArr[i + 1];

            resultText += `<b>${current.attr_name}: </b> ${current.attr_value}`;

            if (next) {
              resultText += `,<br> `;
            }
          }

          setDescription(resultText);
          setTableInfo(tallesTable);
          setTalles(Object.keys(tallesTable));
          setTallesText(generateTallesText(tallesTable));
        }

        setProductLoaded(true);
      } else {
        setError("No se encontraron artículos.");
      }
    } catch (error) {
      setError("Error al buscar el artículo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTallesText = (tallesTable) => {
    const talles = Object.keys(tallesTable);
    let tallesTxt = "";
    for (let i = 0; i < talles.length; i++) {
      const current = talles[i];
      const next = talles[i + 1];
      tallesTxt += current;
      if (next) {
        tallesTxt += ", ";
      }
    }
    return tallesTxt;
  };

  const convertInchesToCm = (inches) => (inches * 2.54).toFixed(1);

  const generateTableHtml = (tableInfo) => {
    if (!tableInfo || Object.keys(tableInfo).length === 0)
      return "<p>No hay información de talles.</p>";

    const sortedTalles = talles.sort((a, b) => {
      return tallesOrder.indexOf(a) - tallesOrder.indexOf(b);
    });

    const columnKeys = new Set();
    Object.values(tableInfo).forEach((infoArray) => {
      infoArray.forEach((item) => {
        columnKeys.add(Object.keys(item)[0].trim());
      });
    });
    const columns = Array.from(columnKeys);

    const headers = ["Talla", ...columns];

    let tableRows = sortedTalles
      .map((size) => {
        const sizeInfo = tableInfo[size] || [];
        const sizeData = columns.reduce((acc, column) => {
          acc[column] = "N/A";
          return acc;
        }, {});

        sizeInfo.forEach((item) => {
          const [key, value] = Object.entries(item)[0];
          const trimmedKey = key.trim();
          const trimmedValue = value.replace(" inch", "").trim();
          const cmValue = convertInchesToCm(parseFloat(trimmedValue) || 0);

          if (columns.includes(trimmedKey)) {
            sizeData[trimmedKey] = cmValue;
          }
        });

        return (
          `<tr key="${size}"><td>${size}</td>` +
          columns.map((column) => `<td>${sizeData[column]}</td>`).join("") +
          "</tr>"
        );
      })
      .join("");

    let tableHtmlString =
      '<br><div class="table-container" style="overflow-x: auto;"><table class="table table-bordered" style="width: 100%; min-width: 600px;"><thead><tr>';

    headers.forEach((header) => {
      tableHtmlString += `<th>${header}</th>`;
    });
    tableHtmlString += "</tr></thead><tbody>";

    tableHtmlString += tableRows;
    tableHtmlString += "</tbody></table></div>";

    return tableHtmlString;
  };

  useEffect(() => {
    if (Object.keys(tableInfo).length > 0) {
      const htmlString = generateTableHtml(tableInfo);
      setTableHtml(htmlString);
    }
  }, [tableInfo, talles]);

  const handleGoBack = () => {
    setSku("");
    setGoodsId(null);
    setGoodsName("");
    setRetailPrice("");
    setImages([]);
    setTalles([]);
    setTableInfo({});
    setProductLoaded(false);
  };

  const handlePublishToShopify = async () => {
    try {
      setLoading(true);
      console.log("Publicando en Shopify...");

      const variants = talles.map((size) => ({
        option1: size,
        price: customPrice,
        presentment_prices: [
          {
            price: {
              amount: customPrice,
              currency_code: "UYU",
            },
          },
        ],
        sku: `${sku}`,
      }));

      const productData = {
        title: goodsName,
        body_html: description + tableHtml,
        vendor: publicationType,
        type: "Clothes",
        variants: variants,
        images: images.map((image) => ({ src: image })),
        compareAtPrice: comparationPrice,
      };

      const response = await axios.post(`${URI}producto/nuevo/`, productData);
      setLoading(false);
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Producto publicado en Shopify!",
        });
        handleGoBack();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al publicar en Shopify.",
        });
      }
    } catch (error) {
      console.error("Error al publicar en Shopify:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al publicar en Shopify.",
      });
    }
  };

  const convertToUYP = (amountStr) => {
    const amount = parseFloat(amountStr.replace("$", "").trim());
    if (isNaN(amount) || amount < 0) {
      throw new Error("La cantidad debe ser un número positivo.");
    }
    const convertedAmount = amount * 40;
    return `$${convertedAmount.toFixed(2)}`;
  };

  const handleImageDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <div className="container mt-1">
      {!productLoaded ? (
        <>
          <TextField
            type="text"
            label="Buscar por SKU"
            variant="outlined"
            value={sku}
            id="sku"
            onChange={(e) => setSku(e.target.value)}
            fullWidth
            sx={{ maxWidth: 500, mb: 4 }}
          >
            {" "}
          </TextField>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ width: "100%", mb: 2 }}
          >
            <Search />
          </Button>
          {loading && (
            <div className="mt-3">
              <Spinner animation="border" />
              <p>Cargando...</p>
            </div>
          )}

          {error && <div className="mt-3 alert alert-danger">{error}</div>}
        </>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGoBack}
              sx={{ mb: 2, borderColor: "white" }}
            >
              <ArrowBackIcon />
            </Button>
          </Box>

          <div style={{ textAlign: "center" }}>
            {images && images.length > 0 ? (
              <div
              className="d-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)", // 4 columnas en pantallas grandes
                gap: "10px",
                justifyItems: "center",
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="position-relative"
                  style={{
                    width: "200px",
                    marginBottom: "15px",
                  }}
                >
                  <img
                    src={image}
                    alt={`Producto ${index}`}
                    className="img-fluid"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      maxWidth: "200px",
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleImageDelete(index)}
                    sx={{
                      position: "absolute",
                      bottom: "5px",
                      right: "-15px",
                      border: "none",
                      color: "black",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.0)",
                      },
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
            
            ) : (
              <p>No hay imágenes disponibles.</p>
            )}
          </div>

          <div>
            <div className="mb-3 mt-3">
              <TextField
                label="Título"
                variant="outlined"
                fullWidth
                id="goodsName"
                value={goodsName}
                onChange={(e) => setGoodsName(e.target.value)}
                required // Agrega esta propiedad si es un campo obligatorio
              />
            </div>
            <div className="mb-3 d-none">
              <label htmlFor="talles" className="form-label">
                Talles
              </label>
              <p dangerouslySetInnerHTML={{ __html: tallesText }}></p>
            </div>
            <div className="mb-3 d-none">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <input
                type="text"
                className="form-control"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <FormControl fullWidth variant="outlined">
                <InputLabel id="vendor-label">Proveedor</InputLabel>
                <Select
                  labelId="vendor-label"
                  id="publicationType"
                  value={publicationType}
                  onChange={(e) => setPublicationType(e.target.value)}
                  label="Proveedor"
                >
                  <MenuItem value="Preventa - accesorios">
                    Preventa - accesorios
                  </MenuItem>
                  <MenuItem value="Preventa- Bikinis">
                    Preventa - Bikinis
                  </MenuItem>
                  <MenuItem value="Preventa-Blazers">
                    Preventa - Blazers
                  </MenuItem>
                  <MenuItem value="Preventa-Cardigans-Jersey">
                    Preventa - Cardigans - Jersey
                  </MenuItem>
                  <MenuItem value="Preventa-Cases-Celulares">
                    Preventa - Cases - Celulares
                  </MenuItem>
                  <MenuItem value="Preventa-Chalecos-Camperas">
                    Preventa - Chalecos - Camperas
                  </MenuItem>
                  <MenuItem value="Preventa-Conjuntos">
                    Preventa - Conjuntos
                  </MenuItem>
                  <MenuItem value="Preventa-Fiesta">Preventa - Fiesta</MenuItem>
                  <MenuItem value="Preventa-Pantalones">
                    Preventa - Pantalones
                  </MenuItem>
                  <MenuItem value="Preventa-Pijamas-Medias-Pantuflas">
                    Preventa - Pijamas - Medias - Pantuflas
                  </MenuItem>
                  <MenuItem value="Preventa-Tops-Camisetas">
                    Preventa - Tops - Camisetas
                  </MenuItem>
                  <MenuItem value="Preventa-Verano">Preventa - Verano</MenuItem>
                  <MenuItem value="Preventa-Vestidos">
                    Preventa - Vestidos
                  </MenuItem>
                  <MenuItem value="Stock - Bikinis">Stock - Bikinis</MenuItem>
                  <MenuItem value="stock pijamas/medias/pantuflas">
                    Stock - Pijamas/Medias/Pantuflas
                  </MenuItem>
                  <MenuItem value="Stock-Blazers">Stock - Blazers</MenuItem>
                  <MenuItem value="Stock-Cardigans-Jersey">
                    Stock - Cardigans - Jersey
                  </MenuItem>
                  <MenuItem value="Stock-Cases-Celulares">
                    Stock - Cases - Celulares
                  </MenuItem>
                  <MenuItem value="Stock-Chalecos-Camperas">
                    Stock - Chalecos - Camperas
                  </MenuItem>
                  <MenuItem value="Stock-Conjuntos">Stock - Conjuntos</MenuItem>
                  <MenuItem value="Stock-Fiesta">Stock - Fiesta</MenuItem>
                  <MenuItem value="Stock-Pantalones">
                    Stock - Pantalones
                  </MenuItem>
                  <MenuItem value="Stock-Pijamas-Medias-Pantuflas">
                    Stock - Pijamas - Medias - Pantuflas
                  </MenuItem>
                  <MenuItem value="Stock-Plus-Size">Stock - Plus Size</MenuItem>
                  <MenuItem value="Stock-Tops-Camisetas">
                    Stock - Tops - Camisetas
                  </MenuItem>
                  <MenuItem value="Stock-Verano">Stock - Verano</MenuItem>
                  <MenuItem value="Stock-Vestidos">Stock - Vestidos</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="mb-3">
              <TextField
                label="Costo"
                variant="outlined"
                fullWidth
                id="retailPrice"
                value={convertToUYP(retailPrice)}
                onChange={(e) => setRetailPrice(e.target.value)}
                disabled
              />
            </div>
            <div className="mb-3">
              <TextField
                label="Precio"
                variant="outlined"
                fullWidth
                id="customPrice"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <TextField
                label="Comparar con"
                variant="outlined"
                fullWidth
                id="comparationPrice"
                value={comparationPrice}
                onChange={(e) => setComparationPrice(e.target.value)}
              />
            </div>

            <div
              className="mb-3 d-none"
              dangerouslySetInnerHTML={{ __html: tableHtml }}
            ></div>
          </div>

          <Button
            variant="contained" // Cambia el tipo de botón a "contained" para un fondo sólido
            color="success" // Usando el color "success" de MUI
            onClick={handlePublishToShopify}
            sx={{ marginTop: "16px", marginBottom: "16px" }} // Ajusta los márgenes según sea necesario
          >
            <DownloadIcon />
          </Button>
        </>
      )}
    </div>
  );
};

export default CompImportarArticulos;
