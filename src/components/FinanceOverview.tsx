import { useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { aggregateAssets } from '@/lib/financeAssets';
import { supportedCurrencies, type Snapshot } from '@/lib/finance';
const colors = [
  '#c46a30',
  '#397c78',
  '#637d51',
  '#b38b42',
  '#726a89',
  '#64899e',
  '#9c685d',
  '#788475',
];
const panel = 'min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-7';
const owners = {
  laura: 'Laura individual',
  joint: 'Laura y David conjunta',
  david: 'David individual',
};
function Allocation({
  title,
  entries,
  money,
}: {
  title: string;
  entries: { name: string; value: number }[];
  money: (n: number) => string;
}) {
  const positive = entries
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);
  const data =
    positive.length > 6
      ? [
          ...positive.slice(0, 5),
          {
            name: 'Otros activos',
            value: positive.slice(5).reduce((n, e) => n + e.value, 0),
          },
        ]
      : positive;
  const total = data.reduce((n, e) => n + e.value, 0);
  return (
    <section className={panel} aria-label={title}>
      <h3 className="font-heading text-xl">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Sobre valores positivos incluidos
      </p>
      {total > 0 ? (
        <>
          <div className="mx-auto my-4 w-full max-w-[240px]" aria-hidden="true">
            <PieChart
              width={240}
              height={240}
              style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
            >
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx={120}
                cy={120}
                innerRadius={72}
                outerRadius={104}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((e, i) => (
                  <Cell
                    key={`${i}:${e.name}`}
                    fill={colors[i % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
          <ul className="space-y-3 text-sm">
            {data.map((e, i) => (
              <li
                key={`${i}:${e.name}`}
                className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1"
              >
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <i
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  <span className="min-w-0">{e.name}</span>
                </span>
                <span className="text-right tabular-nums">
                  {((e.value / total) * 100).toFixed(1)}%
                  <span className="block text-xs text-muted-foreground">
                    {money(e.value)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="py-12 text-sm text-muted-foreground">
          Sin valores positivos incluidos para graficar.
        </p>
      )}
    </section>
  );
}
export default function FinanceOverview({
  snapshot: s,
}: {
  snapshot: Snapshot;
}) {
  const [base, setBase] = useState('USD');
  const v = aggregateAssets(s, base);
  const money = (n: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: base,
      maximumFractionDigits: 2,
    }).format(n);
  const classes = new Map<string, number>();
  for (const a of v.assets)
    if (a.value > 0)
      classes.set(a.assetClass, (classes.get(a.assetClass) ?? 0) + a.value);
  const positive = v.assets.reduce((n, a) => n + Math.max(0, a.value), 0);
  return (
    <div className="space-y-6">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-muted-foreground">
              Una visión de tu patrimonio
            </p>
            <h2 className="mt-2 font-heading text-2xl">
              Consolidado · todas las cuentas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Un activo, una fila. Sin importar dónde lo tengas.
            </p>
          </div>
          <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
            Moneda de visualización
            <select
              className="min-h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm text-foreground"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            >
              {supportedCurrencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="my-6 grid gap-5 border-y py-6 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xs text-muted-foreground">
              Valor neto incluido · {base}
            </p>
            <p className="mt-2 font-heading text-3xl tabular-nums sm:text-4xl">
              {money(v.total)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Activos positivos · netos por activo
            </p>
            <p className="mt-2 text-xl tabular-nums">{money(positive)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              PnL incluido · costo conocido
            </p>
            <p className="mt-2 text-xl tabular-nums">{money(v.pnl)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo posiciones con costo disponible ·{' '}
              {v.assets.reduce((n, a) => n + a.unknownCost, 0)} sin costo
              excluidas del PnL
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          PnL no realizado = valor de mercado − costo conocido. No es
          rentabilidad histórica; no incluye resultados realizados ni flujos.
          Los costos desconocidos no se estiman.
        </p>
        <p className="mt-3 text-sm">
          Deuda / posiciones negativas incluidas:{' '}
          <strong className="tabular-nums">{money(v.debt)}</strong>. No se
          dibujan porciones negativas; las gráficas usan valores positivos netos
          por activo.
        </p>
        {v.excludedCount > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm text-destructive"
          >
            Total parcial. {v.excludedCount} saldos excluidos por FX faltante o
            fuente no disponible: {v.exclusions.join('; ')}. Importe excluido en{' '}
            {base}: no determinable sin datos válidos.
          </p>
        )}
      </section>
      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <Allocation
          title="Distribución por activo"
          entries={v.assets.map((a) => ({ name: a.symbol, value: a.value }))}
          money={money}
        />
        <Allocation
          title="Distribución por clase"
          entries={[...classes].map(([name, value]) => ({ name, value }))}
          money={money}
        />
      </div>
      <section className={panel}>
        <div className="mb-5">
          <h2 className="font-heading text-2xl">Tus activos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ordenados por valor incluido · {base}. Cantidades incluidas del
            mismo instrumento; los ETF distintos no se fusionan.
          </p>
        </div>
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Tabla consolidada de activos"
        >
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">
              Activos consolidados de todas las cuentas
            </caption>
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="pb-3 pr-5">Activo</th>
                <th className="pb-3 pr-5">Cantidad incluida</th>
                <th className="pb-3 pr-5">Valor incluido</th>
                <th className="pb-3 pr-5">Peso positivo</th>
                <th className="pb-3">PnL no realizado</th>
              </tr>
            </thead>
            <tbody>
              {v.assets.map((a) => (
                <tr key={a.key} className="border-b last:border-0">
                  <td className="py-4 pr-5">
                    <strong>{a.symbol}</strong>
                    <div className="text-xs text-muted-foreground">
                      {a.name} · {a.assetClass}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {a.accounts.size} cuenta(s)
                      {a.excluded > 0 &&
                        ` · ${a.excluded} saldo(s) excluido(s)`}
                    </div>
                  </td>
                  <td className="pr-5 tabular-nums">
                    {!a.included
                      ? 'No disponible'
                      : new Intl.NumberFormat('es-CO', {
                          maximumFractionDigits: 8,
                        }).format(a.quantity)}
                  </td>
                  <td
                    className={`pr-5 tabular-nums ${a.value < 0 ? 'text-destructive' : ''}`}
                  >
                    {!a.included ? 'No disponible' : money(a.value)}
                    {a.excluded > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Parcial
                      </div>
                    )}
                  </td>
                  <td className="pr-5 tabular-nums">
                    {positive > 0 && a.value > 0
                      ? `${((a.value / positive) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="tabular-nums">
                    {a.isCash ? (
                      '—'
                    ) : a.knownCost ? (
                      <>
                        {money(a.pnl)}
                        <div className="text-xs text-muted-foreground">
                          {a.costStatus === 'partial'
                            ? 'Parcial · solo costo conocido'
                            : 'Costo conocido'}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Costo no disponible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!v.assets.length && (
          <p className="mt-4 text-sm text-muted-foreground">
            Sin cuentas en esta instantánea.
          </p>
        )}
      </section>
      <details className={panel}>
        <summary className="min-h-11 cursor-pointer font-medium">
          Fuentes, advertencias y detalle por ubicación
        </summary>
        <div className="mt-4 space-y-4 text-sm">
          {s.sources.map((source) => {
            const age = Date.now() - Date.parse(source.asOf);
            return (
              <div key={source.id} className="border-b pb-4">
                <strong>{source.label}</strong>
                <p>
                  Fecha de fuente:{' '}
                  {new Date(source.asOf).toLocaleString('es-CO')}
                </p>
                <p>
                  {source.status === 'error' && 'Error de fuente · '}
                  {source.status === 'ok'
                    ? 'Disponible'
                    : 'Detalle excluido de totales y PnL: fuente no disponible'}{' '}
                  ·{' '}
                  {age < 0
                    ? 'Fecha futura: revisar'
                    : age > 86400000
                      ? 'Más de 24 h: desactualizada'
                      : 'Menos de 24 h; no es tiempo real'}
                </p>
                {source.message && <p>{source.message}</p>}
              </div>
            );
          })}
          {s.accounts.map((a) => (
            <div key={a.id}>
              <strong>
                {owners[a.ownership]} · {a.label}
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                Moneda original ·{' '}
                {s.sources.some(
                  (source) => source.id === a.sourceId && source.status === 'ok'
                )
                  ? 'Saldos sujetos a disponibilidad de FX'
                  : 'Fuente no disponible · excluida de totales'}
              </p>
              <ul className="mt-2 space-y-2">
                {a.holdings.map((h) => (
                  <li key={h.symbol}>
                    <strong>{h.symbol}</strong> · {h.quantity} unidades ·{' '}
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: h.currency,
                    }).format(h.marketValue)}
                    <span className="block text-xs text-muted-foreground">
                      {h.costBasis === null
                        ? 'Costo no disponible'
                        : `Costo original: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: h.currency }).format(h.costBasis)}`}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                {a.cash
                  .map((c) => `Efectivo / deuda ${c.currency}: ${c.amount}`)
                  .join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
