import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Solution } from "@/data/securityData";

interface SolutionCardProps {
  solution: Solution;
  onDragStart: (event: React.DragEvent, solutionId: string) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onDragStart }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Card
        className="mb-4 bg-blue-50 border-blue-200 shadow-sm cursor-grab"
        draggable
        onDragStart={(e) => onDragStart(e, solution.id)}
      >
        <CardHeader>
          <CardTitle className="text-blue-700">{solution.name}</CardTitle>
          <CardDescription>{solution.description}</CardDescription>
        </CardHeader>
      </Card>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p>{solution.tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export default SolutionCard;