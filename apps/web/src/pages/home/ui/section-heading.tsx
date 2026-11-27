export function SectionHeading({ id, primary, secondary }: { id: string; primary: string; secondary: string }) {
  return (
    <h2 id={id} className="text-[clamp(2rem,4.5vw,3rem)] leading-tight font-medium tracking-tight text-balance">
      <span className="block text-foreground">{primary}</span>{" "}
      <span className="block text-muted-foreground">{secondary}</span>
    </h2>
  );
}
