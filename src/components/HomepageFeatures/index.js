import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DownloadIcon from '@mui/icons-material/Download';
import InsightsIcon from '@mui/icons-material/Insights';

const FeatureList = [
  {
    title: 'Escáner QR',
    Svg: () => <QrCodeScannerIcon style={{ fontSize: '4em', marginBottom: '.5em' }} />, // Icono de escáner QR con tamaño 4em
    description: (
      <>
        Funcionalidad que permite el escaneo de códigos de productos importados, y su actualización en nuestro inventario. Mediante una integración con Shopify.
      </>
    ),
  },
  {
    title: 'Importación desde SHEIN',
    Svg: () => <DownloadIcon style={{ fontSize: '4em', marginBottom: '.5em' }} />, // Icono de descarga con tamaño 4em
    description: (
      <>
        Funcionalidad que permite la importación de productos desde SHEIN hacia Shopify, de forma muy simple.
      </>
    ),
  },
  {
    title: 'Informes de Inventario',
    Svg: () => <InsightsIcon style={{ fontSize: '4em', marginBottom: '.5em' }} />, // Icono de gráficas con tamaño 4em
    description: (
      <>
        Funcionalidad que nos permite controlar las cantidades ingresadas por fecha, así como los motivos o razones de los movimientos de stock (log). Gráficas de adición y reducción de inventario.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row ">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
