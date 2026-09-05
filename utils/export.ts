import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";

export const exportFullDiagram = async (format = "png") => {
  const { getNodes, getViewport, setViewport } = useReactFlow();
  const nodes = getNodes();

  if (!nodes.length) {
    console.log("No nodes to export");
    return;
  }

  // 1. Remember the user's current viewport
  const originalViewport = getViewport();

  // 2. Calculate bounds containing ALL nodes
  const bounds = getNodesBounds(nodes);

  // 3. Decide export dimensions
  const exportWidth = 3000;
  const exportHeight = 2000;

  // 4. Calculate viewport that fits ALL nodes
  const viewport = getViewportForBounds(
    bounds,
    exportWidth,
    exportHeight,
    0.05, // min zoom
    2, // max zoom
    0.1, // padding
  );

  // 5. Temporarily move React Flow to that viewport
  await setViewport(viewport);

  // Give React time to render
  await new Promise((resolve) => setTimeout(resolve, 100));

  const element = document.querySelector(".react-flow");

  if (!element) {
    await setViewport(originalViewport);
    return;
  }

  try {
    if (format === "png") {
      const dataUrl = await toPng(element, {
        backgroundColor: "#ffffff",
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "family-tree.png";
      link.href = dataUrl;
      link.click();
    }

    if (format === "svg") {
      const dataUrl = await toSvg(element, {
        backgroundColor: "#ffffff",
        width: exportWidth,
        height: exportHeight,
      });

      const link = document.createElement("a");
      link.download = "family-tree.svg";
      link.href = dataUrl;
      link.click();
    }
  } finally {
    // 6. Restore user's original viewport
    await setViewport(originalViewport);
  }
};
