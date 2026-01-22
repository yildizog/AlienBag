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
  const startX = startPos.x + startPos.width;
  const startY = startPos.y + startPos.height / 2;

  // Calculate end point (center of target icon)
  const endX = endPos.x + endPos.width / 2;
  const endY = endPos.y + endPos.height / 2;

  const path = `M ${startX} ${startY} L ${endX} ${endY}`;

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
      {isAttacking && (
        <motion.circle
          cx={startX}
          cy={startY}
          r="5"
          fill={dotColor}
          animate={{
            cx: isDefended ? blockPointX : endX,
            cy: isDefended ? blockPointY : endY,
          }}
          transition={{
            duration: isDefended ? 0.5 : 1.5, // Faster if defended
            ease: "linear",
            repeat: isDefended ? 0 : Infinity, // Stop if defended, loop if not
            repeatType: "loop",
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