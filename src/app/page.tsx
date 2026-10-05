import Link from "next/link";
import {
  Upload,
  Brain,
  Target,
  TrendingUp,
  Zap,
  Clock,
  Shield,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" />
      <div className="glow-orb w-[500px] h-[500px] bg-cs2-orange/10 -top-40 -right-40" />
      <div className="glow-orb w-[400px] h-[400px] bg-orange-600/5 bottom-20 -left-40" />

      {/* Hero */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-cs2-muted mb-8 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-cs2-orange" />
            <span>ИИ-тренер уровня 3000+ Faceit</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up">
            Загрузи демку —
            <br />
            <span className="text-gradient">получи разбор</span>
            <br />
            <span className="text-white/90">как у про-тренера</span>
          </h1>

          <p className="text-base md:text-lg text-cs2-muted max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
            Находит конкретные ошибки с таймкодами, объясняет почему это плохо
            и говорит, как нужно было сыграть. Без воды.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
            <Link
              href="/upload"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-cs2-orange text-black font-semibold text-base hover:bg-cs2-orange-light transition-all shadow-glow-orange hover:shadow-[0_0_50px_rgba(249,115,22,0.25)]"
            >
              <Upload className="w-5 h-5" />
              Проанализировать демку
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-cs2-border/80 bg-cs2-card/50 hover:bg-cs2-card hover:border-cs2-border transition-all font-medium text-base"
            >
              Смотреть тарифы
            </Link>
          </div>

          <p className="mt-6 text-sm text-cs2-zinc animate-fade-in-up">
            3 бесплатных анализа в месяц · Без регистрации
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-cs2-border/40 bg-cs2-card/30">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value="3 сек" label="до начала анализа" />
          <Stat value="15+" label="метрик в разборе" />
          <Stat value="3000+" label="ELO уровень ИИ" />
          <Stat value="RU" label="полностью на русском" />
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Что ты получишь после анализа
          </h2>
          <p className="text-cs2-muted text-sm md:text-base max-w-md mx-auto">
            Не общая статистика, а конкретные советы под твою игру
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Brain className="w-5 h-5" />}
            color="orange"
            title="ИИ-разбор на русском"
            description="Конкретные советы с таймкодами. Не «играй лучше», а «в 7 раунде на 1:14 ты рано вышел из смока»."
          />
          <FeatureCard
            icon={<Target className="w-5 h-5" />}
            color="green"
            title="Топ ошибок"
            description="Позиционирование, timing, utility, aim, decision making — всё разложено по приоритету."
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
            title="План тренировок"
            description="Персональные упражнения под твои слабые стороны, чтобы быстро закрыть дыры."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-y border-cs2-border/40 bg-cs2-card/20">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Как это работает
            </h2>
            <p className="text-cs2-muted text-sm md:text-base">
              Три шага до персонального разбора
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-cs2-border to-transparent" />

            <Step number="01" title="Загрузи демку" icon={<Upload className="w-4 h-4" />}>
              Перетащи .dem файл или вставь ссылку Faceit / HLTV
            </Step>
            <Step number="02" title="ИИ анализирует" icon={<Zap className="w-4 h-4" />}>
              Парсим статистику, позиции, гранаты и решения по раундам
            </Step>
            <Step number="03" title="Получи разбор" icon={<Shield className="w-4 h-4" />}>
              Персональный отчёт с ошибками, советами и планом тренировок
            </Step>
          </div>
        </div>
      </section>

      {/* Example preview */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Пример разбора
          </h2>
          <p className="text-cs2-muted text-sm md:text-base">
            Вот как выглядит фидбек от ИИ-тренера
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <ExampleError
            round={7}
            time="1:14"
            category="timing"
            priority="high"
            title="Ранний выход из-за смока"
            why="Противник ещё держал угол. При ELO 2150 такие выходы особенно болезненны."
            how="Подождать 3–4 секунды после смока, дать тиммейту занять connector."
          />
          <ExampleError
            round={3}
            time="0:42"
            category="позиционирование"
            priority="high"
            title="Открытая позиция на mid"
            why="Стоял без укрытия у window — лёгкий opening death."
            how="Встать ближе к стене или играть пассивнее, ожидая информацию."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24">
        <div className="relative rounded-2xl border border-cs2-border/60 bg-gradient-to-b from-cs2-card to-cs2-darker p-10 md:p-14 text-center overflow-hidden">
          <div className="glow-orb w-64 h-64 bg-cs2-orange/10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Готов апнуться?
            </h2>
            <p className="text-cs2-muted mb-8 max-w-md mx-auto text-sm md:text-base">
              Хватит гадать, почему ты застрял. Загрузи одну демку и узнай
              правду.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-cs2-orange text-black font-semibold hover:bg-cs2-orange-light transition-all shadow-glow-orange"
            >
              <Upload className="w-5 h-5" />
              Начать бесплатно
            </Link>
            <p className="mt-4 text-xs text-cs2-zinc flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Первый разбор займёт меньше минуты
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl md:text-2xl font-bold text-white mb-0.5">
        {value}
      </div>
      <div className="text-xs text-cs2-zinc">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  description,
}: {
  icon: React.ReactNode;
  color: "orange" | "green" | "blue";
  title: string;
  description: string;
}) {
  const colors = {
    orange: "bg-cs2-orange/10 text-cs2-orange border-cs2-orange/20",
    green: "bg-cs2-green/10 text-cs2-green border-cs2-green/20",
    blue: "bg-cs2-blue/10 text-cs2-blue border-cs2-blue/20",
  };

  return (
    <div className="group p-6 rounded-2xl bg-cs2-card/60 border border-cs2-border/60 hover:border-cs2-border hover:bg-cs2-card transition-all duration-300">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-2 group-hover:text-white transition">
        {title}
      </h3>
      <p className="text-cs2-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  icon,
  children,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative text-center">
      <div className="w-16 h-16 rounded-2xl bg-cs2-card border border-cs2-border/80 flex flex-col items-center justify-center mx-auto mb-4 relative z-10">
        <span className="text-[10px] font-mono text-cs2-orange mb-0.5">
          {number}
        </span>
        <span className="text-cs2-muted">{icon}</span>
      </div>
      <h3 className="font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-cs2-muted text-sm leading-relaxed max-w-[220px] mx-auto">
        {children}
      </p>
    </div>
  );
}

function ExampleError({
  round,
  time,
  category,
  priority,
  title,
  why,
  how,
}: {
  round: number;
  time: string;
  category: string;
  priority: "high" | "medium";
  title: string;
  why: string;
  how: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-cs2-card/60 border border-cs2-border/60 text-left">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-cs2-zinc mt-0.5">
            Раунд {round} · {time} · {category}
          </p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
            priority === "high"
              ? "bg-cs2-red/15 text-cs2-red"
              : "bg-cs2-orange/15 text-cs2-orange"
          }`}
        >
          {priority === "high" ? "Высокий" : "Средний"}
        </span>
      </div>
      <p className="text-xs text-cs2-muted mb-2">
        <span className="text-cs2-zinc">Почему: </span>
        {why}
      </p>
      <p className="text-xs text-cs2-muted">
        <span className="text-cs2-green">Как правильно: </span>
        {how}
      </p>
    </div>
  );
}
