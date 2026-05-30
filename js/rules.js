/* Phase 10 – Regeln & Phasenliste (Original-Anleitung von Ravensburger) */

const PHASES = [
  { n: 1,  desc: "2 Drillinge",                sub: "Zwei Sätze mit je 3 gleichen Karten" },
  { n: 2,  desc: "1 Drilling + 1 Viererfolge", sub: "3 gleiche Karten + Folge aus 4 Karten" },
  { n: 3,  desc: "1 Vierling + 1 Viererfolge", sub: "4 gleiche Karten + Folge aus 4 Karten" },
  { n: 4,  desc: "1 Siebenerfolge",            sub: "Folge aus 7 aufeinanderfolgenden Karten" },
  { n: 5,  desc: "1 Achterfolge",              sub: "Folge aus 8 aufeinanderfolgenden Karten" },
  { n: 6,  desc: "1 Neunerfolge",              sub: "Folge aus 9 aufeinanderfolgenden Karten" },
  { n: 7,  desc: "2 Vierlinge",                sub: "Zwei Sätze mit je 4 gleichen Karten" },
  { n: 8,  desc: "7 Karten einer Farbe",       sub: "Sieben Karten in derselben Farbe" },
  { n: 9,  desc: "1 Fünfling + 1 Zwilling",    sub: "5 gleiche Karten + 2 gleiche Karten" },
  { n: 10, desc: "1 Fünfling + 1 Drilling",    sub: "5 gleiche Karten + 3 gleiche Karten" },
];

const SCORE_VALUES = [
  ["Karten mit Wert 1 – 9", "je 5 Punkte"],
  ["Karten mit Wert 10 – 12", "je 10 Punkte"],
  ["„Aussetzen“-Karten", "je 15 Punkte"],
  ["Joker", "je 20 Punkte"],
];

/* Spielmodi – seq = Reihenfolge der zu spielenden Phasen,
 * auto = jeder rückt jede Runde automatisch weiter,
 * limit = feste Anzahl Durchgänge (sonst null). */
const MODES = {
  standard: {
    label: "Standard – alle 10 Phasen",
    seq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], auto: false, limit: null,
    hint: "Alle 10 Phasen der Reihe nach. Wer zuerst alle schafft, gewinnt – bei Gleichstand entscheiden die wenigsten Punkte.",
  },
  short5: {
    label: "Kurzspiel – erste 5 Phasen",
    seq: [1, 2, 3, 4, 5], auto: false, limit: null,
    hint: "Nur die ersten 5 Phasen werden gespielt. Wer sie zuerst schafft, gewinnt.",
  },
  even: {
    label: "Nur gerade Phasen (2·4·6·8·10)",
    seq: [2, 4, 6, 8, 10], auto: false, limit: null,
    hint: "Es werden nur die geraden Phasen 2, 4, 6, 8 und 10 gespielt.",
  },
  odd: {
    label: "Nur ungerade Phasen (1·3·5·7·9)",
    seq: [1, 3, 5, 7, 9], auto: false, limit: null,
    hint: "Es werden nur die ungeraden Phasen 1, 3, 5, 7 und 9 gespielt.",
  },
  tenrounds: {
    label: "10 Durchgänge – Punktespiel",
    seq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], auto: true, limit: 10,
    hint: "Genau 10 Durchgänge. Alle rücken jede Runde eine Phase weiter – egal ob geschafft. Wer am Ende die wenigsten Punkte hat, gewinnt.",
  },
};
const DEFAULT_MODE = "standard";

