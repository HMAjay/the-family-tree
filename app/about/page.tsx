export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28">
      <h1 className="font-heading text-5xl text-maroon">About</h1>
      <div className="ornament-line my-6" />
      <p className="text-lg leading-relaxed">
        The Family Tree is a digital heirloom — a place to keep names, photographs, recipes, and the quiet facts of
        kinship so they are not lost between houses. It is built for families who still light a lamp before a journey.
      </p>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Relationships are inferred from verified parent and marriage links. The Family Guide will never invent a
        grandfather, a cousin, or a wedding that is not on the tree.
      </p>
    </div>
  );
}
