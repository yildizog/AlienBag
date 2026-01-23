import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Solution } from "@/data/securityData";

interface SolutionCardProps {
  solution: Solution;
  onDragStart: (event: React.DragEvent, solutionId: string) => void;
  onClick?: (solution: Solution) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onDragStart, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Card
        className="mb-3 md:mb-4 bg-blue-50 border-blue-200 shadow-sm cursor-grab active:cursor-grabbing md:cursor-grab active:scale-95 transition-transform"
        draggable
        onDragStart={(e) => onDragStart(e, solution.id)}
        onClick={() => onClick && onClick(solution)}
      >
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-blue-700 text-sm md:text-lg">{solution.name}</CardTitle>
          <CardDescription className="text-xs md:text-sm">{solution.description}</CardDescription>
        </CardHeader>
      </Card>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p>{solution.tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export default SolutionCard;