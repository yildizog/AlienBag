"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Server, User } from "lucide-react";
import { attacks, solutions, Attack, Solution, TargetType } from "@/data/securityData";
import AttackCard from "@/components/AttackCard";
import SolutionCard from "@/components/SolutionCard";
import InfrastructureTarget from "@/components/InfrastructureTarget";
import ConnectingLine from "@/components/ConnectingLine";
import { showSuccess, showError, showInfo } from "@/utils/toast"; // Using the existing toast utility
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper to get element position
interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const getElementPosition = (element: HTMLElement | null): ElementPosition | null => {
  if (element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }
  return null;
};

const Index = () => {
  const [serverHealth, setServerHealth] = useState(100);
  const [employeeHealth, setEmployeeHealth] = useState(100);
  const [activeAttacks, setActiveAttacks] = useState<Map<string, Attack>>(new Map());
  const [activeSolutions, setActiveSolutions] = useState<Map<TargetType, Solution[]>>(new Map());
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  const attackRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const serverRef = useRef<HTMLDivElement>(null);
  const employeeRef = useRef<HTMLDivElement>(null);
  const attackListRef = useRef<HTMLDivElement>(null);

  // Track the visible bounds of the scrollable container
  const [visibleBounds, setVisibleBounds] = useState({ top: 0, bottom: 0 });

  const [positions, setPositions] = useState<{
    [key: string]: ElementPosition | null;
    server: ElementPosition | null;
    employee: ElementPosition | null;
  }>({
    server: null,
    employee: null,
  });

  const updatePositions = useCallback(() => {
    const newPositions: typeof positions = {
      server: getElementPosition(serverRef.current),
      employee: getElementPosition(employeeRef.current),
    };
    attacks.forEach((attack) => {
      newPositions[attack.id] = getElementPosition(attackRefs.current[attack.id]);
    });
    setPositions(newPositions);

    if (attackListRef.current) {
      const rect = attackListRef.current.getBoundingClientRect();
      setVisibleBounds({
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY
      });
    }
  }, []);

  useEffect(() => {
    updatePositions();
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions); // Update positions on scroll
    // Also update positions after a short delay to ensure all elements are rendered
    const timeoutId = setTimeout(updatePositions, 100);
    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions);
      clearTimeout(timeoutId);
    };
  }, [updatePositions]);

  // Clean up active attacks when they become defended
  useEffect(() => {
    setActiveAttacks((prevAttacks) => {
      let hasChanges = false;
      const nextAttacks = new Map(prevAttacks);

      prevAttacks.forEach((attack) => {
        const targetSolutions = activeSolutions.get(attack.target) || [];
        const isDefended = targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(attack.id));
        if (isDefended) {
          nextAttacks.delete(attack.id);
          hasChanges = true;
        }
      });

      return hasChanges ? nextAttacks : prevAttacks;
    });
  }, [activeSolutions]);

  const handleLaunchAttack = (attackId: string) => {
    const attack = attacks.find((a) => a.id === attackId);
    if (!attack) return;

    // Prevent launching the same attack multiple times simultaneously
    if (activeAttacks.has(attack.id)) {
      showInfo(`Angriff "${attack.name}" läuft bereits.`);
      return;
    }

    // Check if attack is defended
    const targetSolutions = activeSolutions.get(attack.target) || [];
    const isDefended = targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(attack.id));

    if (isDefended) {
      showSuccess(`Angriff "${attack.name}" wurde abgewehrt!`);
      return;
    }

    setActiveAttacks((prev) => {
      const newAttacks = new Map(prev);
      newAttacks.set(attack.id, attack);
      return newAttacks;
    });

    // Attack succeeds, reduce health
    if (attack.target === "server") {
      setServerHealth((prev) => Math.max(0, prev - 20));
      showError(`Server wurde von "${attack.name}" getroffen!`);
    } else if (attack.target === "employee") {
      setEmployeeHealth((prev) => Math.max(0, prev - 20));
      showError(`Mitarbeiter wurde von "${attack.name}" getroffen!`);
    }
  };

  const handleDragStart = (event: React.DragEvent, solutionId: string) => {
    event.dataTransfer.setData("solutionId", solutionId);
  };

  const handleSolutionClick = (solution: Solution) => {
    setSelectedSolution(solution);
  };

  const applySolution = (solution: Solution, targetType: TargetType) => {
    if (solution.target === targetType) {
      setActiveSolutions((prev) => {
        const newSolutions = new Map(prev);
        const currentSolutions = newSolutions.get(targetType) || [];
        if (!currentSolutions.some((s) => s.id === solution.id)) {
          newSolutions.set(targetType, [...currentSolutions, solution]);
          showSuccess(`Lösung "${solution.name}" auf ${targetType === "server" ? "Server" : "Mitarbeiter"} angewendet.`);
        } else {
          showInfo(`Lösung "${solution.name}" ist bereits aktiv.`);
        }
        return newSolutions;
      });
    } else {
      showError(
        `Lösung "${solution.name}" ist für ${solution.target === "server" ? "Server" : "Mitarbeiter"}, nicht für ${targetType === "server" ? "Server" : "Mitarbeiter"}.`
      );
    }
    setSelectedSolution(null);
  };

  const handleDrop = (event: React.DragEvent, targetType: TargetType) => {
    event.preventDefault();
    const solutionId = event.dataTransfer.getData("solutionId");
    const solution = solutions.find((s) => s.id === solutionId);

    if (solution) {
      applySolution(solution, targetType);
    }
  };

  const handleRemoveSolution = (solutionId: string, targetType: TargetType) => {
    setActiveSolutions((prev) => {
      const newSolutions = new Map(prev);
      const currentSolutions = newSolutions.get(targetType) || [];
      newSolutions.set(
        targetType,
        currentSolutions.filter((s) => s.id !== solutionId)
      );
      showInfo(`Lösung "${solutions.find(s => s.id === solutionId)?.name}" von ${targetType === "server" ? "Server" : "Mitarbeiter"} entfernt.`);
      return newSolutions;
    });
  };

  return (
    <div className="min-h-screen sm:h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 p-4 relative overflow-x-hidden sm:overflow-hidden">
      <div className="relative z-30 bg-gray-50 dark:bg-gray-900 pb-8 pt-4 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-primary dark:text-blue-300">
          AlienBag Security Training Tool
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl mx-auto flex-1 w-full min-h-0 relative z-20 h-auto sm:h-full">
        {/* Left Column: Attack Vectors */}
        <div className="col-span-1 flex flex-col h-full min-h-0">
          <h2 className="text-xl font-semibold mb-4 text-primary dark:text-blue-300">Angriffsvektoren</h2>
          <div ref={attackListRef} className="space-y-2 flex-1 overflow-y-auto pr-2 max-h-[40vh] sm:max-h-none" onScroll={updatePositions}>
            {attacks.map((attack) => (
              <AttackCard
                key={attack.id}
                attack={attack}
                onLaunch={handleLaunchAttack}
                ref={(el) => (attackRefs.current[attack.id] = el)}
              />
            ))}
          </div>
        </div>

        {/* Middle Column: Infrastructure */}
        <div className="col-span-1 flex flex-col items-center justify-center space-y-6 h-full py-8 sm:py-0">
          <h2 className="text-xl font-semibold mb-4 text-primary dark:text-blue-300">Infrastruktur</h2>
          <InfrastructureTarget
            type="server"
            name="AlienBag Server"
            icon={<Server className="text-gray-700 dark:text-gray-300" size={64} />}
            health={serverHealth}
            activeSolutions={activeSolutions.get("server") || []}
            onDrop={handleDrop}
            onRemoveSolution={handleRemoveSolution}
            ref={serverRef}
            isUnderAttack={Array.from(activeAttacks.values()).some((a) => {
              if (a.target !== 'server') return false;
              // Check if defended (sync with line visibility)
              const targetSolutions = activeSolutions.get('server') || [];
              return !targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(a.id));
            })}
          />
          <InfrastructureTarget
            type="employee"
            name="Mitarbeiter"
            icon={<User className="text-gray-600 dark:text-gray-400" size={64} />}
            health={employeeHealth}
            activeSolutions={activeSolutions.get("employee") || []}
            onDrop={handleDrop}
            onRemoveSolution={handleRemoveSolution}
            ref={employeeRef}
            isUnderAttack={Array.from(activeAttacks.values()).some((a) => {
              if (a.target !== 'employee') return false;
              // Check if defended (sync with line visibility)
              const targetSolutions = activeSolutions.get('employee') || [];
              return !targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(a.id));
            })}
          />
        </div>

        {/* Right Column: Security Arsenal */}
        <div className="col-span-1 flex flex-col h-full min-h-0">
          <h2 className="text-xl font-semibold mb-4 text-primary dark:text-blue-300">Sicherheits-Arsenal</h2>
          <div className="space-y-2 flex-1 overflow-y-auto pr-2 max-h-[40vh] sm:max-h-none" onScroll={updatePositions}>
            {solutions.map((solution) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
                onDragStart={handleDragStart}
                onClick={handleSolutionClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SVG Lines for Attacks */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Array.from(activeAttacks.values()).map((attack) => {
          const startPos = positions[attack.id];
          const endPos = attack.target === 'server' ? positions.server : positions.employee;

          if (!startPos || !endPos) return null;

          const targetSolutions = activeSolutions.get(attack.target) || [];
          const isDefended = targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(attack.id));

          if (isDefended) return null;

          // Check visibility and clamp
          // If the start point is outside the visible bounds, clamp it to the edge
          let lineStartY = startPos.y + startPos.height / 2;
          let isClamped = false;

          const topBuffer = 20; // Space for header shadow/padding
          const topEdge = visibleBounds.top + topBuffer;
          const bottomEdge = visibleBounds.bottom - 20;

          if (lineStartY < topEdge) {
            lineStartY = topEdge;
            isClamped = true;
          } else if (lineStartY > bottomEdge) {
            lineStartY = bottomEdge;
            isClamped = true;
          }

          // Create a modified start position for the line
          // We set height to 0 so the ConnectingLine logic (y + height/2) uses our calculated Y directly
          const clampedStartPos = {
            ...startPos,
            y: lineStartY,
            height: 0
          };

          return (
            <ConnectingLine
              key={attack.id}
              startPos={clampedStartPos}
              endPos={endPos}
              isAttacking={true}
              isDefended={isDefended}
            />
          );
        })}
      </div>

      <AlertDialog open={!!selectedSolution} onOpenChange={(open) => !open && setSelectedSolution(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lösung anwenden</AlertDialogTitle>
            <AlertDialogDescription>
              Wählen Sie das Ziel für "{selectedSolution?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedSolution && applySolution(selectedSolution, "server")}>
              AlienBag Server
            </AlertDialogAction>
            <AlertDialogAction onClick={() => selectedSolution && applySolution(selectedSolution, "employee")}>
              Mitarbeiter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Index;