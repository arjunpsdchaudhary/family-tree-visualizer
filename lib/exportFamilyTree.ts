import { type Edge, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";

type ExportFormat = "png" | "svg" | "pdf" | "json";

/*
 * =========================================================
 * EXPORT IMAGE PLACEHOLDER
 * =========================================================
 *
 * This is used when html-to-image cannot fetch an external
 * image.
 *
 * This is especially important for Vercel Blob images:
 *
 * https://xxxxx.public.blob.vercel-storage.com/...
 *
 * If one of those images is temporarily unavailable,
 * the whole diagram export should NOT fail.
 *
 * Instead, html-to-image will use this placeholder.
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

/*
 * =========================================================
 * EXPORT OPTIONS
 * =========================================================
 *
 * All image exports use the same options.
 *
 * IMPORTANT:
 *
 * cacheBust is intentionally false.
 *
 * Your Vercel Blob URLs already contain query parameters,
 * for example:
 *
 * ?1791273245965
 *
 * Adding another cache-busting value during export causes
 * html-to-image to make a new request for every image.
 *
 * If the network is unstable, this can create many
 * unnecessary image fetch failures.
 */

function getImageExportOptions() {
  return {
    backgroundColor: "#ffffff",

    /*
     * If an external image cannot be fetched, use the
     * placeholder instead of rejecting the whole export.
     */
    imagePlaceholder: EXPORT_IMAGE_PLACEHOLDER,

    /*
     * Do not force another cache-busting request.
     */
    cacheBust: false,
  };
}

/*
 * =========================================================
 * EXPORT FUNCTION
 * =========================================================
 */

export async function exportFamilyTree(
  nodes: Node[],
  edges: Edge[],
  format: ExportFormat = "png",
) {
  // ==================================================
  // 1. Find export React Flow
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
  //
  // JSON does not need the rendered React Flow DOM.
  // Therefore do this before DOM/style manipulation.
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
  // 4. Get React Flow node elements
  // ==================================================

  const nodeElements = Array.from(
    exportRoot.querySelectorAll(".react-flow__node"),
  ) as HTMLElement[];

  if (!nodeElements.length) {
    throw new Error("No React Flow node elements found.");
  }

  // ==================================================
  // 5. Get viewport rectangles
  // ==================================================

  const viewportRect = viewport.getBoundingClientRect();

  const reactFlowRect = reactFlow.getBoundingClientRect();

  /*
   * Preserve the original structure.
   *
   * The React Flow rectangle is currently not needed
   * for calculating the bounds.
   */
  void reactFlowRect;

  // ==================================================
  // 6. Calculate actual visual bounds
  // ==================================================

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  /*
   * Get the current React Flow zoom once.
   *
   * Previously this was calculated inside every node
   * iteration. There is no need to calculate it repeatedly.
   */

  const viewportStyle = window.getComputedStyle(viewport);

  const transform = viewportStyle.transform;

  let zoom = 1;

  /*
   * React Flow normally produces:
   *
   * matrix(a, b, c, d, tx, ty)
   *
   * or sometimes:
   *
   * matrix3d(...)
   *
   * For normal React Flow zoom we use the first matrix
   * value.
   */

  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);

  if (matrixMatch) {
    const values = matrixMatch[1].split(",").map(Number);

    if (Number.isFinite(values[0]) && values[0] > 0) {
      zoom = values[0];
    }
  }

  /*
   * Also support matrix3d if the browser gives us one.
   */

  const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);

  if (matrix3dMatch) {
    const values = matrix3dMatch[1].split(",").map(Number);

    if (Number.isFinite(values[0]) && values[0] > 0) {
      zoom = values[0];
    }
  }

  nodeElements.forEach((element) => {
    const nodeId = element.getAttribute("data-id");

    /*
     * Ignore hidden nodes.
     */

    if (
      nodeId &&
      !visibleNodes.some((node) => node.id === nodeId)
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();

    /*
     * Ignore invalid DOM rectangles.
     */

    if (
      !Number.isFinite(rect.left) ||
      !Number.isFinite(rect.top) ||
      !Number.isFinite(rect.width) ||
      !Number.isFinite(rect.height)
    ) {
      return;
    }

    /*
     * Convert browser coordinates into
     * React Flow canvas coordinates.
     *
     * Because the viewport may be zoomed,
     * divide by the current zoom.
     */

    const x = (rect.left - viewportRect.left) / zoom;

    const y = (rect.top - viewportRect.top) / zoom;

    const width = rect.width / zoom;

    const height = rect.height / zoom;

    minX = Math.min(minX, x);

    minY = Math.min(minY, y);

    maxX = Math.max(maxX, x + width);

    maxY = Math.max(maxY, y + height);
  });

  // ==================================================
  // 7. Safety check
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
  // 8. Padding
  // ==================================================

  const padding = 200;

  const treeWidth = maxX - minX;

  const treeHeight = maxY - minY;

  const exportWidth = Math.ceil(treeWidth + padding * 2);

  const exportHeight = Math.ceil(treeHeight + padding * 2);

  console.log("ACTUAL DOM BOUNDS:", {
    minX,
    minY,
    maxX,
    maxY,
    treeWidth,
    treeHeight,
  });

  console.log("EXPORT SIZE:", {
    exportWidth,
    exportHeight,
  });

  // ==================================================
  // 9. Save original styles
  // ==================================================

  const originalWidth = reactFlow.style.width;

  const originalHeight = reactFlow.style.height;

  const originalOverflow = reactFlow.style.overflow;

  const originalTransform = viewport.style.transform;

  const originalTransformOrigin =
    viewport.style.transformOrigin;

  try {
    // =================================================
    // 10. Set exact export canvas
    // =================================================

    reactFlow.style.width = `${exportWidth}px`;

    reactFlow.style.height = `${exportHeight}px`;

    reactFlow.style.overflow = "hidden";

    // =================================================
    // 11. Move actual visual bounds
    //     into export canvas
    // =================================================

    const translateX = padding - minX;

    const translateY = padding - minY;

    viewport.style.transformOrigin = "0 0";

    viewport.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(1)`;

    // =================================================
    // 12. Wait for browser paint
    // =================================================

    await waitForRender();

    // =================================================
    // 13. Common export options
    // =================================================

    const imageExportOptions = getImageExportOptions();

    // =================================================
    // 14. Export PNG
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
    // 15. Export SVG
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
    // 16. Export PDF
    //
    // Generate the same safe PNG used by PNG export,
    // then put that PNG into the PDF.
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

      /*
       * Convert CSS pixels to millimeters.
       *
       * 96 CSS pixels = 25.4mm.
       */

      const pxToMm = 25.4 / 96;

      const pdfWidth = exportWidth * pxToMm;

      const pdfHeight = exportHeight * pxToMm;

      const orientation =
        pdfWidth > pdfHeight
          ? "landscape"
          : "portrait";

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

    /*
     * This should theoretically never happen because
     * ExportFormat only allows known values.
     */

    throw new Error(
      `Unsupported export format: ${format}`,
    );
  } catch (error) {
    /*
     * =================================================
     * IMPORTANT ERROR HANDLING
     * =================================================
     *
     * Your old code apparently ended up logging:
     *
     * Export failed: undefined
     *
     * This makes debugging unnecessarily difficult.
     *
     * Keep the original error and print useful information.
     */

    console.error("Family tree export failed:", error);

    if (error instanceof Error) {
      console.error("Export error message:", error.message);

      console.error("Export error stack:", error.stack);
    }

    throw error;
  } finally {
    // =================================================
    // 17. ALWAYS restore React Flow styles
    // =================================================

    reactFlow.style.width = originalWidth;

    reactFlow.style.height = originalHeight;

    reactFlow.style.overflow = originalOverflow;

    viewport.style.transform = originalTransform;

    viewport.style.transformOrigin =
      originalTransformOrigin;
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

function download(
  dataUrl: string,
  filename: string,
) {
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

function downloadBlob(
  blob: Blob,
  filename: string,
) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.download = filename;

  link.href = url;

  document.body.appendChild(link);

  link.click();

  link.remove();

  /*
   * This URL is created by us specifically for the
   * downloaded JSON blob, so revoking it is correct.
   *
   * This is completely different from the Vercel Blob
   * profile image URLs.
   */

  URL.revokeObjectURL(url);
}
