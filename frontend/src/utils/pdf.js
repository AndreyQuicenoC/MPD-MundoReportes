import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta el detalle del reporte como PDF con márgenes de 1cm
 * Captura directamente del DOM visible sin clonar
 * @param {Object} reporte - Datos del reporte
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarReportePDF = async (reporte, element) => {
  try {
    // Guardar estado original
    const originalStyles = {
      display: element.style.display,
      visibility: element.style.visibility,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      width: element.style.width,
    };

    try {
      // Preparar elemento para captura
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.position = 'absolute';
      element.style.top = '-10000px';
      element.style.left = '0';
      element.style.width = window.innerWidth + 'px';

      // Esperar a que todo se renderice
      await new Promise(resolve => setTimeout(resolve, 2000));

      // html2canvas: capturar directamente del DOM
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
        windowWidth: window.innerWidth,
      });

      // Crear PDF
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

      // Calcular altura preservando proporciones
      const imgHeight = (canvas.height * availableWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Primera página
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

      // Páginas adicionales si es necesario
      let heightLeft = imgHeight - pageHeightAvailable;
      let currentPageOffsetY = 0;

      while (heightLeft > 0) {
        currentPageOffsetY -= pageHeightAvailable;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + currentPageOffsetY, // Offset Y negativo para mostrar siguiente porción
          availableWidth,
          imgHeight
        );
        heightLeft -= pageHeightAvailable;
      }

      // Descargar
      const fecha = new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO');
      pdf.save(`Reporte-${fecha}-${reporte.id}.pdf`);
    } finally {
      // GARANTIZAR restauración (CRÍTICO)
      element.style.display = originalStyles.display;
      element.style.visibility = originalStyles.visibility;
      element.style.position = originalStyles.position;
      element.style.top = originalStyles.top;
      element.style.left = originalStyles.left;
      element.style.width = originalStyles.width;
    }
  } catch (error) {
    throw new Error('Error al generar el PDF: ' + error.message);
  }
};

/**
 * Exporta estadísticas como PDF capturando TODO junto
 * SIN dividir en secciones - preserva el diseño exacto de la página
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento pdfRef (contiene todo)
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    // Guardar estado original
    const originalStyles = {
      display: element.style.display,
      visibility: element.style.visibility,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      width: element.style.width,
      background: element.style.background,
    };

    // Guardar opacidad original de TODOS los elementos
    const allElements = element.querySelectorAll('*');
    const originalOpacities = new Map();
    allElements.forEach(el => {
      originalOpacities.set(el, el.style.opacity);
    });

    try {
      // Preparar para captura
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.position = 'absolute';
      element.style.top = '-10000px';
      element.style.left = '0';
      element.style.width = window.innerWidth + 'px';
      element.style.background = 'white';

      // FORZAR opacidad 1 !important en TODOS los elementos
      // Esto arregla el problema de elementos borrosos/opacos
      allElements.forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('filter', 'none', 'important');
      });

      // ESPERAR a que Chart.js y otros gráficos se renderizen
      // 5 segundos es suficiente para todos los gráficos (Pie, Bar, Line, custom)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Capturar TODO el contenido de una sola vez
      // NO dividir en secciones
      const canvas = await html2canvas(element, {
        scale: 3, // Máxima calidad
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight, // Altura REAL del contenido
        windowWidth: window.innerWidth, // Ancho de ventana
        imageTimeout: 0, // Sin timeout
      });

      // Crear PDF
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

      // Calcular altura preservando proporciones
      const imgHeight = (canvas.height * availableWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Primera página
      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

      // Páginas adicionales si es necesario (sin saltos forzados)
      // El contenido fluye naturalmente en múltiples páginas
      let heightLeft = imgHeight - pageHeightAvailable;
      let currentPageOffsetY = 0;

      while (heightLeft > 0) {
        currentPageOffsetY -= pageHeightAvailable;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + currentPageOffsetY, // Offset Y negativo para mostrar siguiente porción
          availableWidth,
          imgHeight
        );
        heightLeft -= pageHeightAvailable;
      }

      // Descargar
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