/* HTML-Bausteine für die Regelansicht */
function buildRulesHTML() {
  const phaseItems = PHASES.map(p => `
    <div class="phase-item">
      <span class="pnum">${p.n}</span>
      <span>
        <span class="pdesc">${p.desc}</span><br>
        <span class="psub">${p.sub}</span>
      </span>
    </div>`).join("");

  const scoreRows = SCORE_VALUES.map(([k, v]) =>
    `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  const modeItems = Object.values(MODES).map(m => `
    <li><strong>${m.label}:</strong> ${m.hint}</li>`).join("");

  return `
    <div class="card">
      <span class="tag">Spielziel</span>
      <h2>In 10 Phasen zum Sieg!</h2>
      <p>Alle Phasen – das sind Kombinationen bestimmter Karten – sind verschieden und mit jedem
      Durchgang schwieriger. Konnte ein Spieler eine Phase erfolgreich auslegen, darf er sich im
      nächsten Durchgang an der nächsten Phase versuchen. Schafft man es nicht, muss man sich an
      derselben Phase erneut versuchen, bis es endlich gelingt.</p>
      <p><strong>Wer zuerst alle 10 Phasen geschafft hat, ist Gewinner.</strong></p>
    </div>

    <div class="card">
      <span class="tag">Spielmaterial &amp; Vorbereitung</span>
      <h2>Material</h2>
      <p>108 Spielkarten (je zweimal die Werte 1–12 in 4 Farben), 4 Karten „Aussetzen“ und
      8 Joker sowie 6 Übersichtskarten. Zusätzlich braucht man dieser App ☺ – früher Blatt &amp; Stift.</p>
      <h3>Vorbereitung</h3>
      <p>Jeder Spieler erhält <strong>10 Karten</strong> verdeckt vom gut gemischten Stapel.
      Die restlichen Karten bilden den verdeckten Aufnahmestapel; die oberste Karte wird offen
      daneben als Beginn des Ablagestapels gelegt.</p>
    </div>

    <div class="card">
      <span class="tag">Die 10 Phasen</span>
      <h2>Das musst du auslegen</h2>
      <p>Die Phasen müssen in der vorgegebenen Reihenfolge abgehandelt werden – zuerst Phase 1,
      dann Phase 2 usw.</p>
      <div class="phase-list">${phaseItems}</div>
    </div>

    <div class="card">
      <span class="tag">Spielverlauf</span>
      <h2>Ein Zug</h2>
      <p>Es wird reihum im Uhrzeigersinn gespielt; der Spieler links vom Geber beginnt. Wer an der
      Reihe ist:</p>
      <ul>
        <li><strong>muss</strong> eine Karte aufnehmen – entweder vom verdeckten Aufnahmestapel
        oder die oberste offenliegende vom Ablagestapel;</li>
        <li><strong>kann</strong> anschließend die aktuelle Phase auslegen;</li>
        <li><strong>muss</strong> schließlich eine Karte offen auf den Ablagestapel werfen.</li>
      </ul>
      <p>Man darf nie nur einen Teil einer Phase auslegen, sondern immer nur die vollständige
      Kombination. Zusätzliche passende Karten dürfen aber gespielt werden, wenn sie zur Phase
      passen. Hat ein Spieler seine Phase ausgelegt, versucht er, seine restlichen Karten durch
      Anlegen (an eigene oder fremde Auslagen) loszuwerden.</p>
    </div>

    <div class="card">
      <span class="tag">Sonderkarten</span>
      <h2>Joker &amp; Aussetzen</h2>
      <p><strong>Joker („Stern“)</strong> ersetzen jede beliebige Karte, um eine Phase zu
      vervollständigen oder Karten anzulegen. Es dürfen beliebig viele Joker in einer Phase
      eingesetzt werden.</p>
      <p>Eine <strong>„Aussetzen“-Karte</strong> wird wie eine letzte Karte eines Zuges gespielt,
      jedoch nicht auf den Ablagestapel geworfen, sondern vor einen beliebigen Mitspieler gelegt.
      Dieser muss eine Runde aussetzen.</p>
    </div>

    <div class="card">
      <span class="tag">Wertung</span>
      <h2>Punkte zählen</h2>
      <p>Ein Durchgang ist beendet, sobald ein Spieler seine letzte Karte ablegen konnte. Alle
      anderen Spieler zählen die Werte ihrer noch auf der Hand verbliebenen Karten zusammen –
      <strong>Minuspunkte, also möglichst wenig!</strong></p>
      <table class="score-table"><tbody>${scoreRows}</tbody></table>
      <p>Zudem wird notiert, welche Phase jeder Spieler erreicht bzw. geschafft hat. <strong>Sieger
      ist, wer am Ende eines Durchgangs seine 10. Phase geschafft hat.</strong> Gelingt dies
      mehreren im selben Durchgang, gewinnt davon der Spieler mit den wenigsten Punkten.</p>
    </div>

    <div class="card">
      <span class="tag">Spezielle Regeln</span>
      <h2>Gut zu wissen</h2>
      <ul>
        <li>Zwischen den Werten 12 und 1 gibt es keine direkte Verbindung (kein „Rundherum“).</li>
        <li>6 bzw. 8 gleiche Karten können als zwei Drillinge bzw. Vierlinge eingesetzt werden.</li>
        <li>Sind z.&nbsp;B. zwei Drillinge gefordert, passt ein dritter Drilling nicht zur Phase.</li>
        <li>Ein Joker nimmt (in der 8. Phase) jede beliebige Farbe an.</li>
        <li>Bereits ausliegende Joker dürfen nicht ersetzt und wieder aufgenommen werden.</li>
        <li>Ein Joker kann nicht als „Aussetzen“-Karte eingesetzt werden.</li>
        <li>Ein Spieler darf höchstens eine „Aussetzen“-Karte vor sich liegen haben.</li>
      </ul>
    </div>

    <div class="card">
      <span class="tag">Spielmodi</span>
      <h2>Modi in dieser App</h2>
      <p>Beim Start eines neuen Spiels kannst du einen Modus wählen. Die Punkte-Erfassung
      passt Phasenfolge, Rundenzahl und Siegbedingung automatisch an:</p>
      <ul>${modeItems}</ul>
    </div>

    <div class="card">
      <span class="tag">Varianten</span>
      <h2>Weitere Spielweisen</h2>
      <ul>
        <li><strong>Genau 10 Durchgänge:</strong> Nach jedem Durchgang rücken alle eine Phase
        weiter, egal ob geschafft. Wer nach 10 Durchgängen die wenigsten Punkte hat, gewinnt.</li>
        <li><strong>Weniger Phasen:</strong> Vor Spielbeginn nur eine bestimmte Anzahl Phasen
        (z.&nbsp;B. die ersten 5) oder nur gerade/ungerade Phasen vereinbaren.</li>
        <li><strong>Klopfen:</strong> Eine abgeworfene Karte darf von einem anderen Spieler schnell
        „abgeklopft“ und genommen werden, muss dafür aber selbst eine Karte abwerfen.</li>
      </ul>
    </div>
  `;
}
