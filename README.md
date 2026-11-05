# Nederlands B1 naar C1

Webapp voor Nederlands leren: lessen, luisteren, spreken, lezen, schrijven, woordenschat met spaced repetition,
grammatica, toetsen, voortgang en een AI-tutor met geheugen. Stack: Next.js 16, TypeScript, Tailwind,
Supabase (Postgres en Auth), Claude API, Azure Speech.

## Gratis gebruiken

Zonder Azure-sleutel speelt de app audio af met de stem van je browser. Zonder Anthropic-sleutel werken lessen, woordenschat, lezen, luisteren, toetsen en voortgang. De AI-onderdelen (tutor, schrijffeedback, gesprek, oefeningen op maat) vragen wel een Anthropic-sleutel met tegoed.

## Installeren

1. `npm install`
2. Maak een Supabase-project. Voer in de SQL-editor deze bestanden uit, in volgorde:
   `supabase/001_schema.sql`, `002_seed_b1.sql`, `003_seed_reading.sql`, `004_seed_assessment.sql`, `005_seed_b1_unit2.sql`
3. Kopieer `.env.example` naar `.env.local` en vul in:
   - Supabase URL, anon key en service role key (Project settings, API)
   - `ANTHROPIC_API_KEY`
   - `AZURE_SPEECH_KEY` en `AZURE_SPEECH_REGION` (Azure Speech resource, bijvoorbeeld westeurope)
4. Zet in Supabase Auth, URL configuration, je site-URL. Zet e-mailbevestiging uit voor snel testen.
5. `npm run dev` en open http://localhost:3000
6. Deploy op Vercel: zet dezelfde variabelen in de projectinstellingen. Zet de service role key nooit in `NEXT_PUBLIC_` variabelen.

## Controles

- `npm run typecheck` controleert de TypeScript-code.
- `npm run check:content` valideert alle lessen, teksten, toetsvragen en woordenschat in `supabase/*.sql`.
- `npm run build` maakt een productiebuild.

## Meer lessen maken

```
npm run generate -- --level B2 --module "Complexe zinnen" --unit "Lijdende vorm" --kind grammar --topic "lijdende vorm met worden en zijn"
```

Het script laat Claude een les schrijven, valideert de structuur, probeert een keer opnieuw bij fouten
en voegt de les toe aan de database. Voeg `--dry` toe om alleen het resultaat te tonen.
Door AI gemaakte lessen tonen een waarschuwing in de app. Laat een Nederlandstalige ze controleren voordat je erop vertrouwt.
Voor eigen content gebruik je het formaat van de seedbestanden. `npm run check:content` bewaakt dat formaat.

## Mappen

- `app/` pagina's en API-routes (`api/tts`, `stt`, `tutor`, `tutor-chat`, `conversation`, `revision`)
- `components/` interface en oefeningen
- `lib/` planner, spaced repetition, streak, niveauschatting, validatie, geheugen
- `scripts/` content controleren en genereren
- `supabase/` schema en seeddata

## Stand tegenover de acceptatiecriteria

Alle onderdelen zijn gebouwd. Er is nog niets getest met echte Supabase-, Anthropic- of Azure-sleutels.
Test elk punt zelf na de installatie.

| Criterium | Gebouwd | Opmerking |
| --- | --- | --- |
| Registreren, inloggen | ja | Supabase Auth |
| Onboarding | ja | start op B1 |
| Gestructureerd curriculum | gedeeltelijk | structuur voor B1 tot C2, inhoud alleen voor B1 |
| Echte lessen | gedeeltelijk | 8 lessen |
| Natuurlijke audio | ja | Azure, drie stemmen, drie snelheden |
| Praten met AI-tutor | ja | rollenspel en tutorchat |
| Zinvolle correcties | ja | via Claude, ongetest |
| Grammatica oefenen | ja | 5 lessen en oefeningen op maat |
| Woordenschat leren | ja | 46 woorden en uitdrukkingen |
| Originele leesteksten | ja | 4 teksten |
| Schrijven laten corrigeren | ja | |
| Herhalen | ja | spaced repetition en oefeningen op maat |
| Toetsen | gedeeltelijk | alleen de niveautoets |
| Voortgang | ja | |
| Doorgaan na afsluiten | ja | alles staat in de database |
| Persoonlijke volgende les | gedeeltelijk | eerstvolgende onafgeronde les, plan gebruikt fouten en te herhalen woorden |

## Bekende beperkingen

- Uitspraak wordt niet gescoord. Spraakherkenning geeft tekst, geen uitspraakbeoordeling.
- De inhoud dekt een klein deel van B1. B1+ tot C2 bevatten geen lessen.
- Weekly, monthly en milestone toetsen ontbreken. Schrijven en spreken worden niet getoetst.
- De niveauschatting uit 18 vragen is grof. De app belooft geen CEFR-niveau en promoveert niet automatisch.
- AI-feedback is niet foutloos. Tutorgeheugen bewaart alleen leerfeiten, maar controleer het zelf.
- PWA: manifest en icoon bestaan. Installeren op telefoon is niet getest en er is geen offline modus.
