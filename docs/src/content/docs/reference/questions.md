---
title: Questions
description: Sample questions for Baumbart
---

Beschlüsse:

- In der Nähe === Gleiche PLZ || gleiche Straße (wenn Zeit später Nutzung Koordinaten und Geolocation)

Fragen:
y: Welche Informationen kann man aus dem Baumkataster auslesen?
y: Wie viel wurde im Stadtteil Connewitz gegossen?
y: Welche Bäume haben Gießpaten?
y: Gibt es Patenbäume in meiner Nähe?
y: Welche Bäume kann ich in der Umgebung meiner Kita gießen?
y: Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?

m (Bäume grob via Straße in Nähe finden, und einfach Annahme: alle brauchen Wasser): Gibt es gießwürdige Bäume in meiner Nähe?
m (Jahr fehlt, mglw. berechenbar aus Pflanzjahr + Standalter): Wie viele Lindenbäume wurden seit 2022 nicht mehr gegossen?
m (Jahr fehlt, mglw. berechenbar aus Pflanzjahr + Standalter): Welche Rhododendren wurden seit 2022 in Anger-Crottendorf gepflanzt?
m (Baum-Matching): Hat sich jemand um dich gekümmert?
m (Baum-Matching): Welche Bäume haben Gießpaten? Wie oft wurden diese bewässert?

Entities:
Überall sind gleichartige Geo-Koordinaten dabei

- Kita
    - Ortsteil (roher String)
    - Straße (roher String)
    - Hausnummer
    - PLZ
- District
    - Feld "Name": wir verwenden hier String-Matches (bspw mit Kita Ortsteil)
    -
- Baum
    - Feld "OT" für Ortsteil String-Match
    - Straßenname (roher String)
- Watering-Record
    - Bezirk/OT (roher String)
