import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Attack } from "@/data/securityData";

interface AttackCardProps {
  attack: Attack;
  onLaunch: (attackId: string) => void;
}

const AttackCard = React.forwardRef<HTMLDivElement, AttackCardProps>(
  ({ attack, onLaunch }, ref) => (
    <Card ref={ref} className="mb-3 md:mb-4 bg-red-50 border-red-200 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-red-700 text-sm md:text-lg">{attack.name}</CardTitle>
        <CardDescription className="text-xs md:text-sm">{attack.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <Button onClick={() => onLaunch(attack.id)} variant="destructive" className="w-full text-xs md:text-sm h-8 md:h-10">
          Angriff starten
        </Button>
      </CardContent>
    </Card>
  )
);

export default AttackCard;