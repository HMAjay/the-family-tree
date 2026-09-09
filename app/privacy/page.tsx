export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28">
      <h1 className="font-heading text-5xl text-maroon">Privacy</h1>
      <div className="ornament-line my-6" />
      <p className="leading-relaxed">
        Family data in this demonstration is stored in your browser (local storage). Photographs you add never leave
        this device unless you deploy the project with your own database. The Family Guide answers from the tree you
        can see — it does not send names to a third-party model unless you later connect an API key of your own.
      </p>
    </div>
  );
}
