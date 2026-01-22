import React from "react";
import { motion } from "framer-motion";

interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConnectingLineProps {
  startPos: ElementPosition;
  endPos: ElementPosition;
  isAttacking: boolean;
  isDefended: boolean;
}

const ConnectingLine: React.FC<ConnectingLineProps> = ({
  startPos,
  endPos,
  isAttacking,
  isDefended,
}) => {
  // Calculate start point (center-right of attack card)
  // Calculate Cubic Bezier control points for S-curve
  const startX = startPos.x + startPos.width + 12; // Start 12px to the right of the attack card
  const startY = startPos.y + startPos.height / 2;
  const endX = endPos.x - 12; // End 12px to the left of the target icon (assuming endPos is icon bounding box)
  const endY = endPos.y + endPos.height / 2;

  // Control points: pull out horizontally from start, pull in horizontally to end
  const controlPoint1X = startX + (endX - startX) * 0.5;
  const controlPoint1Y = startY;
  const controlPoint2X = endX - (endX - startX) * 0.5;
  const controlPoint2Y = endY;

  const path = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

  // Calculate a "block point" roughly 70% of the way from start to end
  const blockPointX = startX + (endX - startX) * 0.7;
  const blockPointY = startY + (endY - startY) * 0.7;

  const lineColor = isDefended ? "hsl(var(--primary))" : "hsl(var(--destructive))"; // Navy-Blue for defended, Red for attack
  const dotColor = lineColor;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Main line */}
      <motion.path
        d={path}
        stroke={lineColor}
        strokeWidth="2"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAttacking ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated dot */}
      {/* Animated dot moving along the path */}
      {isAttacking && (
        <motion.circle
          r="5"
          fill={dotColor}
          initial={{ offsetDistance: "0%" }}
          animate={{
            offsetDistance: isDefended ? "70%" : "100%",
          }}
          transition={{
            duration: isDefended ? 0.5 : 2,
            ease: "linear",
            repeat: isDefended ? 0 : Infinity,
            repeatType: "loop",
          }}
          style={{
            offsetPath: `path('${path}')`,
          }}
        />
      )}

      {/* Block node if defended */}
      {isDefended && (
        <circle
          cx={blockPointX}
          cy={blockPointY}
          r="8"
          fill="hsl(var(--primary))" // Navy-Blue
          stroke="white"
          strokeWidth="2"
        />
      )}
    </svg>
  );
};

export default ConnectingLine;