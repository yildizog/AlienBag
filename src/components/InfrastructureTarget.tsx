import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import HealthBar from "./HealthBar";
import { Solution, TargetType } from "@/data/securityData";

interface InfrastructureTargetProps {
  type: TargetType;
  icon: React.ReactNode;
  name: string;
  health?: number; // Only for server
  activeSolutions: Solution[];
  onDrop: (event: React.DragEvent, targetType: TargetType) => void;
  onRemoveSolution: (solutionId: string, targetType: TargetType) => void;
  isUnderAttack?: boolean;
}

const InfrastructureTarget = React.forwardRef<HTMLDivElement, InfrastructureTargetProps>(
  ({ type, icon, name, health, activeSolutions, onDrop, onRemoveSolution, isUnderAttack }, ref) => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
    };

    return (
      <Card
        ref={ref}
        className={`flex flex-col items-center justify-center p-6 min-h-[16rem] w-full max-w-xs mx-auto ${ // Changed h-64 to min-h-[16rem]
          type === "server" ? "bg-gray-100 border-gray-300" : "bg-blue-50 border-blue-200"
          }`}
        onDragOver={handleDragOver}
        onDrop={(e) => onDrop(e, type)}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={isUnderAttack ? {
            color: ["#ef4444", "inherit", "#ef4444"],
            scale: [1, 1.1, 1],
            filter: ["drop-shadow(0 0 0px #ef4444)", "drop-shadow(0 0 10px #ef4444)", "drop-shadow(0 0 0px #ef4444)"]
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        {health !== undefined && <HealthBar health={health} />}
        <div className="mt-2 flex flex-wrap justify-center gap-2"> {/* Changed mt-4 to mt-2 */}
          {activeSolutions.map((sol) => (
            <Badge key={sol.id} className="bg-blue-600 text-white flex items-center gap-1">
              {sol.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 text-white hover:bg-blue-700"
                onClick={() => onRemoveSolution(sol.id, type)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </Card>
    );
  }
);

export default InfrastructureTarget;