# Baumbart Demo Benchmark

Run started: 2026-03-22T12:49:25.237Z
Run finished: 2026-03-22T12:49:43.986Z

## Overview

- Total cases: 18
- Pass rate: 0.0%
- Clarification success rate: 0.0%
- Graceful-failure success rate: 25.0%
- Median case duration: 762 ms

## Recommended Demo Subset

- `Q8` Bäume in der Umgebung einer Kita (soft-fail, 92.9%, 700 ms)
- `D3` Dialog: Geeigneten Baum zum Gießen finden (fail, 87.5%, 2309 ms)
- `D4` Dialog: Themenüberblick (fail, 86.7%, 675 ms)
- `D2` Dialog: Wasserentnahmestellen in der Nähe (fail, 86.7%, 1330 ms)
- `Q6` Patenbäume in meiner Nähe (fail, 85.7%, 723 ms)
- `Q10` Bäume mit Trockenheitsstress (fail, 84.6%, 727 ms)

## Passed Cases

- None

## Soft-Failed Cases

- `Q8` Bäume in der Umgebung einer Kita (soft-fail, 92.9%, 700 ms)
  Reason: Antwort fragt optional nach der Kita oder einem Ort: Required signal missing: Kita|Adresse|Straße|PLZ|Ortsteil|Stadtteil

## Failed Cases

- `Q1` Gießmenge nach Stadtteil (fail, 82.4%, 1397 ms)
  Reason: Antwort bezieht sich auf den Stadtteil: Required signal missing: Connewitz
- `Q2` Wasserentnahmestellen in der Nähe einer Adresse (fail, 80.0%, 906 ms)
  Reason: Antwort thematisiert Wasserentnahmestellen: Required signal missing: Wasser
- `Q3` Geeigneten Baum zum Gießen finden (fail, 80.0%, 835 ms)
  Reason: Antwort empfiehlt einen Baum oder ein Gießziel: Required signal missing: Baum|gieß|Liter|Birke|Linde|Ahorn|Rhododendron
- `Q4` Baumarten in Leipzig (fail, 80.0%, 774 ms)
  Reason: Antwort nennt Baumarten oder Beispiele: Required signal missing: Baumarten|Birke|Linde|Ahorn|Eiche|Rhododendron
- `Q5` Stadtteil mit den meisten Bäumen (fail, 80.0%, 742 ms)
  Reason: Antwort nennt einen Stadtteil: Required signal missing: Stadtteil|Connewitz|Suedvorstadt|Anger-Crottendorf|Leipzig
- `Q6` Patenbäume in meiner Nähe (fail, 85.7%, 723 ms)
  Reason: Antwort bleibt im Themenfeld Gießpatenschaften: Required signal missing: Paten|Patenschaft|Gießpaten
- `Q7` Bäume mit Gießpaten (fail, 80.0%, 731 ms)
  Reason: Antwort spricht über Gießpaten: Required signal missing: Paten|Patenschaft|Gießpaten
- `Q9` Verteilung der Baumarten (fail, 80.0%, 750 ms)
  Reason: Antwort spricht über Verteilung oder Vergleich: Required signal missing: verteilt|Verteilung|häufig|Anteil|meisten
- `Q10` Bäume mit Trockenheitsstress (fail, 84.6%, 727 ms)
  Reason: Antwort geht auf Trockenheit oder Bewässerungsbedarf ein: Required signal missing: Trocken|trocken|Gießen|Bewässerung|Wasser
- `Q11` Zukünftige Gießmenge ohne Datenbasis (fail, 73.7%, 699 ms)
  Reason: Antwort greift das Jahr 2026 auf: Required signal missing: 2026
- `Q12` Themenüberblick (fail, 80.0%, 686 ms)
  Reason: Antwort beschreibt Fähigkeiten oder Themen: Required signal missing: ich kann|Themen|Fragen|Informationen
- `D1` Dialog: Gießmenge nach Stadtteil und Jahr (fail, 68.4%, 2026 ms)
  Reason: Dialog hält den Bezug zu Connewitz: Required signal missing: Connewitz
- `D2` Dialog: Wasserentnahmestellen in der Nähe (fail, 86.7%, 1330 ms)
  Reason: Dialog bleibt beim Thema Wasserentnahmestellen: Required signal missing: Wasser
- `D3` Dialog: Geeigneten Baum zum Gießen finden (fail, 87.5%, 2309 ms)
  Reason: Dialog greift die 15-Liter-Grenze auf: Required signal missing: 15
- `D4` Dialog: Themenüberblick (fail, 86.7%, 675 ms)
  Reason: Antwort beschreibt mögliche Themen: Required signal missing: Baumarten|Wasserentnahmestellen|Gieß|Baumstandorte
- `D5` Dialog: Klärungsbedürftige Ortsanfrage (fail, 66.7%, 1347 ms)
  Reason: Antwort greift Connewitz nach der Klärung auf: Required signal missing: Connewitz
- `D6` Dialog: Graceful Failure mit Fallback (fail, 77.8%, 1385 ms)
  Reason: Dialog benennt die fehlende Datenlage: Required signal missing: 2030|keine Daten|nicht verfügbar|zukünftig

## Dialogue Transcripts

### D1: Dialog: Gießmenge nach Stadtteil und Jahr

Status: fail (68.4%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Wie viel wurde im Stadtteil Connewitz gegossen?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Wie viel in 2026?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Ja.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

### D2: Dialog: Wasserentnahmestellen in der Nähe

Status: fail (86.7%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Welche Wasserentnahmestellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Nein.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

### D3: Dialog: Geeigneten Baum zum Gießen finden

Status: fail (87.5%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Nein, ich kann maximal 15 Liter gießen.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Ja, mache ich.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

### D4: Dialog: Themenüberblick

Status: fail (86.7%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Was kannst du mir über die Bäume in Leipzig erklären?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

### D5: Dialog: Klärungsbedürftige Ortsanfrage

Status: fail (66.7%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Welchen Baum kann ich heute gießen?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** In Connewitz.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

### D6: Dialog: Graceful Failure mit Fallback

Status: fail (77.8%)

**Chatbot:** Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?

**Nutzer:** Wie viel wurde im Stadtteil Connewitz im Jahr 2030 gegossen?

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!

**Nutzer:** Dann gib mir bitte die aktuellsten Daten.

**Chatbot:** Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!
