#set page(
	paper: "a4",
	margin: (x: 15mm, y: 14mm),
)

#set text(
	size: 11pt,
	lang: "de",
)

#set par(
	justify: true,
	//leading: 0.66em,
)

#let lead(body) = block(
	fill: luma(245),
	inset: 8pt,
	radius: 4pt,
	below: 0.8em,
	{
    	set text(style: "italic")
    	body
	},
)

#show heading: set text(font: "Source Sans Pro")

#show heading.where(level: 1): set text(20pt)

#grid(
    columns: (1fr, auto),
    align: (left, right+horizon),
    [
        = Baumbart: Baumwächter von Leipzig
        Eric Behrendt • Julian Bruder • Marius Busalt • Daniel Kretschmer • Mose Schmiedel
    ],
    stack(dir: ltr, spacing: 20pt,
        image("assets/HTWK_Zusatz_de_V_Black_sRGB.svg", height: 30pt),
        image("assets/leipzig-farbig.png", height: 30pt),
    )
)


#lead[
    Baumbart ist ein prototypisches Auskunftssystem für Fragen zu Leipziger Baum- und Bewässerungsdaten.
    Im Projekt wurde ein Chatbot zur strukturierten Fragebeantwortung auf Basis von Wissensgraphen implementiert.
    Dadurch soll der Zugang zu kommunalen Umwelt- und Infrastrukturdaten für nicht-technische Nutzerinnen und Nutzer deutlich erleichtert werden.
]

== Problem und Relevanz
Stadtbezogene Umweltdaten liegen häufig in strukturierten, technisch orientierten Datenquellen vor.
Für interessierte Bürgerinnen und Bürger, Initiativen oder Verwaltungsakteure ist es jedoch oft schwierig, diese Bestandsdaten ohne Fachkenntnisse direkt zu durchsuchen.
Gerade im Kontext von Stadtbäumen und deren Wasserbedarf, Standort oder Patenschaften entsteht damit eine Lücke zwischen vorhandenen Daten und praktischer Nutzbarkeit im Alltag.
Baumbart adressiert diese Lücke mit einer natürlichsprachlichen Schnittstelle, die Fragen in alltagsnaher Form entgegennimmt und auf eine strukturierte Datenbasis zurückführt.


== Lösungsansatz
Die Systemidee folgt einem hybriden Ansatz.
Eine Weboberfläche ermöglicht Nutzerinnen und Nutzern die Eingabe von Fragen an Baumbart und präsentiert den Konversationsverlauf.
Im Hintergrund verwaltet ein Chatbot-Laufzeitsystem den Gesprächszustand, bereitet Nutzereingaben auf und entscheidet, ob bereits eine Antwort möglich ist oder zunächst eine Klärung benötigt wird.
Für die strukturierte Fragebeantwortung wird eine Qanary-Pipeline eingesetzt, die unter anderem den erwarteten Antworttyp bestimmt, Entitäten erkennt, Mehrdeutigkeiten auflöst, Relationen identifiziert und daraus SPARQL-Anfragen ableitet.
Die entstehenden Annotationen und Antworten werden über einen Triplestore zwischen Pipeline und Dialogsystem übergeben.
Um natürlichsprachliche Konversationen zu ermöglichen werden an verschiedenen Stellen gezielt Sprachmodelle (LLM) bei der Frageverarbeitung und strukturierten Beantwortung eingesetzt.


== Fähigkeiten
Der aktuelle Entwicklungsstand deckt bereits mehrere für die kommunale Praxis relevante Fragetypen ab.
Die Kombination aus strukturierter Auswertung und Rückfragen bei Unklarheiten ist dabei zentral: Das System soll nicht nur Antworten liefern, sondern auch mit unpräzisen Anfragen konstruktiv umgehen.

=== Beispiele unterstützter Fragen:

- Wie viel wurde im Stadtteil Connewitz gegossen?
- Wie viele Bäume haben Gießpaten?
- Welche Bäume kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig gießen?
- Gibt es Tilia Bäume in Connewitz?
- Welche Bäume kann ich in der Nähe der 'SOS-Kinderdorf Kita Virchowstraße' gießen?



== Projektstand und Mehrwert
Baumbart liegt derzeit als lauffähiger Prototyp mit Weboberfläche, Konversationssteuerung, angebundener Qanary-Pipeline und dokumentierter Architektur vor.
Erste Benchmark-Szenarien zeigen, dass insbesondere geführte Dialoge mit Rückfragen sowie klar umrissene Baum- und Gießanfragen bereits nachvollziehbar verarbeitet werden können.
Gleichzeitig befindet sich das System noch in einer Phase aktiver Weiterentwicklung; Robustheit, Abdeckung und Antwortqualität müssen fortlaufend verbessert werden.


== Ausblick
Im nächsten Schritt sollte Baumbart mehr Fragetypen unterstützen, auf erweiterte Wissenstände zurückgreifen.
Außerdem muss bei weiteren Entwicklungen die Zuverlässigkeit fortlaufend sichergestellt werden.
Hier ist es insbesondere essenziell Regressionen bei schon beantwortbaren Fragen zu verhindern.
Zum Beispiel durch den Einsatz des schon verfügbaren Benchmarks, dessen Fragenkatalog ständig erweitert wird.
Perspektivisch ist das Projekt damit nicht nur für Leipziger Baumdaten relevant, sondern auch als Muster für natürlichsprachliche Zugänge zu weiteren städtischen Daten- und Servicekontexten.
