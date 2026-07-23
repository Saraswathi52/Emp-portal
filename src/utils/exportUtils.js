import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (title, columns, data, filters = {}) => {
  // Create landscape PDF
  const doc = new jsPDF("l", "mm", "a4");
  
  // Add company name and title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("PeopleCore", 14, 22);
  
  doc.setFontSize(14);
  doc.text(`${title} Report`, 14, 30);
  
  // Add generated date/time
  const generatedTime = new Date().toLocaleString();
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${generatedTime}`, 14, 36);
  
  // Add filters if any
  let startY = 42;
  const filterKeys = Object.keys(filters).filter(k => filters[k] && filters[k] !== "All" && filters[k] !== "");
  if (filterKeys.length > 0) {
    const filterText = filterKeys.map(k => `${k}: ${filters[k]}`).join(" | ");
    doc.text(`Filters: ${filterText}`, 14, 42);
    startY = 48;
  }
  
  doc.text(`Total Records: ${data.length}`, 14, startY);
  startY += 6;

  // Prepare table headers and rows
  const tableCols = columns.map(col => col.label);
  const tableRows = data.map(row => {
    return columns.map(col => {
      if (row[col.key] !== undefined) return String(row[col.key] || "-");
      const targetRow = row._original || row;
      return typeof col.extract === 'function' ? String(col.extract(targetRow) || "-") : String(targetRow[col.key] || "-");
    });
  });

  autoTable(doc, {
    startY: startY,
    head: [tableCols],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 20 },
    didDrawPage: function (data) {
      // Add page numbers
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    },
  });

  // Download
  const filename = `${title.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};

export const exportToExcel = (title, columns, data, filters = {}) => {
  const wb = XLSX.utils.book_new();
  
  // Create worksheet data array
  const wsData = [];
  
  // Title and metadata
  wsData.push(["PeopleCore - " + title + " Report"]);
  wsData.push([`Generated on: ${new Date().toLocaleString()}`]);
  
  const filterKeys = Object.keys(filters).filter(k => filters[k] && filters[k] !== "All" && filters[k] !== "");
  if (filterKeys.length > 0) {
    const filterText = filterKeys.map(k => `${k}: ${filters[k]}`).join(" | ");
    wsData.push([`Filters: ${filterText}`]);
  }
  
  wsData.push([`Total Records: ${data.length}`]);
  wsData.push([]); // Empty row
  
  // Headers
  const headerRow = columns.map(col => col.label);
  wsData.push(headerRow);
  
  // Data rows
  data.forEach(row => {
    const rowData = columns.map(col => {
      if (row[col.key] !== undefined) return String(row[col.key] || "-");
      const targetRow = row._original || row;
      return typeof col.extract === 'function' ? String(col.extract(targetRow) || "-") : String(targetRow[col.key] || "-");
    });
    wsData.push(rowData);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Auto-size columns based on maximum character length
  const colWidths = [];
  for (let i = 0; i < headerRow.length; i++) {
    let max = headerRow[i].length;
    for (let j = 5; j < wsData.length; j++) { // starting from header row
      const val = wsData[j][i] ? wsData[j][i].toString() : "";
      if (val.length > max) max = val.length;
    }
    colWidths.push({ wch: max + 2 }); // Add some padding
  }
  ws["!cols"] = colWidths;
  
  // Add auto-filter to the header row (assuming header is row index 4 or 5 depending on filters length)
  const headerRowIndex = wsData.findIndex(row => row === headerRow);
  if (headerRowIndex !== -1) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    range.s.r = headerRowIndex;
    ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };
  }

  // Make header row bold (Note: SheetJS community version doesn't export cell styles properly for XLSX without Pro, but standard format is good)
  // We place it anyway just in case someone opens it in an environment that reads cell types
  
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Sheet name max length is 31
  
  const filename = `${title.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};
