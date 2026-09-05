import { type Edge, type Node } from "@xyflow/react";

import { toPng, toSvg } from "html-to-image";

type ExportFormat = "png" | "svg";

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
  // 2. Get visible nodes
  // ==================================================

  const visibleNodes = nodes.filter((node) => !node.hidden);

  if (!visibleNodes.length) {
    throw new Error("No visible nodes to export.");
  }

  // ==================================================
  // 3. IMPORTANT
  //
  // We DO NOT use getNodesBounds().
  //
  // Instead we inspect the actual DOM rectangles.
  // ==================================================

  const nodeElements = Array.from(
    exportRoot.querySelectorAll(".react-flow__node"),
  ) as HTMLElement[];

  if (!nodeElements.length) {
    throw new Error("No React Flow node elements found.");
  }

  // ==================================================
  // 4. Get React Flow viewport transform
  //
  // We need to convert screen/DOM coordinates
  // back into React Flow coordinates.
  // ==================================================

  const viewportRect = viewport.getBoundingClientRect();

  const reactFlowRect = reactFlow.getBoundingClientRect();

  // ==================================================
  // 5. Calculate actual visual bounds
  // ==================================================

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeElements.forEach((element) => {
    const nodeId = element.getAttribute("data-id");

    // Ignore hidden nodes
    if (nodeId && !visibleNodes.some((node) => node.id === nodeId)) {
      return;
    }

    const rect = element.getBoundingClientRect();

    /*
        Convert browser coordinates into
        React Flow canvas coordinates.

        Because the viewport may be transformed,
        we divide by the current zoom.
      */

    const style = window.getComputedStyle(viewport);

    const transform = style.transform;

    let zoom = 1;

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);

    if (matrixMatch) {
      const values = matrixMatch[1].split(",").map(Number);

      zoom = values[0] || 1;
    }

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
  // 6. Safety check
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
  // 7. Padding
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
  // 8. Save original styles
  // ==================================================

  const originalWidth = reactFlow.style.width;

  const originalHeight = reactFlow.style.height;

  const originalOverflow = reactFlow.style.overflow;

  const originalTransform = viewport.style.transform;

  const originalTransformOrigin = viewport.style.transformOrigin;

  try {
    // =================================================
    // 9. Set exact export canvas
    // =================================================

    reactFlow.style.width = `${exportWidth}px`;

    reactFlow.style.height = `${exportHeight}px`;

    reactFlow.style.overflow = "hidden";

    // =================================================
    // 10. Move the ACTUAL visual bounds
    //     into the export canvas
    // =================================================

    const translateX = padding - minX;

    const translateY = padding - minY;

    viewport.style.transformOrigin = "0 0";

    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;

    // =================================================
    // 11. Wait for paint
    // =================================================

    await waitForRender();

    // =================================================
    // 12. Export PNG
    // =================================================

    if (format === "png") {
      const dataUrl = await toPng(reactFlow, {
        backgroundColor: "#ffffff",

        width: exportWidth,

        height: exportHeight,

        pixelRatio: 2,

        cacheBust: true,

        style: {
          width: `${exportWidth}px`,

          height: `${exportHeight}px`,

          overflow: "hidden",
        },
      });

      download(dataUrl, "family-tree.png");
    }

    // =================================================
    // 13. Export SVG
    // =================================================

    if (format === "svg") {
      const dataUrl = await toSvg(reactFlow, {
        backgroundColor: "#ffffff",

        width: exportWidth,

        height: exportHeight,

        cacheBust: true,

        style: {
          width: `${exportWidth}px`,

          height: `${exportHeight}px`,

          overflow: "hidden",
        },
      });

      download(dataUrl, "family-tree.svg");
    }

    console.log("Family tree export completed.");
  } finally {
    // =================================================
    // 14. Restore everything
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
// Download
// ====================================================

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");

  link.download = filename;
  link.href = dataUrl;

  document.body.appendChild(link);

  link.click();

  link.remove();
}
