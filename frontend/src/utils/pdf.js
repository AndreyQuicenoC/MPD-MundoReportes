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
 * NO modifica la página - captura el estado actual exactamente como se ve
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    // Clonar el elemento para no afectar la página original
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.width = element.offsetWidth + 'px';
    document.body.appendChild(clone);

    // Ocultar solo los elementos que no deben verse en PDF
    // Usar selectores específicos en el clon
    const filtrosSection = clone.querySelector('.filtros-section');
    const exportBtn = clone.querySelector('[data-export-btn]');

    if (filtrosSection) {
      filtrosSection.classList.add('pdf-hide');
    }
    if (exportBtn) {
      exportBtn.classList.add('pdf-hide');
    }

    // Forzar que todo sea visible (excepto lo que ocultamos)
    const allElements = clone.querySelectorAll('*');
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

    // Restaurar display: none para elementos marcados con pdf-hide
    clone.querySelectorAll('.pdf-hide').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });

    // Esperar a que canvas de gráficos se completen
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capturar con máxima calidad - HTML2Canvas respetará el DOM clonado
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: clone.offsetHeight,
      windowWidth: clone.offsetWidth,
    });

    // Remover el clon
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
    // Usar máxima calidad - PNG sin compresión
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

    // Páginas adicionales si es necesario
    let heightLeft = imgHeight - pageHeightAvailable;

    while (heightLeft > 0) {
      currentY = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + currentY, availableWidth, imgHeight);
      heightLeft -= pageHeightAvailable;
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
