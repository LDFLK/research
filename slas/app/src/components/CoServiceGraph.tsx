"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods, NodeObject, LinkObject } from "react-force-graph-2d";
import type { InstitutionCoService, Grade } from "@/lib/types";

const GRADE_COLORS: Record<string, string> = {
  SP: "#9333ea",
  GI: "#2563eb",
  GII: "#059669",
  GIII: "#d97706",
};

const GRADE_BADGE: Record<string, string> = {
  SP: "bg-purple-100 text-purple-700",
  GI: "bg-blue-100 text-blue-700",
  GII: "bg-emerald-100 text-emerald-700",
  GIII: "bg-amber-100 text-amber-700",
};

const STRENGTH_COLORS: Record<string, string> = {
  strong: "#9333ea",
  moderate: "#0284c7",
  weak: "#d1d5db",
};

interface GNode {
  id: string;
  label: string;
  grade: Grade;
  bondCount: number;
}

interface GLink {
  source: string;
  target: string;
  weight: number;
  strength: "strong" | "moderate" | "weak";
}

export default function CoServiceGraph({
  coService,
  activeGrades,
  onOfficerClick,
}: {
  coService: InstitutionCoService;
  activeGrades: Set<Grade>;
  onOfficerClick: (fileNumber: string) => void;
}) {
  const graphRef = useRef<ForceGraphMethods<NodeObject<GNode>, LinkObject<GNode, GLink>>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const fittedRef = useRef(false);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(400, width),
        height: Math.max(400, Math.min(600, width * 0.65)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build graph data filtered by active grades
  const graphData = useMemo(() => {
    const nodeMap = new Map<string, GNode>();

    for (const bond of coService.bonds) {
      const g1ok = activeGrades.has(bond.officer1Grade);
      const g2ok = activeGrades.has(bond.officer2Grade);
      if (!g1ok || !g2ok) continue;

      if (!nodeMap.has(bond.officer1FileNumber)) {
        nodeMap.set(bond.officer1FileNumber, {
          id: bond.officer1FileNumber,
          label: bond.officer1Name,
          grade: bond.officer1Grade,
          bondCount: 0,
        });
      }
      if (!nodeMap.has(bond.officer2FileNumber)) {
        nodeMap.set(bond.officer2FileNumber, {
          id: bond.officer2FileNumber,
          label: bond.officer2Name,
          grade: bond.officer2Grade,
          bondCount: 0,
        });
      }
      nodeMap.get(bond.officer1FileNumber)!.bondCount++;
      nodeMap.get(bond.officer2FileNumber)!.bondCount++;
    }

    const nodes = Array.from(nodeMap.values()) as NodeObject<GNode>[];
    const nodeIds = new Set(nodeMap.keys());
    const links = coService.bonds
      .filter(
        (b) =>
          nodeIds.has(b.officer1FileNumber) && nodeIds.has(b.officer2FileNumber)
      )
      .map((b) => ({
        source: b.officer1FileNumber,
        target: b.officer2FileNumber,
        weight: b.overlapYears,
        strength: b.strength,
      })) as LinkObject<GNode, GLink>[];

    return { nodes, links };
  }, [coService, activeGrades]);

  // Reset fit flag when data changes so zoomToFit runs again
  useEffect(() => {
    fittedRef.current = false;
  }, [graphData]);

  // Zoom to fit once the simulation settles
  const handleEngineStop = useCallback(() => {
    if (!fittedRef.current && graphRef.current && graphData.nodes.length > 0) {
      graphRef.current.zoomToFit(400, 40);
      fittedRef.current = true;
    }
  }, [graphData.nodes.length]);

  // Precompute max bond count for sizing
  const maxBonds = useMemo(
    () => Math.max(...graphData.nodes.map((n) => (n as GNode).bondCount || 1), 1),
    [graphData]
  );

  // Set of node IDs connected to hovered node (for dimming)
  const connectedIds = useMemo(() => {
    if (!hoveredNode) return null;
    const ids = new Set<string>();
    ids.add(hoveredNode);
    for (const link of graphData.links) {
      const src = typeof link.source === "object" ? (link.source as GNode).id : (link.source as string);
      const tgt = typeof link.target === "object" ? (link.target as GNode).id : (link.target as string);
      if (src === hoveredNode) ids.add(tgt);
      if (tgt === hoveredNode) ids.add(src);
    }
    return ids;
  }, [hoveredNode, graphData.links]);

  // Hovered node object for tooltip
  const hoveredNodeObj = useMemo(() => {
    if (!hoveredNode) return null;
    return graphData.nodes.find((n) => (n as GNode).id === hoveredNode) as GNode | undefined;
  }, [hoveredNode, graphData.nodes]);

  const hoveredBondInfo = useMemo(() => {
    if (!hoveredNode) return { total: 0, strong: 0 };
    let total = 0;
    let strong = 0;
    for (const link of graphData.links) {
      const src = typeof link.source === "object" ? (link.source as GNode).id : (link.source as string);
      const tgt = typeof link.target === "object" ? (link.target as GNode).id : (link.target as string);
      if (src === hoveredNode || tgt === hoveredNode) {
        total++;
        if ((link as GLink).strength === "strong") strong++;
      }
    }
    return { total, strong };
  }, [hoveredNode, graphData.links]);

  // Custom node rendering on canvas
  const paintNode = useCallback(
    (node: NodeObject<GNode>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GNode & { x: number; y: number };
      const r = Math.max(4, Math.min(10, 3 + ((n.bondCount || 1) / maxBonds) * 7));
      const dimmed = connectedIds && !connectedIds.has(n.id);

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = GRADE_COLORS[n.grade] || "#6b7280";
      ctx.globalAlpha = dimmed ? 0.15 : 1;
      ctx.fill();
      ctx.strokeStyle = hoveredNode === n.id ? "#111827" : "#ffffff";
      ctx.lineWidth = hoveredNode === n.id ? 2 / globalScale : 1 / globalScale;
      ctx.stroke();

      // Label for larger or hovered nodes
      if (r >= 6 || hoveredNode === n.id) {
        const fontSize = Math.max(10, 12 / globalScale);
        ctx.font = `${hoveredNode === n.id ? "bold " : ""}${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#374151";
        ctx.globalAlpha = dimmed ? 0.15 : 0.9;
        const label =
          n.label.length > 25 ? n.label.slice(0, 22) + "..." : n.label;
        ctx.fillText(label, n.x, n.y + r + 2 / globalScale);
      }

      ctx.globalAlpha = 1;
    },
    [maxBonds, connectedIds, hoveredNode]
  );

  // Hit area for pointer detection
  const paintNodeArea = useCallback(
    (node: NodeObject<GNode>, color: string, ctx: CanvasRenderingContext2D) => {
      const n = node as GNode & { x: number; y: number };
      const r = Math.max(4, Math.min(10, 3 + ((n.bondCount || 1) / maxBonds) * 7));
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [maxBonds]
  );

  // Link color
  const linkColor = useCallback(
    (link: LinkObject<GNode, GLink>) => {
      const l = link as GLink;
      if (!hoveredNode) return STRENGTH_COLORS[l.strength] || "#d1d5db";
      const src = typeof link.source === "object" ? (link.source as GNode).id : (link.source as string);
      const tgt = typeof link.target === "object" ? (link.target as GNode).id : (link.target as string);
      const connected = src === hoveredNode || tgt === hoveredNode;
      if (connected) return STRENGTH_COLORS[l.strength] || "#d1d5db";
      return "rgba(209,213,219,0.1)";
    },
    [hoveredNode]
  );

  // Link width
  const linkWidth = useCallback(
    (link: LinkObject<GNode, GLink>) => {
      const l = link as GLink;
      return l.weight * 1.5 + 0.5;
    },
    []
  );

  if (graphData.nodes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {coService.bonds.length === 0
          ? "No overlapping officer pairs found"
          : "No bonds match the selected grades"}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={paintNodeArea}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeClick={(node) => onOfficerClick((node as GNode).id)}
        onNodeHover={(node) => setHoveredNode(node ? (node as GNode).id : null)}
        onEngineStop={handleEngineStop}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        cooldownTicks={100}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
        backgroundColor="transparent"
      />

      {/* Hover tooltip */}
      {hoveredNodeObj && (
        <div className="absolute top-3 right-3 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-xs pointer-events-none z-10">
          <div className="font-semibold text-gray-900">{hoveredNodeObj.label}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${GRADE_BADGE[hoveredNodeObj.grade]}`}
            >
              {hoveredNodeObj.grade}
            </span>
            <span className="text-gray-500">
              {hoveredBondInfo.total} bond{hoveredBondInfo.total !== 1 ? "s" : ""}
              {hoveredBondInfo.strong > 0 && ` (${hoveredBondInfo.strong} strong)`}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Click to view officer profile
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 pointer-events-none z-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-medium text-gray-700">Grades:</span>
          {Object.entries(GRADE_COLORS).map(([grade, color]) => (
            <div key={grade} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{grade}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Bonds:</span>
          <div className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5 rounded"
              style={{ backgroundColor: "#9333ea", height: 3 }}
            />
            <span>Strong</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5 rounded"
              style={{ backgroundColor: "#0284c7", height: 2 }}
            />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5 rounded"
              style={{ backgroundColor: "#d1d5db", height: 1 }}
            />
            <span>Weak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
