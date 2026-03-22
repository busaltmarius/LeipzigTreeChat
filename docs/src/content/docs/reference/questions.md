---
title: Example Questions
description: Sample questions for Baumbart.
---

## Annahmen

- `In der Nähe` bedeutet aktuell: gleiche PLZ oder gleiche Straße.
- Später können Koordinaten und Geolocation ergänzt werden.

## Beispiel-Fragen

### Bereits gut abgedeckt

- Welche Informationen kann man aus dem Baumkataster auslesen?
- Wie viel wurde im Stadtteil Connewitz gegossen?
- Welche Bäume haben Gießpaten?
- Gibt es Patenbäume in meiner Nähe?
- Welche Bäume kann ich in der Umgebung meiner Kita gießen?
- Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?

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
