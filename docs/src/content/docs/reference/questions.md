---
title: Example Questions
description: Sample questions for Baumbart.
---

## Annahmen

- `In der Nähe` bedeutet aktuell: gleiche PLZ oder gleiche Straße.
- Später können Koordinaten und Geolocation ergänzt werden.

## Beispiel-Fragen

### Bereits gut abgedeckt

- Wie viel wurde im Stadtteil Connewitz gegossen?
- Wie viele Bäume haben Gießpaten?
- Welche Bäume kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig gießen?
- Gibt es Tilia Bäume in Connewitz?
- Welche Bäume kann ich in der Nähe der 'SOS-Kinderdorf Kita Virchowstraße' gießen?

- Wie viele Liter Wasser wurden insgesamt auf alle Winter-Linden gegossen?
- Wie hoch ist die gesamte Wassersumme, die für die Bäume entlang der Karl-Liebknecht-Straße erfasst wurde?
- Wie viele einzelne Gießungen sind für Eichen im System protokolliert?
- Zeige mir die Gießprotokolle für alle Jungbäume, deren Pflanzjahr 2022 oder später ist.
- Wie viele Patenbäume gibt es aktuell im Ortsteil Südvorstadt?
- Für wie viele Bäume in Plagwitz ist eine Nachpflanzung geplant?
- Welche 10 Bäume haben den größten Stammdurchmesser im Ortsteil Connewitz?
- Wie hoch ist die Gesamtkapazität aller Kindertageseinrichtungen im Ortsteil Schleußig?
- Welche Baumarten wachsen in einem Radius von 250 Metern um die Kita 'SOS-Kinderdorf Kita Virchowstraße'?
- Welche Bäume in der Nähe von Kitas des freien Trägers 'Amt für Jugend und Familie' müssen gegossen werden?




- Welche Bäume kann ich in der Umgebung meiner Kita gießen?
- Gibt es Patenbäume in meiner Nähe?
- Welche Informationen kann man aus dem Baumkataster auslesen?

### Mit zusätzlichen Annahmen oder Logik

- Gibt es gießwürdige Bäume in meiner Nähe?
  Annahme: Bäume in der Nähe können grob über die Straße gefunden werden, und es wird vereinfacht angenommen, dass alle Wasser benötigen.
- Wie viele Lindenbäume wurden seit 2022 nicht mehr gegossen?
  Hinweis: Ein Jahr fehlt gegebenenfalls und müsste über Pflanzjahr und Standalter berechnet werden.
- Welche Rhododendren wurden seit 2022 in Anger-Crottendorf gepflanzt?
  Hinweis: Ein Jahr fehlt gegebenenfalls und müsste über Pflanzjahr und Standalter berechnet werden.
- Hat sich jemand um dich gekümmert?
  Hinweis: Dafür ist ein zuverlässiges Baum-Matching notwendig.
- Welche Bäume haben Gießpaten? Wie oft wurden diese bewässert?
  Hinweis: Auch hier ist ein Baum-Matching notwendig.

## Relevante Entitäten

Alle Entitäten enthalten gleichartige Geo-Koordinaten.

### Kita

- Ortsteil (roher String)
- Straße (roher String)
- Hausnummer
- PLZ

### District

- Feld `Name`: wird aktuell über String-Matches verwendet, zum Beispiel mit dem Kita-Ortsteil.

### Baum

- Feld `OT` für Ortsteil-String-Matching
- Straßenname (roher String)

### Watering-Record

- Bezirk oder Ortsteil (roher String)
