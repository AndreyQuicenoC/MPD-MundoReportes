import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatearMoneda } from './reportes';

/**
 * Opciones optimizadas para captura de html2canvas
 * Asegura colores vibrantes y buen rendering
 */
const getCanvas2Options = () => ({
  scale: 2,
  useCORS: true,
  allowTaint: true,
  logging: false,
  backgroundColor: '#ffffff',
  // NO usar foreignObjectRendering ni onclone con gráficos
});

/**
 * Exporta el detalle del reporte como PDF con márgenes de 1cm
 * @param {Object} reporte - Datos del reporte
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarReportePDF = async (reporte, element) => {
  try {
    console.log('Generando PDF de reporte...');

    const canvas = await html2canvas(element, getCanvas2Options());

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
 * Diseñada para capturar gráficos de Chart.js correctamente
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    console.log('Generando PDF de estadísticas...');
    console.log('Elemento a capturar:', element);

    // Esperar a que los gráficos se rendericen completamente
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Opciones simplificadas para html2canvas
    // Evitar problemas con canvas clonado
    const options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      // NO usar onclone ni foreignObjectRendering con gráficos Chart.js
    };

    console.log('Capturando canvas con opciones:', options);
    const canvas = await html2canvas(element, options);
    console.log('Canvas capturado exitosamente');

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

    console.log('Agregando imagen a PDF...');
    console.log(`Altura total imagen: ${imgHeight}mm, Altura página: ${pageHeightAvailable}mm`);

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
    let pageCount = 1;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      console.log(`Agregando página ${pageCount + 1}...`);
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
      pageCount++;
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
    console.log(`PDF de estadísticas generado exitosamente (${pageCount} páginas)`);
  } catch (error) {
    console.error('Error al generar PDF de estadísticas:', error);
    console.error('Stack:', error.stack);
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
