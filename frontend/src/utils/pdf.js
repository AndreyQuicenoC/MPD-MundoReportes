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
 * Exporta estadísticas como PDF manteniendo EXACTAMENTE el diseño de la página web
 * NO modifica la página - captura el estado actual sin alteraciones
 * @param {Object} estadisticas - Datos de estadísticas
 * @param {HTMLElement} element - Elemento a convertir a PDF
 */
export const exportarEstadisticasPDF = async (estadisticas, element) => {
  try {
    // Clonar el elemento para no afectar la página original
    const clone = element.cloneNode(true);

    // Posicionar fuera de pantalla manteniendo las MISMAS dimensiones
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0px';
    clone.style.width = element.offsetWidth + 'px';
    clone.style.height = 'auto';
    clone.style.margin = '0';
    clone.style.padding = element.style.padding || '0';
    clone.style.background = 'white';

    // Copiar estilos críticos de ancho
    const computedStyle = window.getComputedStyle(element);
    clone.style.maxWidth = computedStyle.maxWidth;

    document.body.appendChild(clone);

    // Esperar a que el DOM se aplique
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ocultar solo los elementos que no deben verse en PDF
    const filtrosSection = clone.querySelector('.filtros-section');
    const exportBtn = clone.querySelector('[data-export-btn]');

    if (filtrosSection) {
      filtrosSection.classList.add('pdf-hide');
    }
    if (exportBtn) {
      exportBtn.classList.add('pdf-hide');
    }

    // Forzar opacidad completa en todos los elementos (excepto ocultos)
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      // Si ya está oculto con pdf-hide, respetarlo
      if (!el.classList.contains('pdf-hide')) {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('filter', 'none', 'important');
      }
    });

    // Esperar a que canvas de gráficos se completen
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capturar con máxima calidad - MANTENER EL ANCHO DEL CONTENEDOR
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: clone.offsetHeight,
      windowWidth: clone.offsetWidth, // Usar el ancho EXACTO del elemento original
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

    // Usar máxima calidad - PNG sin compresión
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Primera página
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);

    // Páginas adicionales si es necesario
    let heightLeft = imgHeight - pageHeightAvailable;

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + (imgHeight - heightLeft), availableWidth, imgHeight);
      heightLeft -= pageHeightAvailable;
    }

    const fechaActual = new Date().toLocaleDateString('es-CO');
    pdf.save(`Estadisticas-${fechaActual}.pdf`);
  } catch (error) {
    throw new Error('Error al generar el PDF de estadísticas: ' + error.message);
  }
};
