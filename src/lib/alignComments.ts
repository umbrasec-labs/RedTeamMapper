/** Code, then two or more spaces, then a `// ` comment. */
const TRAILING = /^(.*\S) {2,}(\/\/ .*)$/;
const GAP = 3;

/**
 * Line up trailing `//` comments so they all start in one column, just past the longest
 * code part. Only comments set off by two or more spaces count, so URLs (`https://`) and
 * comment-only lines are left alone. Lengths count code points, so tree glyphs (├──) are one each.
 */
export function alignComments(text: string): string {
  const lines = text.split('\n');
  const parts = lines.map((line) => TRAILING.exec(line));
  if (parts.filter(Boolean).length < 2) return text;
  const width = Math.max(...parts.map((m) => (m ? [...m[1]].length : 0)));
  return lines
    .map((line, i) => {
      const m = parts[i];
      return m ? `${m[1]}${' '.repeat(width - [...m[1]].length + GAP)}${m[2]}` : line;
    })
    .join('\n');
}
