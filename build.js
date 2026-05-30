/* Build: erzeugt eine eigenständige Einzeldatei phase10.html,
 * in der CSS und JS direkt eingebettet sind (überall ohne Ordner lauffähig).
 * Aufruf:  node build.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/styles.css"), "utf8");
const rules = fs.readFileSync(path.join(root, "js/rules.js"), "utf8");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");

let out = html
  .replace(
    /<link rel="stylesheet" href="css\/styles\.css" \/>/,
    "<style>\n" + css + "\n  </style>"
  )
  .replace(
    /<script src="js\/rules\.js"><\/script>\s*<script src="js\/app\.js"><\/script>/,
    "<script>\n" + rules + "\n  </script>\n  <script>\n" + app + "\n  </script>"
  );

fs.writeFileSync(path.join(root, "phase10.html"), out);
console.log("phase10.html erstellt (" + out.length + " Bytes)");
