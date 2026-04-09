import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatearMoneda } from './reportes';

/**
 * Opciones optimizadas para captura de html2canvas
 * Asegura colores vibrantes y buen rendering
 */
const getCanvas2Options = () => ({
  scale: 3, // Mayor escala para mejor calidad
  useCORS: true,
  allowTaint: true,
  logging: false,
  backgroundColor: '#ffffff',
  windowHeight: document.documentElement.scrollHeight,
  windowWidth: document.documentElement.scrollWidth,
  // Opciones para mejor rendering de colores
  imageTimeout: 0,
  removeContainer: true,
  foreignObjectRendering: true,
});

/**
 * Exporta el detalle del reporte como PDF con márgenes de 1cm
 * @param {Object} reporte - Datos del reporte
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarReportePDF = async (reporte, element) => {
  try {
    console.log('Generando PDF de reporte...');

    // Crear elemento temporal para captura
    const tempElement = element.cloneNode(true);
    tempElement.style.background = 'white';
    tempElement.style.padding = '0';
    tempElement.style.margin = '0';

    const canvas = await html2canvas(tempElement, getCanvas2Options());

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Márgenes de 1cm (10mm por lado)
    const marginLeft = 10;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Ancho disponible después de márgenes
    const availableWidth = pageWidth - marginLeft - marginRight;

    // Calcular altura de la imagen manteniendo proporción
    const imgHeight = (canvas.height * availableWidth) / canvas.width;
    const pageHeightAvailable = pageHeight - marginTop - marginBottom;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(
      imgData,
      'PNG',
      marginLeft,
      marginTop + position,
      availableWidth,
      imgHeight
    );
    heightLeft -= pageHeightAvailable;

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        marginLeft,
        marginTop + position,
        availableWidth,
        imgHeight
      );
      heightLeft -= pageHeightAvailable;
    }

    const fecha = new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO');
    pdf.save(`Reporte-${fecha}-${reporte.id}.pdf`);
    console.log('PDF generado exitosamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};

/**
 * Exporta las estadísticas como PDF con márgenes de 1cm
 * Arreglo para colores vibrantes y mejor calidad de impresión
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    console.log('Generando PDF de estadísticas...');

    // Crear elemento temporal para captura
    const tempElement = element.cloneNode(true);
    tempElement.style.background = 'white';
    tempElement.style.padding = '0';
    tempElement.style.margin = '0';

    // Forzar visibilidad de todos los elementos
    const allElements = tempElement.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });

    console.log('Capturando canvas...');
    const canvas = await html2canvas(tempElement, {
      ...getCanvas2Options(),
      // Opciones específicas para estadísticas
      onclone: (document) => {
        // Asegurar que todos los elementos sean visibles y con colores completos
        const elements = document.querySelectorAll('[class*="stat"], [class*="chart"], [class*="card"]');
        elements.forEach(el => {
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.textShadow = 'none';
        });
      },
    });

    console.log('Canvas capturado, calculando PDF...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Márgenes de 1cm (10mm por lado)
    const marginLeft = 10;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Ancho disponible después de márgenes
    const availableWidth = pageWidth - marginLeft - marginRight;

    // Calcular altura de la imagen manteniendo proporción
    const imgHeight = (canvas.height * availableWidth) / canvas.width;
    const pageHeightAvailable = pageHeight - marginTop - marginBottom;

    let heightLeft = imgHeight;
    let position = 0;

    // Usar calidad máxima para la imagen
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(
      imgData,
      'PNG',
      marginLeft,
      marginTop,
      availableWidth,
      imgHeight
    );
    heightLeft -= pageHeightAvailable;

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        marginLeft,
        marginTop + position,
        availableWidth,
        imgHeight
      );
      heightLeft -= pageHeightAvailable;
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
    console.log('PDF de estadísticas generado exitosamente');
  } catch (error) {
    console.error('Error al generar PDF de estadísticas:', error);
    throw new Error('Error al generar el PDF de estadísticas');
  }
};
