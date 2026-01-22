import React from "react";
import { Progress } from "@/components/ui/progress";

interface HealthBarProps {
  health: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ health }) => {
  const progressColor = health > 60 ? "bg-green-500" : health > 30 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full mt-2">
      <Progress value={health} className="h-2" indicatorClassName={progressColor} />
      <p className="text-sm text-gray-600 mt-1">{health}% Gesundheit</p>
    </div>
  );
};

export default HealthBar;