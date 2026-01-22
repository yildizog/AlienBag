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
    <Card ref={ref} className="mb-4 bg-red-50 border-red-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-red-700">{attack.name}</CardTitle>
        <CardDescription>{attack.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onLaunch(attack.id)} variant="destructive" className="w-full">
          Angriff starten
        </Button>
      </CardContent>
    </Card>
  )
);

export default AttackCard;