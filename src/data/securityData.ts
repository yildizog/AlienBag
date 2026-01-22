export type TargetType = "server" | "employee";

export interface Attack {
  id: string;
  name: string;
  description: string;
  target: TargetType;
  effectiveAgainstSolutions: string[]; // IDs of solutions that defend against this attack
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  target: TargetType;
  defendsAgainstAttacks: string[]; // IDs of attacks this solution defends against
  tooltip: string; // Explanation for the tooltip
}

export const attacks: Attack[] = [
  {
    id: "phishing",
    name: "Phishing",
    description: "Versucht, Benutzer zur Preisgabe sensibler Informationen zu verleiten.",
    target: "employee",
    effectiveAgainstSolutions: ["external-training", "2fa", "secure-passwords", "password-change"],
  },
  {
    id: "cross-site",
    name: "Cross-Site Scripting (XSS)",
    description: "Schleust bösartige Skripte in vertrauenswürdige Websites ein.",
    target: "server",
    effectiveAgainstSolutions: ["cloudflare", "limit-input-fields"],
  },
  {
    id: "ddos",
    name: "DDoS-Angriff",
    description: "Überlastet einen Server mit Traffic, um den Dienst zu stören.",
    target: "server",
    effectiveAgainstSolutions: ["cloudflare", "ip-check"],
  },
  {
    id: "brute-force",
    name: "Brute-Force-Angriff",
    description: "Probiert wiederholt Passwörter, bis das richtige gefunden wird.",
    target: "server",
    effectiveAgainstSolutions: ["login-lock", "2fa", "ip-check"],
  },
  {
    id: "sql-injection",
    name: "SQL-Injection",
    description: "Schleust bösartigen SQL-Code ein, um die Datenbank zu manipulieren.",
    target: "server",
    effectiveAgainstSolutions: ["limit-input-fields"],
  },
  {
    id: "internal-leak",
    name: "Interner Datenleck",
    description: "Sensible Daten, die durch einen Insider offengelegt werden.",
    target: "employee",
    effectiveAgainstSolutions: ["external-training"],
  },
  {
    id: "db-overload",
    name: "Datenbanküberlastung",
    description: "Übermäßige Abfragen oder Daten führen zu Leistungsproblemen der Datenbank.",
    target: "server",
    effectiveAgainstSolutions: ["cloudflare"],
  },
  {
    id: "insecure-passwords",
    name: "Unsichere Passwörter",
    description: "Schwache oder leicht zu erratende Passwörter.",
    target: "employee",
    effectiveAgainstSolutions: ["secure-passwords", "password-change", "external-training", "2fa"],
  },
  {
    id: "insecure-payment",
    name: "Unsichere Zahlung",
    description: "Schwachstellen in der Zahlungsabwicklung, die zu Betrug führen.",
    target: "server",
    effectiveAgainstSolutions: ["stripe-integration"],
  },
];

export const solutions: Solution[] = [
  {
    id: "external-training",
    name: "Externe Schulungen",
    description: "Schult Mitarbeiter in Best Practices der Sicherheit.",
    target: "employee",
    defendsAgainstAttacks: ["phishing", "internal-leak", "insecure-passwords"],
    tooltip: "Externe Schulungen helfen Mitarbeitern, Social-Engineering-Angriffe wie Phishing zu erkennen und zu vermeiden, wodurch das Risiko interner Lecks reduziert und eine bessere Passwort-Hygiene gefördert wird.",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description: "Schützt Websites vor DDoS-Angriffen und anderen Bedrohungen.",
    target: "server",
    defendsAgainstAttacks: ["ddos", "cross-site", "db-overload"],
    tooltip: "Cloudflare fungiert als Reverse-Proxy, der bösartigen Traffic (DDoS, XSS) filtert, bevor er Ihren Server erreicht, und kann helfen, den Traffic zu verwalten, um Datenbanküberlastungen zu verhindern.",
  },
  {
    id: "secure-passwords",
    name: "Sichere Passwörter",
    description: "Erzwingt starke Passwortrichtlinien.",
    target: "employee",
    defendsAgainstAttacks: ["insecure-passwords", "phishing"],
    tooltip: "Das Erzwingen starker, einzigartiger Passwörter erschwert es Angreifern erheblich, Anmeldeinformationen zu erraten oder zu knacken, und schützt so vor Brute-Force- und Phishing-Angriffen.",
  },
  {
    id: "2fa",
    name: "Zwei-Faktor-Authentifizierung (2FA)",
    description: "Fügt eine zusätzliche Sicherheitsebene zu Anmeldungen hinzu.",
    target: "employee",
    defendsAgainstAttacks: ["brute-force", "insecure-passwords", "phishing"],
    tooltip: "2FA erfordert einen zweiten Verifizierungsschritt, selbst wenn ein Passwort kompromittiert ist, was die Erfolgsrate von Brute-Force-Angriffen, Phishing und den Schutz vor unsicheren Passwörtern erheblich reduziert.",
  },
  {
    id: "limit-input-fields",
    name: "Eingabefelder Limitieren",
    description: "Beschränkt die Eingabelänge und den Typ, um Injection-Angriffe zu verhindern.",
    target: "server",
    defendsAgainstAttacks: ["sql-injection", "cross-site"],
    tooltip: "Durch die Validierung und Begrenzung der Benutzereingaben verhindert diese Lösung, dass bösartiger Code (SQLi, XSS) in Ihre Anwendung oder Datenbank eingeschleust wird.",
  },
  {
    id: "login-lock",
    name: "Login Sperre (3 Versuche)",
    description: "Sperrt Konten nach mehreren fehlgeschlagenen Anmeldeversuchen.",
    target: "server",
    defendsAgainstAttacks: ["brute-force"],
    tooltip: "Das automatische Sperren eines Kontos nach einigen fehlgeschlagenen Anmeldeversuchen verhindert automatisierte Brute-Force-Angriffe, die Passwörter erraten.",
  },
  {
    id: "ip-check",
    name: "IP-Prüfung (zeitabhängig)",
    description: "Überwacht und blockiert verdächtige IP-Adressen basierend auf dem Verhalten.",
    target: "server",
    defendsAgainstAttacks: ["ddos", "brute-force"],
    tooltip: "Erkennt und blockiert ungewöhnliche Verkehrsmuster oder wiederholte Anmeldeversuche von verdächtigen IP-Adressen, wodurch DDoS- und Brute-Force-Angriffe gemindert werden.",
  },
  {
    id: "password-change",
    name: "Passwortwechsel",
    description: "Fordert Benutzer regelmäßig auf, ihre Passwörter zu ändern.",
    target: "employee",
    defendsAgainstAttacks: ["insecure-passwords", "phishing"],
    tooltip: "Regelmäßige Passwortwechsel reduzieren das Zeitfenster, in dem kompromittierte Passwörter ausgenutzt werden können, und verbessern den Schutz vor unsicheren Passwörtern und Phishing.",
  },
  {
    id: "stripe-integration",
    name: "Stripe-Integration",
    description: "Verwendet einen sicheren Drittanbieter für die Zahlungsabwicklung.",
    target: "server",
    defendsAgainstAttacks: ["insecure-payment"],
    tooltip: "Die Integration mit einem vertrauenswürdigen Zahlungs-Gateway wie Stripe entlastet Sie von der Komplexität und dem Sicherheitsaufwand der Handhabung sensibler Zahlungsinformationen und schützt vor Schwachstellen bei unsicheren Zahlungen.",
  },
];