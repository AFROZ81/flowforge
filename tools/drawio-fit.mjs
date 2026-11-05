/*
  Diagram linter for docs/Diagrams/*.drawio.

  These files are hand-authored XML, so nothing catches the two failures that
  make a diagram unreadable: label text taller or wider than the shape it sits
  in, and boxes or connectors landing on top of each other. Draw.io will happily
  render both. This estimates Helvetica advance widths at each shape's own font
  size, counts the rows a wrapped line actually occupies, and reports the
  geometry problems it finds.

    node tools/drawio-fit.mjs

  Exit code is the number of problems, so it can gate a commit.
*/
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "Diagrams");

const CHAR_W = (size) => size * 0.545;
const LINE_H = (size) => size * 1.35;

function decode(value) {
    return value
        .replace(/&#10;/g, "\n")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/<[^>]*>/g, "");
}

function styleValue(style, key) {
    const found = new RegExp(`(?:^|;)${key}=([^;]*)`).exec(style);

    return found ? found[1] : undefined;
}

function shapes(raw) {
    return raw
        .split(/<mxCell\b/)
        .slice(1)
        .map((chunk) => {
            const head = chunk.slice(0, chunk.indexOf(">"));
            const attrs = {};

            for (const m of head.matchAll(/(\w+)="([^"]*)"/g)) {
                attrs[m[1]] = m[2];
            }

            const geo = /<mxGeometry[^>]*x="(-?[\d.]+)"[^>]*y="(-?[\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/.exec(
                chunk
            );

            return { attrs, geo: geo ? geo.slice(1).map(Number) : null };
        })
        .filter((s) => s.attrs.vertex === "1" && s.geo);
}

let problems = 0;

for (const file of readdirSync(DIR).filter((n) => n.endsWith(".drawio"))) {
    const raw = readFileSync(join(DIR, file), "utf8");
    const list = shapes(raw);
    const found = [];
    const boxes = [];

    for (const { attrs, geo } of list) {
        const [x, y, w, h] = geo;
        const style = attrs.style || "";
        const size = Number(styleValue(style, "fontSize") || 12);
        const bold = /fontStyle=1/.test(style);
        const isText = style.startsWith("text;");
        const lines = decode(attrs.value || "").split("\n");
        const spacingL = Number(styleValue(style, "spacingLeft") || 0);
        const spacingR = Number(styleValue(style, "spacingRight") || 0);
        const usable = w - spacingL - spacingR - 6;
        const per = Math.max(1, Math.floor(usable / (CHAR_W(size) * (bold ? 1.08 : 1))));

        /* A source line longer than the usable width wraps, and the wrapped
           rows are what spilled past the border before. */
        const rendered = lines.reduce(
            (n, line) => n + Math.max(1, Math.ceil(line.length / per)),
            0
        );
        const neededH = rendered * LINE_H(size) + 20;
        const widest = Math.max(...lines.map((line) => line.length));
        const neededW =
            Math.min(widest, per) * CHAR_W(size) + spacingL + spacingR + 8;
        const id = attrs.id;

        if (!isText && neededH > h + 1) {
            found.push(
                `  ${id}: needs ~${Math.round(neededH)}px tall, has ${h} (${lines.length} lines -> ${rendered} rendered)`
            );
        }

        if (!isText && neededW > w + 1) {
            found.push(
                `  ${id}: needs ~${Math.round(neededW)}px wide, has ${w} (longest line ${widest} chars)`
            );
        }

        boxes.push({ id, x, y, w, h });
    }

    for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
            const a = boxes[i];
            const b = boxes[j];

            if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
                found.push(`  OVERLAP ${a.id} (${a.x},${a.y} ${a.w}x${a.h}) and ${b.id} (${b.x},${b.y} ${b.w}x${b.h})`);
            }
        }
    }

    const page = /pageWidth="(\d+)" pageHeight="(\d+)"/.exec(raw) || [];
    const pageW = Number(page[1] || 0);
    const pageH = Number(page[2] || 0);

    for (const b of boxes) {
        if (b.x + b.w > pageW + 1 || b.y + b.h > pageH + 1) {
            found.push(`  ${b.id} runs off the page to (${b.x + b.w}, ${b.y + b.h}) vs ${pageW}x${pageH}`);
        }
    }

    /* Straight-line approximation of each connector: the segment between its
       exit and entry points should not pass through a third shape. */
    const byId = new Map(boxes.map((b) => [b.id, b]));
    const edges = raw
        .split(/<mxCell\b/)
        .slice(1)
        .map((chunk) => {
            const head = chunk.slice(0, chunk.indexOf(">"));
            const attrs = {};

            for (const m of head.matchAll(/(\w+)="([^"]*)"/g)) {
                attrs[m[1]] = m[2];
            }

            /* Fixed waypoints, in order, if the edge declares them. */
            attrs.points = [...chunk.matchAll(/<mxPoint x="(-?[\d.]+)" y="(-?[\d.]+)"\s*\/>/g)]
                .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));

            return attrs;
        })
        .filter((a) => a.edge === "1" && a.source && a.target);

    for (const e of edges) {
        const a = byId.get(e.source);
        const b = byId.get(e.target);

        if (!a || !b) {
            found.push(`  ${e.id}: edge references a missing shape`);
            continue;
        }

        const style = e.style || "";
        const ex = Number(styleValue(style, "exitX") ?? 0.5);
        const ey = Number(styleValue(style, "exitY") ?? 0.5);
        const nx = Number(styleValue(style, "entryX") ?? 0.5);
        const ny = Number(styleValue(style, "entryY") ?? 0.5);
        const p1 = { x: a.x + ex * a.w, y: a.y + ey * a.h };
        const p2 = { x: b.x + nx * b.w, y: b.y + ny * b.h };
        const path = [p1, ...(e.points || []), p2];

        for (const box of boxes) {
            if (box.id === e.source || box.id === e.target) continue;

            /* Sample every segment; a hit inside a foreign rect is a crossing. */
            for (let s = 0; s < path.length - 1; s += 1) {
                const from = path[s];
                const to = path[s + 1];

                for (let k = 1; k < 40; k += 1) {
                    const t = k / 40;
                    const px = from.x + (to.x - from.x) * t;
                    const py = from.y + (to.y - from.y) * t;

                    if (
                        px > box.x + 2 &&
                        px < box.x + box.w - 2 &&
                        py > box.y + 2 &&
                        py < box.y + box.h - 2
                    ) {
                        found.push(`  ${e.id}: connector crosses ${box.id}`);
                        s = 40;
                        break;
                    }
                }
            }
        }
    }

    console.log(`\n${file} — ${boxes.length} shapes`);
    console.log(found.length ? found.join("\n") : "  fits, no overlaps, inside the page");
    problems += found.length;
}

console.log(`\n${problems} problem(s)`);
process.exitCode = problems > 0 ? 1 : 0;
