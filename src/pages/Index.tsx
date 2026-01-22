"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Server, User } from "lucide-react";
import { attacks, solutions, Attack, Solution, TargetType } from "@/data/securityData";
import AttackCard from "@/components/AttackCard";
import SolutionCard from "@/components/SolutionCard";
import InfrastructureTarget from "@/components/InfrastructureTarget";
import ConnectingLine from "@/components/ConnectingLine";
import ParticleCanvas from "@/components/ParticleCanvas";
import { showSuccess, showError, showInfo } from "@/utils/toast"; // Using the existing toast utility

// Helper to get element position
interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const getElementPosition = (ref: React.RefObject<HTMLElement>): ElementPosition | null => {
  if (ref.current) {
    const rect = ref.current.getBoundingClientRect();
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

  const attackRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const serverRef = useRef<HTMLDivElement>(null);
  const employeeRef = useRef<HTMLDivElement>(null);

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
      server: getElementPosition(serverRef),
      employee: getElementPosition(employeeRef),
    };
    attacks.forEach((attack) => {
      newPositions[attack.id] = getElementPosition(attackRefs.current[attack.id]);
    });
    setPositions(newPositions);
  }, []);

  useEffect(() => {
    updatePositions();
    window.addEventListener("resize", updatePositions);
    // Also update positions after a short delay to ensure all elements are rendered
    const timeoutId = setTimeout(updatePositions, 100);
    return () => {
      window.removeEventListener("resize", updatePositions);
      clearTimeout(timeoutId);
    };
  }, [updatePositions]);

  const handleLaunchAttack = (attackId: string) => {
    const attack = attacks.find((a) => a.id === attackId);
    if (!attack) return;

    // Prevent launching the same attack multiple times simultaneously
    if (activeAttacks.has(attack.id)) {
      showInfo(`Angriff "${attack.name}" läuft bereits.`);
      return;
    }

    setActiveAttacks((prev) => {
      const newAttacks = new Map(prev);
      newAttacks.set(attack.id, attack);
      return newAttacks;
    });

    // Check if attack is defended
    const targetSolutions = activeSolutions.get(attack.target) || [];
    const isDefended = targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(attack.id));

    if (!isDefended) {
      // Attack succeeds, reduce health
      if (attack.target === "server") {
        setServerHealth((prev) => Math.max(0, prev - 20));
        showError(`Server wurde von "${attack.name}" getroffen!`);
      } else if (attack.target === "employee") {
        setEmployeeHealth((prev) => Math.max(0, prev - 20));
        showError(`Mitarbeiter wurde von "${attack.name}" getroffen!`);
      }
    } else {
      showSuccess(`Angriff "${attack.name}" wurde abgewehrt!`);
    }

    // Automatically remove attack after a short period to allow re-launching
    setTimeout(() => {
      setActiveAttacks((prev) => {
        const newAttacks = new Map(prev);
        newAttacks.delete(attack.id);
        return newAttacks;
      });
    }, 3000); // Attack animation duration + some buffer
  };

  const handleDragStart = (event: React.DragEvent, solutionId: string) => {
    event.dataTransfer.setData("solutionId", solutionId);
  };

  const handleDrop = (event: React.DragEvent, targetType: TargetType) => {
    event.preventDefault();
    const solutionId = event.dataTransfer.getData("solutionId");
    const solution = solutions.find((s) => s.id === solutionId);

    if (solution && solution.target === targetType) {
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
    } else if (solution && solution.target !== targetType) {
      showError(`Lösung "${solution.name}" ist für ${solution.target === "server" ? "Server" : "Mitarbeiter"}, nicht für ${targetType === "server" ? "Server" : "Mitarbeiter"}.`);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 p-4 relative overflow-hidden">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary dark:text-blue-300">
        AlienBag Security Training Tool
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Left Column: Attack Vectors */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-primary dark:text-blue-300">Angriffsvektoren</h2>
          <div className="space-y-2">
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
        <div className="col-span-1 flex flex-col items-center justify-center space-y-6">
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
          />
        </div>

        {/* Right Column: Security Arsenal */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-primary dark:text-blue-300">Sicherheits-Arsenal</h2>
          <div className="space-y-2">
            {solutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} onDragStart={handleDragStart} />
            ))}
          </div>
        </div>
      </div>

      {/* SVG Lines for Attacks */}
      {Array.from(activeAttacks.values()).map((attack) => {
        const startPos = positions[attack.id];
        const endPos = attack.target === 'server' ? positions.server : positions.employee;

        if (!startPos || !endPos) return null;

        const targetSolutions = activeSolutions.get(attack.target) || [];
        const isDefended = targetSolutions.some((sol) => sol.defendsAgainstAttacks.includes(attack.id));

        return (
          <ConnectingLine
            key={attack.id}
            startPos={startPos}
            endPos={endPos}
            isAttacking={true}
            isDefended={isDefended}
          />
        );
      })}

      <ParticleCanvas activeAttacks={activeAttacks} positions={positions} />
    </div>
  );
};

export default Index;