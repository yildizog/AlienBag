export class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;

    constructor(x: number, y: number, vx: number, vy: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = 2 + Math.random() * 2; // Default random size
        this.life = 1.0; // Life for opacity if needed
    }

    update(): boolean {
        this.x += this.vx;
        this.y += this.vy;
        return true;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// User's provided specific logic adapted for TypeScript
export class AttackParticle extends Particle {
    targetX: number;
    targetY: number;

    constructor(startX: number, startY: number, endX: number, endY: number, color: string) {
        // Berechnung des Abstands zwischen Start- und Endpunkt
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Zufällige Fluggeschwindigkeit festlegen
        const speed = 4 + Math.random() * 3;

        // Vektor-Normalisierung: Wir teilen den Weg durch die Distanz,
        // damit die Geschwindigkeit (vx, vy) unabhängig von der Entfernung konstant bleibt.
        // Diese Werte werden an die Elternklasse 'Particle' übergeben.
        super(startX, startY, (dx / dist) * speed, (dy / dist) * speed, color);

        // Speichern der Zielkoordinaten für die Kollisionsprüfung
        this.targetX = endX;
        this.targetY = endY;
    }

    update(): boolean {
        // Bewegung des Partikels basierend auf seiner Geschwindigkeit
        this.x += this.vx;
        this.y += this.vy;

        // Aktuellen Abstand zum Ziel berechnen
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        // Das Partikel gilt als "lebendig", solange es weiter als 5px vom Ziel entfernt ist.
        // Sobald es nah genug ist, gibt update() 'false' zurück (Signal zum Löschen).
        const isAlive = (Math.abs(dx) > 5 || Math.abs(dy) > 5);
        return isAlive;
    }
}
