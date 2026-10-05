import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "навсегда",
    description: "Чтобы попробовать и понять ценность",
    features: [
      "3 анализа в месяц",
      "Базовая статистика",
      "ИИ-разбор (стандартный)",
      "План тренировок",
    ],
    cta: "Начать бесплатно",
    href: "/upload",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "590",
    period: "в месяц",
    description: "Для тех, кто серьёзно хочет апнуться",
    features: [
      "Безлимитные анализы",
      "Глубокий ИИ-разбор",
      "Приоритетная очередь",
      "Сравнение с твоим ELO",
      "История всех демок",
      "Экспорт PDF",
      "Поддержка в Telegram",
    ],
    cta: "Оформить Pro",
    href: "/upload",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="relative">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="glow-orb w-[400px] h-[400px] bg-cs2-orange/8 top-10 left-1/2 -translate-x-1/2" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-cs2-muted mb-5">
            <Zap className="w-3 h-3 text-cs2-orange" />
            Простые тарифы без скрытых платежей
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Выбери свой план
          </h1>
          <p className="text-cs2-muted text-sm md:text-base max-w-md mx-auto">
            Начни бесплатно. Когда поймёшь ценность — переходи на Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-7 rounded-2xl border transition-all ${
                plan.highlighted
                  ? "border-cs2-orange/50 bg-cs2-card shadow-glow-orange"
                  : "border-cs2-border/60 bg-cs2-card/50 hover:border-cs2-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cs2-orange text-black text-[11px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Популярный
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-xs text-cs2-zinc mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-cs2-muted text-sm ml-1.5">
                  ₽ {plan.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-cs2-green mt-0.5 shrink-0" />
                    <span className="text-cs2-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-cs2-orange text-black hover:bg-cs2-orange-light shadow-glow-sm"
                    : "border border-cs2-border/80 hover:bg-cs2-card"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-cs2-zinc mt-10">
          Можно отменить в любой момент. Оплата через ЮKassa.
        </p>

        <div className="mt-8 max-w-md mx-auto p-4 rounded-xl border border-cs2-border/40 bg-cs2-card/30 text-center">
          <p className="text-sm text-cs2-muted">
            Pro на год —{" "}
            <span className="text-white font-medium">4 990 ₽</span>
            <span className="text-cs2-zinc"> (≈ 416 ₽/мес)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
