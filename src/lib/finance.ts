import { z } from 'zod';
export const supportedCurrencies = ['USD', 'COP', 'EUR', 'GBP', 'CAD', 'CHF', 'JPY', 'AUD', 'NZD', 'MXN', 'BRL', 'CLP', 'PEN', 'ARS', 'CNY', 'HKD', 'SGD', 'INR', 'KRW', 'SEK', 'NOK', 'DKK', 'ZAR', 'AED'] as const;
const currency = z.enum(supportedCurrencies);
const finite = z.number().finite().max(1e15).min(-1e15);
const id = z.string().min(1).max(120);
const time = z.string().datetime({ offset: true });
const holding = z.object({ symbol: id, name: id, assetClass: id, currency, quantity: finite, marketValue: finite, costBasis: finite.nullable() }).strict();
// Explicit ISO 3166-1 alpha-2 account locations; never inferred from labels/currency.
const countryCodes = new Set('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' '));
const custodyCountry = z.string().refine(value => value === 'unknown' || countryCodes.has(value), 'Expected ISO2 custody country or unknown');
const account = z.object({ id, label: id, custodyCountry: custodyCountry.optional(), ownership: z.enum(['laura', 'joint', 'david']), sourceId: id, balanceScope: id, holdings: z.array(holding).max(2000), cash: z.array(z.object({ currency, amount: finite }).strict()).max(100) }).strict();
export const snapshotSchema = z.object({ version: z.literal(1), asOf: time, baseCurrency: currency, fx: z.record(currency, finite.positive()), sources: z.array(z.object({ id, label: id, asOf: time, status: z.enum(['ok', 'error', 'unavailable']), message: z.string().max(300).optional() }).strict()).max(100), accounts: z.array(account).max(100) }).strict().superRefine((s, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    for (const key of ['id', 'balanceScope'] as const)
        if (new Set(s.accounts.map(a => a[key])).size !== s.accounts.length)
            issue(`Cuenta duplicada: ${key}`);
    if (new Set(s.sources.map(a => a.id)).size !== s.sources.length)
        issue('Fuente duplicada');
    if (s.fx[s.baseCurrency] !== undefined)
        issue('La moneda base no debe incluirse en FX');
    for (const a of s.accounts) {
        if (!s.sources.some(source => source.id === a.sourceId))
            issue('Fuente desconocida');
        if (new Set(a.cash.map(c => c.currency)).size !== a.cash.length)
            issue('Efectivo duplicado');
        if (new Set(a.holdings.map(h => h.symbol)).size !== a.holdings.length)
            issue('Posición duplicada');
    }
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export function summarize(s: Snapshot, accounts = s.accounts) {
    let total = 0, cash = 0, pnl = 0, unknownCost = 0;
    const excluded = new Set<string>();
    const allocation: Record<string, number> = Object.create(null);
    const convert = (value: number, currency: string) => {
        const rate = currency === s.baseCurrency ? 1 : s.fx[currency];
        if (!rate) {
            excluded.add(currency);
            return null;
        }
        return value * rate;
    };
    for (const a of accounts) {
        if (s.sources.find(source => source.id === a.sourceId)?.status !== 'ok') {
            excluded.add(a.label + ': fuente no disponible');
            continue;
        }
        for (const h of a.holdings) {
            const v = convert(h.marketValue, h.currency);
            if (v === null)
                continue;
            total += v;
            allocation[h.assetClass] = (allocation[h.assetClass] || 0) + v;
            if (h.costBasis === null)
                unknownCost++;
            else
                pnl += convert(h.marketValue - h.costBasis, h.currency) ?? 0;
        }
        for (const c of a.cash) {
            const v = convert(c.amount, c.currency);
            if (v !== null) {
                total += v;
                cash += v;
            }
        }
    }
    let cashLabel = 'Efectivo';
    while (Object.prototype.hasOwnProperty.call(allocation, cashLabel)) cashLabel += ' (cash)';
    allocation[cashLabel] = cash;
    return { total, cash, pnl, unknownCost, allocation, excluded: [...excluded] };
}
