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
    clone.style.top = '0px';
    clone.style.left = '-9999px';
    clone.style.width = element.offsetWidth + 'px';
    clone.style.margin = '0';
    clone.style.padding = '20px';
    clone.style.boxSizing = 'border-box';

    document.body.appendChild(clone);

    // Trigger de reflow
    clone.offsetHeight;

    // Esperar a que se renderice completamente
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Forzar visibilidad de todos los elementos
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('filter', 'none', 'important');
    });

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: clone.offsetHeight,
      windowWidth: clone.offsetWidth,
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

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

    // Páginas adicionales si es necesario
    let heightLeft = imgHeight - pageHeightAvailable;
    let pageNumber = 1;

    while (heightLeft > 0) {
      pageNumber++;
      pdf.addPage();
      const offsetY = (imgHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, margin + offsetY, availableWidth, imgHeight);
      heightLeft -= pageHeightAvailable;
    }

    const fecha = new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO');
    pdf.save(`Reporte-${fecha}-${reporte.id}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF: ' + error.message);
  }
};

/**
 * Exporta estadísticas como PDF con paginación por secciones
 * Cada fila de gráficos ocupa su propio espacio correctamente
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 10;
    const pageWidth = 210;
    const availableWidth = pageWidth - margin * 2;

    let isFirstPage = true;

    // Función auxiliar para capturar una sección
    const capturarSeccion = async (sectionElement, elemento) => {
      if (!sectionElement) return;

      const clone = sectionElement.cloneNode(true);

      // Estilos para el clon
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = elemento.offsetWidth + 'px';
      clone.style.background = 'white';
      clone.style.zIndex = '10000';
      clone.style.margin = '0';
      clone.style.padding = '20px';
      clone.style.boxSizing = 'border-box';

      // Copiar estilos computados críticos
      const computedStyle = window.getComputedStyle(sectionElement);
      clone.style.maxWidth = computedStyle.maxWidth;
      clone.style.fontFamily = computedStyle.fontFamily;

      document.body.appendChild(clone);

      // Forzar reflow
      clone.offsetHeight;

      // Esperar a que Chart.js se renderice (3-4 segundos para gráficos complejos)
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Forzar opacidad y visibilidad
      clone.querySelectorAll('*').forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('filter', 'none', 'important');
      });

      // Capturar con html2canvas
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: clone.offsetHeight,
        windowWidth: clone.offsetWidth,
        imageTimeout: 0, // Sin timeout
      });

      document.body.removeChild(clone);

      // Calcular dimensiones para PDF
      const imgHeight = (canvas.height * availableWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Agregar a PDF
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }

      // Si la imagen es muy grande para una página, dividirla
      const pageHeight = 297;
      const pageHeightAvailable = pageHeight - margin * 2;

      if (imgHeight > pageHeightAvailable) {
        // Agregar completo pero en múltiples páginas
        pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

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
      } else {
        pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);
      }
    };

    // Capturar secciones en orden
    const statsCards = element.querySelector('.stats-cards');
    const chartsGrid = element.querySelector('.charts-grid');

    // 1. Tarjetas de estadísticas
    await capturarSeccion(statsCards, element);

    // 2. Cada gráfico por separado
    if (chartsGrid) {
      const chartCards = chartsGrid.querySelectorAll('.chart-card');

      for (let i = 0; i < chartCards.length; i++) {
        await capturarSeccion(chartCards[i], element);
      }
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
