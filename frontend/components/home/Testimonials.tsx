import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

// Aucun témoignage réel n'est disponible pour le moment — ne jamais en inventer.
// Cette section est prête à afficher de vrais témoignages dès qu'ils seront
// fournis (ex. via une future table `testimonials` administrable).
const TESTIMONIALS: Testimonial[] = [];

export function Testimonials() {
  return (
    <section className="container-peci py-24 sm:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Ils témoignent
        </span>
        <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Témoignages</h2>
      </div>

      {TESTIMONIALS.length > 0 ? (
        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <Quote className="h-6 w-6 text-peci-green" />
              <p className="mt-4 text-sm leading-relaxed text-peci-dark">{t.quote}</p>
              <p className="mt-4 text-sm font-semibold text-peci-dark">{t.name}</p>
              <p className="text-xs text-peci-grey">{t.role}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-peci-teal/30 bg-peci-grey-light p-10 text-center">
          <Quote className="mx-auto h-7 w-7 text-peci-teal" />
          <p className="mt-4 text-sm text-peci-grey">
            Les témoignages de nos membres, bénévoles et bénéficiaires seront publiés ici prochainement.
          </p>
        </div>
      )}
    </section>
  );
}
