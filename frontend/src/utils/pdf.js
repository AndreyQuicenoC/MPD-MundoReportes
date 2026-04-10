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
      // Usar position absolute fuera de pantalla en TOP (no left/right)
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

      while (heightLeft > 0) {
        pdf.addPage();
        const offsetY = imgHeight - heightLeft;
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
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
 * Exporta estadísticas como PDF capturando directamente del DOM
 * Cada sección obtiene su propia página
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 10;
    const pageWidth = 210;
    const availableWidth = pageWidth - margin * 2;

    let isFirstPage = true;

    // Función para capturar y agregar sección al PDF
    const capturarYAgregarSeccion = async (section) => {
      if (!section) return;

      // Guardar estilos originales
      const originalStyles = {
        display: section.style.display,
        visibility: section.style.visibility,
        position: section.style.position,
        top: section.style.top,
        left: section.style.left,
        width: section.style.width,
        zIndex: section.style.zIndex,
      };

      try {
        // Preparar para captura
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.style.position = 'absolute';
        section.style.top = '-10000px';
        section.style.left = '0';
        section.style.width = window.innerWidth + 'px';
        section.style.zIndex = 'auto';

        // ESPERAR a que Chart.js renderice (4 segundos)
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Capturar directamente del DOM
        const canvas = await html2canvas(section, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowHeight: section.scrollHeight,
          windowWidth: window.innerWidth,
          imageTimeout: 0,
        });

        // Convertir canvas a imagen
        const imgHeight = (canvas.height * availableWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png', 1.0);

        // Agregar al PDF
        if (isFirstPage) {
          // Primera sección en página 1
          pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);
          isFirstPage = false;
        } else {
          // Secciones siguientes en nuevas páginas
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);
        }
      } finally {
        // GARANTIZAR restauración de estilos (CRÍTICO)
        section.style.display = originalStyles.display;
        section.style.visibility = originalStyles.visibility;
        section.style.position = originalStyles.position;
        section.style.top = originalStyles.top;
        section.style.left = originalStyles.left;
        section.style.width = originalStyles.width;
        section.style.zIndex = originalStyles.zIndex;
      }
    };

    // Capturar secciones en orden
    const statsCards = element.querySelector('.stats-cards');
    const chartsGrid = element.querySelector('.charts-grid');

    // 1. Tarjetas de estadísticas (primera página)
    if (statsCards) {
      await capturarYAgregarSeccion(statsCards);
    }

    // 2. Cada gráfico por separado (en nuevas páginas)
    if (chartsGrid) {
      const chartCards = chartsGrid.querySelectorAll('.chart-card');

      for (let i = 0; i < chartCards.length; i++) {
        await capturarYAgregarSeccion(chartCards[i]);
      }
    }

    // Descargar PDF
    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
