/**
 * Basit zengin metin: metni \n\n ile paragraflara böler.
 * "## " ile başlayan bloklar alt başlık, "- " satırları liste olur.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="prose-site">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i}>{block.slice(3).trim()}</h2>;
        }
        const lines = block.split("\n").map((l) => l.trim());
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2).trim()}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
