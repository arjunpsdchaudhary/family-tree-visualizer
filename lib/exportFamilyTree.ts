import { type Edge, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";

type ExportFormat = "png" | "svg" | "pdf" | "json";

const EXPORT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="78" height="78" viewBox="0 0 78 78">
      <rect width="78" height="78" rx="12" fill="#f1f5f9"/>
      <circle cx="39" cy="30" r="12" fill="#cbd5e1"/>
      <path d="M17 67c2-14 11-22 22-22s20 8 22 22" fill="#cbd5e1"/>
    </svg>
  `);

export async function exportFamilyTree(
  nodes: Node[],
  edges: Edge[],
  format: ExportFormat = "png",
) {
  // 1. JSON Export
  if (format === "json") {
    const exportData = { nodes, edges };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, "family-tree.json");
    return;
  }

  // 2. Target the active visible React Flow viewport on screen
  const viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;
  if (!viewport) {
    throw new Error("React Flow viewport not found on screen.");
  }

  const visibleNodes = nodes.filter((node) => !node.hidden);
  if (!visibleNodes.length) {
    throw new Error("No visible nodes to export.");
  }

  // 3. Calculate bounds from node data
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  visibleNodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.measured?.width ?? node.width ?? 280;
    const height = node.measured?.height ?? node.height ?? 120;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const padding = 150;
  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;
  const exportWidth = Math.ceil(treeWidth + padding * 2);
  const exportHeight = Math.ceil(treeHeight + padding * 2);

  // Get current viewport matrix transform values
  const viewportStyle = window.getComputedStyle(viewport);
  const transform = viewportStyle.transform;
  let currentZoom = 1;
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(",").map(Number);
    if (Number.isFinite(values[0]) && values[0] > 0) {
      currentZoom = values[0];
    }
  }

  // 4. Generate snapshot directly from viewport DOM
  const imageExportOptions = {
    backgroundColor: "#eff6ff", // matches bg-blue-50
    imagePlaceholder: EXPORT_IMAGE_PLACEHOLDER,
    cacheBust: false,
    width: exportWidth,
    height: exportHeight,
    style: {
      width: `${exportWidth}px`,
      height: `${exportHeight}px`,
      transform: `translate(${padding - minX}px, ${padding - minY}px) scale(1)`,
      transformOrigin: "0 0",
    },
  };

  if (format === "png") {
    const dataUrl = await toPng(viewport, {
      ...imageExportOptions,
      pixelRatio: 2,
    });
    download(dataUrl, "family-tree.png");
    return;
  }

  if (format === "svg") {
    const dataUrl = await toSvg(viewport, imageExportOptions);
    download(dataUrl, "family-tree.svg");
    return;
  }

  if (format === "pdf") {
    const dataUrl = await toPng(viewport, {
      ...imageExportOptions,
      pixelRatio: 2,
    });

    const pxToMm = 25.4 / 96;
    const pdfWidth = exportWidth * pxToMm;
    const pdfHeight = exportHeight * pxToMm;
    const orientation = pdfWidth > pdfHeight ? "landscape" : "portrait";

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save("family-tree.pdf");
    return;
  }
}

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}