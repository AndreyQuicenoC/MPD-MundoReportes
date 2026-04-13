import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export report details as PDF with 1cm margins
 * Captures directly from the visible DOM without cloning
 * @param {Object} reporte - Report data
 * @param {HTMLElement} element - Element to convert to PDF
 */
export const exportarReportePDF = async (reporte, element) => {
  try {
    // Save original state
    const originalStyles = {
      display: element.style.display,
      visibility: element.style.visibility,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      width: element.style.width,
    };

    try {
      // Prepare element for capture
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.position = 'absolute';
      element.style.top = '-10000px';
      element.style.left = '0';
      element.style.width = window.innerWidth + 'px';

      // Wait for everything to render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // html2canvas: capture directly from DOM
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
        windowWidth: window.innerWidth,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const availableWidth = pageWidth - margin * 2;
      const pageHeightAvailable = pageHeight - margin * 2;

      // Calculate height preserving proportions
      const imgHeight = (canvas.height * availableWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);

      // First page
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

      // Additional pages if necessary
      let heightLeft = imgHeight - pageHeightAvailable;
      let currentPageOffsetY = 0;

      while (heightLeft > 0) {
        currentPageOffsetY -= pageHeightAvailable;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + currentPageOffsetY, // Negative Y offset to show next portion
          availableWidth,
          imgHeight
        );
        heightLeft -= pageHeightAvailable;
      }

      // Download
      const fecha = new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO');
      pdf.save(`Reporte-${fecha}-${reporte.id}.pdf`);
    } finally {
      // GUARANTEE restoration (CRITICAL)
      element.style.display = originalStyles.display;
      element.style.visibility = originalStyles.visibility;
      element.style.position = originalStyles.position;
      element.style.top = originalStyles.top;
      element.style.left = originalStyles.left;
      element.style.width = originalStyles.width;
    }
  } catch (error) {
    throw new Error('Error generating PDF: ' + error.message);
  }
};

/**
 * Export statistics as PDF capturing everything together
 * WITHOUT dividing into sections - preserves exact page design
 * @param {HTMLElement} element - Element pdfRef (contains everything)
 */
export const exportarEstadisticasPDF = async (element) => {
  try {
    // Save original state
    const originalStyles = {
      display: element.style.display,
      visibility: element.style.visibility,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      width: element.style.width,
      background: element.style.background,
    };

    // Save original opacity of ALL elements
    const allElements = element.querySelectorAll('*');
    const originalOpacities = new Map();
    allElements.forEach(el => {
      originalOpacities.set(el, el.style.opacity);
    });

    try {
      // Prepare for capture
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.position = 'absolute';
      element.style.top = '-10000px';
      element.style.left = '0';
      element.style.width = window.innerWidth + 'px';
      element.style.background = 'white';

      // FORCE opacity 1 !important on ALL elements
      // This fixes the problem of blurry/opaque elements
      allElements.forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('filter', 'none', 'important');
      });

      // WAIT for Chart.js and other charts to render
      // 5 seconds is enough for all charts (Pie, Bar, Line, custom)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // CAPTURE ALL content at once
      // NO dividing into sections
      const canvas = await html2canvas(element, {
        scale: 3, // Maximum quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight, // REAL content height
        windowWidth: window.innerWidth, // Window width
        imageTimeout: 0, // No timeout
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const availableWidth = pageWidth - margin * 2;
      const pageHeightAvailable = pageHeight - margin * 2;

      // Calculate height preserving proportions
      const imgHeight = (canvas.height * availableWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);

      // First page
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

      // Additional pages if necessary (no forced breaks)
      // Content flows naturally across multiple pages
      let heightLeft = imgHeight - pageHeightAvailable;
      let currentPageOffsetY = 0;

      while (heightLeft > 0) {
        currentPageOffsetY -= pageHeightAvailable;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + currentPageOffsetY, // Negative Y offset to show next portion
          availableWidth,
          imgHeight
        );
        heightLeft -= pageHeightAvailable;
      }

      // Download
      const fechaActual = new Date().toLocaleDateString('es-CO');
      pdf.save(`Estadisticas-${fechaActual}.pdf`);
    } finally {
      // GARANTIZAR restauración de estilos (CRÍTICO)
      element.style.display = originalStyles.display;
      element.style.visibility = originalStyles.visibility;
      element.style.position = originalStyles.position;
      element.style.top = originalStyles.top;
      element.style.left = originalStyles.left;
      element.style.width = originalStyles.width;
      element.style.background = originalStyles.background;

      // Restaurar opacidad original de todos los elementos
      allElements.forEach(el => {
        const original = originalOpacities.get(el);
        el.style.opacity = original || '';
      });
    }
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
