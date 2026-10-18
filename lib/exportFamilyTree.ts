import { type Edge, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";

type ExportFormat = "png" | "svg" | "pdf" | "json";

/*
- =========================================================
- EXPORT IMAGE PLACEHOLDER
- =========================================================
 *
- This is used when html-to-image cannot fetch an external
- image (such as Vercel Blob images).
 */

const EXPORT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="78"
      height="78"
      viewBox="0 0 78 78"
    >
      <rect
        width="78"
        height="78"
        rx="12"
        fill="#f1f5f9"
      />

      <circle
        cx="39"
        cy="30"
        r="12"
        fill="#cbd5e1"
      />

      <path
        d="M17 67c2-14 11-22 22-22s20 8 22 22"
        fill="#cbd5e1"
      />
    </svg>
  `);

function getImageExportOptions() {
  return {
    backgroundColor: "#ffffff",
    imagePlaceholder: EXPORT_IMAGE_PLACEHOLDER,
    cacheBust: false,
  };
}

/*
- =========================================================
- EXPORT FUNCTION
- =========================================================
 */

export async function exportFamilyTree(
  nodes: Node[],
  edges: Edge[],
  format: ExportFormat = "png",
) {
  // ==================================================
  // 1. Find export React Flow container
  // ==================================================

  const exportRoot = document.querySelector(
    "#family-tree-export",
  ) as HTMLElement | null;

  if (!exportRoot) {
    throw new Error("Export container not found.");
  }

  const reactFlow = exportRoot.querySelector(
    ".react-flow",
  ) as HTMLElement | null;

  if (!reactFlow) {
    throw new Error("Export React Flow not found.");
  }

  const viewport = exportRoot.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;

  if (!viewport) {
    throw new Error("React Flow viewport not found.");
  }

  // ==================================================
  // 2. JSON Export
  // ==================================================

  if (format === "json") {
    const exportData = {
      nodes,
      edges,
    };

    const json = JSON.stringify(exportData, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    downloadBlob(blob, "family-tree.json");

    console.log("Family tree JSON export completed.");

    return;
  }

  // ==================================================
  // 3. Get visible nodes
  // ==================================================

  const visibleNodes = nodes.filter((node) => !node.hidden);

  if (!visibleNodes.length) {
    throw new Error("No visible nodes to export.");
  }

  // ==================================================
  // 4. Calculate actual visual bounds from Node Data
  // (Bulletproof on mobile & desktop, avoids getBoundingClientRect bugs)
  // ==================================================

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  visibleNodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    
    // Fallback widths/heights if DOM hasn't fully measured yet
    const width = node.measured?.width ?? node.width ?? 280;
    const height = node.measured?.height ?? node.height ?? 120;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  // ==================================================
  // 5. Safety check
  // ==================================================

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    throw new Error("Could not calculate visual tree bounds.");
  }

  // ==================================================
  // 6. Padding & Dimensions
  // ==================================================

  const padding = 200;

  const treeWidth = maxX - minX;

  const treeHeight = maxY - minY;

  const exportWidth = Math.ceil(treeWidth + padding * 2);

  const exportHeight = Math.ceil(treeHeight + padding * 2);

  console.log("ACTUAL BOUNDS:", { minX, minY, maxX, maxY, treeWidth, treeHeight });
  console.log("EXPORT SIZE:", { exportWidth, exportHeight });

  // ==================================================
  // 7. Save original styles
  // ==================================================

  const originalWidth = reactFlow.style.width;

  const originalHeight = reactFlow.style.height;

  const originalOverflow = reactFlow.style.overflow;

  const originalTransform = viewport.style.transform;

  const originalTransformOrigin = viewport.style.transformOrigin;

  try {
    // =================================================
    // 8. Set exact export canvas size
    // =================================================

    reactFlow.style.width = `${exportWidth}px`;

    reactFlow.style.height = `${exportHeight}px`;

    reactFlow.style.overflow = "hidden";

    // =================================================
    // 9. Translate viewport to align tree with padding
    // =================================================

    const translateX = padding - minX;

    const translateY = padding - minY;

    viewport.style.transformOrigin = "0 0";

    viewport.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(1)`;

    // =================================================
    // 10. Wait for browser paint
    // =================================================

    await waitForRender();

    const imageExportOptions = getImageExportOptions();

    // =================================================
    // 11. Export PNG
    // =================================================

    if (format === "png") {
      console.log("Starting PNG export...");

      const dataUrl = await toPng(reactFlow, {
        ...imageExportOptions,
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          overflow: "hidden",
        },
      });

      download(dataUrl, "family-tree.png");

      console.log("Family tree PNG export completed.");

      return;
    }

    // =================================================
    // 12. Export SVG
    // =================================================

    if (format === "svg") {
      console.log("Starting SVG export...");

      const dataUrl = await toSvg(reactFlow, {
        ...imageExportOptions,
        width: exportWidth,
        height: exportHeight,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          overflow: "hidden",
        },
      });

      download(dataUrl, "family-tree.svg");

      console.log("Family tree SVG export completed.");

      return;
    }

    // =================================================
    // 13. Export PDF
    // =================================================

    if (format === "pdf") {
      console.log("Starting PDF export...");

      const dataUrl = await toPng(reactFlow, {
        ...imageExportOptions,
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          overflow: "hidden",
        },
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

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );

      pdf.save("family-tree.pdf");

      console.log("Family tree PDF export completed.");

      return;
    }

    throw new Error(`Unsupported export format: ${format}`);
  } catch (error) {
    console.error("Family tree export failed:", error);

    if (error instanceof Error) {
      console.error("Export error message:", error.message);
      console.error("Export error stack:", error.stack);
    }

    throw error;
  } finally {
    // =================================================
    // 14. ALWAYS restore React Flow styles
    // =================================================

    reactFlow.style.width = originalWidth;

    reactFlow.style.height = originalHeight;

    reactFlow.style.overflow = originalOverflow;

    viewport.style.transform = originalTransform;

    viewport.style.transformOrigin = originalTransformOrigin;
  }
}

// ====================================================
// Wait for browser paint
// ====================================================

function waitForRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

// ====================================================
// Download data URL
// ====================================================

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ====================================================
// Download Blob
// ====================================================

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