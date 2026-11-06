export const metadata = { title: "Privacyverklaring" };

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Privacy() {
  const h = "text-lg font-semibold mt-6 mb-2";
  return (
    <main className="max-w-2xl mx-auto p-6 text-sm leading-relaxed space-y-2 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 min-h-screen">
      <h1 className="text-2xl font-semibold">Privacyverklaring</h1>
      <p>Deze app helpt je Nederlands te leren. Hieronder staat welke gegevens de app bewaart en waarom.</p>

      <h2 className={h}>Welke gegevens</h2>
      <p>E-mailadres en wachtwoord (het wachtwoord wordt versleuteld opgeslagen door de inlogdienst), naam, moedertaal, leerdoelen en gekozen studietijd.</p>
      <p>Leergegevens: lesvoortgang, scores, woordenschat, gemaakte fouten, studietijd, toetsresultaten, teksten die je schrijft, wat je zegt of typt in gesprekken en de notities van de AI-tutor over je leerpunten.</p>

      <h2 className={h}>Waarvoor</h2>
      <p>Alleen om de app te laten werken: inloggen, je voortgang bewaren, oefeningen op maat maken en feedback geven. De gegevens worden niet verkocht en niet gebruikt voor advertenties.</p>

      <h2 className={h}>Wie verwerkt de gegevens</h2>
      <p>Supabase bewaart de database en de inlog. Netlify host de website. Als de AI-functies aanstaan, ontvangt Anthropic de teksten die je naar de tutor stuurt. Als de spraakfuncties aanstaan, ontvangt Microsoft Azure de tekst of audio voor stem en spraakherkenning. Je browser bewaart een inlogsessie en je themakeuze.</p>

      <h2 className={h}>Bewaartermijn</h2>
      <p>Je gegevens blijven bewaard tot je je account verwijdert.</p>

      <h2 id="verwijderen" className={h}>Account en gegevens verwijderen</h2>
      <p>Open in de app Instellingen en kies Account verwijderen. Typ VERWIJDER ter bevestiging. Je account en al je gegevens worden dan direct en definitief gewist.</p>
      {contact ? (
        <p>Lukt dit niet, of heb je een andere vraag over je gegevens? Mail naar <a className="underline" href={`mailto:${contact}`}>{contact}</a>.</p>
      ) : (
        <p className="text-red-600">Contactadres ontbreekt. Stel NEXT_PUBLIC_CONTACT_EMAIL in voordat je deze pagina publiceert.</p>
      )}

      <h2 className={h}>Je rechten</h2>
      <p>Je mag je gegevens inzien, laten verbeteren of laten verwijderen. Gebruik het contactadres hierboven.</p>

      <h2 className={h}>Leeftijd</h2>
      <p>De app is bedoeld voor volwassenen.</p>
    </main>
  );
}
