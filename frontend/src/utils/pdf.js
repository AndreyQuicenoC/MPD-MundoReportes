import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatearMoneda } from './reportes';

/**
 * Exporta el detalle del reporte como PDF con márgenes de 1cm
 * @param {Object} reporte - Datos del reporte
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarReportePDF = async (reporte, element) => {
  try {
    // Preparar elemento para captura
    const clone = element.cloneNode(true);
    clone.style.background = 'white';
    clone.style.display = 'block';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(clone);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Márgenes 10mm (1cm) por lado
    const margin = 10;
    const pageWidth = 210;
    const pageHeight = 297;
    const availableWidth = pageWidth - margin * 2;

    // Calcular altura proporcionalmente
    const imgHeight = (canvas.height * availableWidth) / canvas.width;
    const pageHeightAvailable = pageHeight - margin * 2;

    let currentY = 0;
    const imgData = canvas.toDataURL('image/png');

    // Primera página
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

    // Páginas adicionales si es necesario
    let heightLeft = imgHeight - pageHeightAvailable;
    let pageNumber = 1;

    while (heightLeft > 0) {
      currentY = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + currentY, availableWidth, imgHeight);
      heightLeft -= pageHeightAvailable;
      pageNumber++;
    }

    const fecha = new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO');
    pdf.save(`Reporte-${fecha}-${reporte.id}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF: ' + error.message);
  }
};

/**
 * Exporta estadísticas como PDF con máxima calidad y colores vibrantes
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    // Forzar que todo sea visible
    const allElements = element.querySelectorAll('*');
    const originalStyles = new Map();

    allElements.forEach(el => {
      originalStyles.set(el, {
        opacity: el.style.opacity,
        display: el.style.display,
        visibility: el.style.visibility,
      });

      // Usar setProperty con !important para sobreescribir cualquier CSS
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('filter', 'none', 'important');
    });

    // Esperar a que canvas de gráficos se completen
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capturar con máxima calidad
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: element.offsetHeight,
      windowWidth: element.offsetWidth,
    });

    // Restaurar estilos
    allElements.forEach(el => {
      const original = originalStyles.get(el);
      if (original) {
        el.style.opacity = original.opacity || '';
        el.style.display = original.display || '';
        el.style.visibility = original.visibility || '';
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Márgenes 10mm (1cm) por lado
    const margin = 10;
    const pageWidth = 210;
    const pageHeight = 297;
    const availableWidth = pageWidth - margin * 2;

    // Calcular altura proporcionalmente
    const imgHeight = (canvas.height * availableWidth) / canvas.width;
    const pageHeightAvailable = pageHeight - margin * 2;

    let currentY = 0;
    // Usar máxima calidad - PNG sin compresión
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

    // Páginas adicionales si es necesario
    let heightLeft = imgHeight - pageHeightAvailable;
    let pageNumber = 1;

    while (heightLeft > 0) {
      currentY = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + currentY, availableWidth, imgHeight);
      heightLeft -= pageHeightAvailable;
      pageNumber++;
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
