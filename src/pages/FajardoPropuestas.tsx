import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://mm295376bh.execute-api.us-east-1.amazonaws.com/prod";
const SUBMIT_ENDPOINT = `${API_BASE}/submit`;
const DOWNLOAD_ENDPOINT = `${API_BASE}/download-data`;
const EMAILS_ENDPOINT = `${API_BASE}/store-proposals/`;
const RECAPTCHA_SITE_KEY = "6LcGXtErAAAAAH91Ws-A18N3l4L4DyyR8zqGexNS";

const DEPARTAMENTOS = [
  "Exterior","Amazonas","Antioquia","Arauca","Atlántico","Bogotá","Bolívar","Boyacá",
  "Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia",
  "Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

const TIPO_DOC_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía (CC)" },
  { value: "CE", label: "Cédula de extranjería (CE)" },
  { value: "PA", label: "Pasaporte (PA)" },
  { value: "TI", label: "Tarjeta de identidad (TI)" },
  { value: "PPT", label: "Permiso por Protección Temporal (PPT)" },
  { value: "NIT", label: "NIT" },
];

const COMO_AYUDAR_OPTIONS = [
  "Quiero recibir más información de Fajardo",
  "Quiero ser voluntario en el equipo de Fajardo",
  "Quiero donar",
  "Ninguna de las anteriores",
];

const CO_MUNICIPIOS: Record<string, string[]> = {
  "Amazonas": ["Leticia","Puerto Nariño"],
  "Antioquia": ["Medellín","Bello","Envigado","Itagüí","Rionegro"],
  "Arauca": ["Arauca","Saravena"],
  "Atlántico": ["Barranquilla","Soledad","Malambo","Puerto Colombia"],
  "Bogotá": ["Bogotá"],
  "Bolívar": ["Cartagena","Turbaco","Arjona"],
  "Boyacá": ["Tunja","Duitama","Sogamoso","Chiquinquirá"],
  "Caldas": ["Manizales","Villamaría","Chinchiná"],
  "Caquetá": ["Florencia","San Vicente del Caguán"],
  "Casanare": ["Yopal","Aguazul","Villanueva"],
  "Cauca": ["Popayán","Santander de Quilichao","Puerto Tejada"],
  "Cesar": ["Valledupar","Aguachica","Bosconia"],
  "Chocó": ["Quibdó","Istmina"],
  "Córdoba": ["Montería","Lorica","Sahagún"],
  "Cundinamarca": ["Soacha","Zipaquirá","Chía","Facatativá","Girardot"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Huila": ["Neiva","Pitalito","Garzón"],
  "La Guajira": ["Riohacha","Maicao","Uribia"],
  "Magdalena": ["Santa Marta","Ciénaga","Fundación"],
  "Meta": ["Villavicencio","Granada","Acacías"],
  "Nariño": ["Pasto","Tumaco","Ipiales"],
  "Norte de Santander": ["Cúcuta","Ocaña","Pamplona"],
  "Putumayo": ["Mocoa","Puerto Asís"],
  "Quindío": ["Armenia","Calarcá","La Tebaida"],
  "Risaralda": ["Pereira","Dosquebradas","La Virginia"],
  "San Andrés y Providencia": ["San Andrés","Providencia"],
  "Santander": ["Bucaramanga","Floridablanca","Girón","Barrancabermeja"],
  "Sucre": ["Sincelejo","Corozal","Sampués"],
  "Tolima": ["Ibagué","Espinal","Melgar"],
  "Valle del Cauca": ["Cali","Palmira","Buenaventura","Tuluá","Buga"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
  "Exterior": ["Exterior / No aplica"],
};

function fmtCO(n: number) {
  try { return new Intl.NumberFormat("es-CO").format(n); } catch { return String(n); }
}

function unwrapResponse(rawText: string) {
  let obj = JSON.parse(rawText);
  if (obj && typeof obj.body === "string") { try { obj = JSON.parse(obj.body); } catch {} }
  return obj;
}

declare global {
  interface Window {
    grecaptcha: any;
    onCaptchaLoadReact: () => void;
  }
}

const FajardoPropuestas = () => {
  const [proposalCount, setProposalCount] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombres: "", apellidos: "", telefono: "", tipoDoc: "", numeroDoc: "",
    correo: "", departamento: "", municipio: "", comoAyudar: "", propuesta: "",
    habeasData: false, moreInfo: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaWidgetId = useRef<number | null>(null);

  // Internal tools state
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Load proposal count
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(DOWNLOAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ file: "proposal_counter" }),
        });
        const raw = await res.text();
        if (!res.ok) return;
        const data = unwrapResponse(raw);
        let count: number | null = null;
        if (data && typeof data.url === "string" && /^https?:\/\//.test(data.url)) {
          const res2 = await fetch(data.url, { headers: { Accept: "application/json, text/plain" } });
          const text = await res2.text();
          try { const obj = JSON.parse(text); count = obj.total ?? obj.count ?? obj.proposals ?? null; }
          catch { const m = text.match(/\d+/); if (m) count = parseInt(m[0], 10); }
        } else if (data) {
          count = data.total ?? data.count ?? data.proposals ?? null;
        }
        if (typeof count === "number") setProposalCount(count);
      } catch {}
    })();
  }, []);

  // Load reCAPTCHA
  useEffect(() => {
    window.onCaptchaLoadReact = () => {
      if (captchaRef.current && captchaWidgetId.current === null && window.grecaptcha) {
        captchaWidgetId.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          size: "normal",
          theme: "light",
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
        });
      }
    };
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const s = document.createElement("script");
      s.src = `https://www.google.com/recaptcha/api.js?onload=onCaptchaLoadReact&render=explicit`;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    } else if (window.grecaptcha?.render) {
      window.onCaptchaLoadReact();
    }
  }, []);

  const municipios = CO_MUNICIPIOS[form.departamento] || [];

  const handleDepartamentoChange = (val: string) => {
    setForm(f => ({ ...f, departamento: val, municipio: val === "Exterior" ? "Exterior / No aplica" : "" }));
  };

  const propuestaLength = form.propuesta.trim().length;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

  const isValid =
    form.nombres.trim() !== "" &&
    form.apellidos.trim() !== "" &&
    phoneRegex.test(form.telefono.trim()) &&
    form.tipoDoc !== "" &&
    form.numeroDoc.trim() !== "" &&
    emailRegex.test(form.correo.trim()) &&
    form.departamento !== "" &&
    form.municipio !== "" &&
    form.comoAyudar !== "" &&
    propuestaLength >= 140 &&
    propuestaLength <= 10000 &&
    form.habeasData &&
    captchaToken !== "";

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setResponseMsg(null);
    try {
      const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        telefono: form.telefono.trim(),
        tipo_documento: form.tipoDoc.trim(),
        numero_documento: form.numeroDoc.trim(),
        correo: form.correo.trim(),
        departamento: form.departamento.trim(),
        municipio: form.municipio.trim(),
        como_quieres_ayudar: form.comoAyudar.trim(),
        propuesta: form.propuesta.trim(),
        habeas: form.habeasData,
        more_info: form.moreInfo,
        recaptcha_token: captchaToken,
      };
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok || (data && data.ok === false)) {
        throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
      }
      setResponseMsg({ ok: true, text: "¡Gracias! Hemos recibido tu propuesta." });
      setForm({ nombres: "", apellidos: "", telefono: "", tipoDoc: "", numeroDoc: "", correo: "", departamento: "", municipio: "", comoAyudar: "", propuesta: "", habeasData: false, moreInfo: false });
      setCaptchaToken("");
      if (window.grecaptcha && captchaWidgetId.current !== null) window.grecaptcha.reset(captchaWidgetId.current);
      setProposalCount(c => (c !== null ? c + 1 : c));
    } catch (err: any) {
      setResponseMsg({ ok: false, text: `Hubo un error al enviar la propuesta: ${err.message || "Intenta de nuevo."}` });
      if (window.grecaptcha && captchaWidgetId.current !== null) window.grecaptcha.reset(captchaWidgetId.current);
      setCaptchaToken("");
    } finally {
      setSubmitting(false);
    }
  };

  const sendEmails = async () => {
    setEmailsLoading(true);
    try {
      await fetch(EMAILS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: "Trigger email lambda" }),
      });
    } catch (err) { console.error("Enviar correos error:", err); }
    finally { setEmailsLoading(false); }
  };

  const startDownload = useCallback(async (fileParam: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const res = await fetch(DOWNLOAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ file: fileParam }),
      });
      const raw = await res.text();
      if (!res.ok) return;
      const data = unwrapResponse(raw);
      const url = data?.url?.trim?.() || "";
      if (!/^https:\/\/.+/.test(url)) return;
      const a = document.createElement("a");
      a.href = url; a.rel = "noopener"; a.target = "_self";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const charCounterText =
    propuestaLength < 140
      ? `${propuestaLength}/140 caracteres mínimos`
      : propuestaLength > 10000
      ? `${propuestaLength}/10000 caracteres (máximo excedido)`
      : `${propuestaLength}/10000 caracteres`;

  const inputClass = "w-full max-w-[400px] px-3 py-2.5 text-base border border-gray-300 rounded box-border";
  const selectClass = "w-full max-w-[400px] px-3 py-2.5 text-base border border-gray-300 rounded box-border bg-white";

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center text-white py-5 mb-8" style={{ background: "#4E2AA6" }}>
        <h1 className="text-4xl font-bold m-0">Colombia Adelante</h1>
        <p className="mt-2 text-lg opacity-90">Construyamos juntos el futuro de nuestro país</p>
      </div>

      {/* Stats banner */}
      <div className="relative max-w-[900px] mx-auto mb-5 px-5 py-4 bg-white border-2 rounded-xl text-center shadow-lg" style={{ borderColor: "#4E2AA6" }}>
        <div className="flex gap-2.5 justify-center items-baseline flex-wrap text-lg text-gray-900">
          <span>Hasta el momento hemos recibido</span>
          <span className="text-4xl font-extrabold min-w-[3ch] inline-block" style={{ color: "#4E2AA6" }}>
            {proposalCount !== null ? fmtCO(proposalCount) : "—"}
          </span>
          <span>propuestas</span>
        </div>
        <div className="mt-1.5 text-sm text-gray-600">¡Súmate con la tuya!</div>
        {/* Colombian flag stripe */}
        <div className="absolute left-0 right-0 bottom-0 h-1.5 rounded-b-xl" style={{ background: "linear-gradient(90deg,#F7C948 0 33.33%,#1F3FBF 33.33% 66.66%,#CE1126 66.66% 100%)" }} />
      </div>

      {/* Form */}
      <div className="relative max-w-full mx-auto bg-gray-50 shadow-lg p-4 text-center">
        <h2 className="text-xl font-semibold mb-4">Comparte tu propuesta para Colombia Adelante</h2>

        <div className="flex flex-col gap-2.5 items-center">
          <div className="flex flex-col gap-2.5 w-full max-w-[400px]">
            <input className={inputClass} type="text" placeholder="Nombres *" value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} />
            <input className={inputClass} type="text" placeholder="Apellidos *" value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} />
            <input className={inputClass} type="tel" placeholder="Número de teléfono * (🇨🇴 321 123 4567)" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />

            <select className={selectClass} value={form.tipoDoc} onChange={e => setForm(f => ({ ...f, tipoDoc: e.target.value }))}>
              <option value="">Tipo de documento de identidad *</option>
              {TIPO_DOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <input className={inputClass} type="text" placeholder="Número de documento *" value={form.numeroDoc} onChange={e => setForm(f => ({ ...f, numeroDoc: e.target.value }))} />
            <input className={inputClass} type="email" placeholder="Correo electrónico *" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />

            <select className={selectClass} value={form.departamento} onChange={e => handleDepartamentoChange(e.target.value)}>
              <option value="">Departamento o persona en el Exterior. *</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select className={selectClass} value={form.municipio} onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))}>
              <option value="">Municipio de residencia *</option>
              {municipios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select className={selectClass} value={form.comoAyudar} onChange={e => setForm(f => ({ ...f, comoAyudar: e.target.value }))}>
              <option value="">Cuéntanos cómo quieres ayudar *</option>
              {COMO_AYUDAR_OPTIONS.map((o, i) => <option key={o} value={o}>{i + 1}. {o}</option>)}
            </select>
          </div>

          <textarea
            className="w-full max-w-[400px] px-3 py-2.5 text-base border border-gray-300 rounded box-border"
            placeholder="Propuesta (mínimo 140 caracteres) *"
            rows={4}
            value={form.propuesta}
            onChange={e => setForm(f => ({ ...f, propuesta: e.target.value }))}
          />
          <div className={`text-xs ${propuestaLength < 140 || propuestaLength > 10000 ? "text-red-600" : "text-gray-500"} -mt-1`}>
            {charCounterText}
          </div>

          {/* Consent checkboxes */}
          <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 items-start mb-4 max-w-[400px] w-full">
            <input type="checkbox" checked={form.habeasData} onChange={e => setForm(f => ({ ...f, habeasData: e.target.checked }))} className="mt-1" />
            <label className="text-left text-sm">¿Autorizas el uso de datos personales de acuerdo a la ley de habeas data? <span className="text-red-500">*</span></label>
            <input type="checkbox" checked={form.moreInfo} onChange={e => setForm(f => ({ ...f, moreInfo: e.target.checked }))} className="mt-1" />
            <label className="text-left text-sm">¿Quisieras recibir más información sobre la campaña?</label>
          </div>

          {/* reCAPTCHA */}
          <div className="my-1.5">
            <div ref={captchaRef} />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="px-6 py-3 text-base font-medium text-white border-none rounded-md cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: "#4E2AA6" }}
          >
            {submitting ? "Enviando..." : "Enviar propuesta"}
          </button>
        </div>

        {submitting && (
          <div className="mt-5">
            <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGd4dWM1ZGJ1bzg2a2N0YzFkOGpmamk1Y2FxOXAyenRyd3Qyem1iNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KG4PMQ0jyimywxNt8i/giphy.gif" alt="Loading" width="100" />
          </div>
        )}

        {responseMsg && (
          <div className={`mt-5 ${responseMsg.ok ? "text-black" : "text-red-600"}`}>
            <p><b>{responseMsg.text}</b></p>
          </div>
        )}

        <p className="text-xs mt-4 text-gray-500">
          Esta es una prueba para recopilar ideas ciudadanas. Tus datos no serán compartidos y serán usados solo con fines informativos.
        </p>

        {/* Colombian flag stripe at bottom */}
        <div className="absolute left-0 right-0 bottom-0 h-1.5" style={{ background: "linear-gradient(90deg,#F7C948 0 33.33%,#1F3FBF 33.33% 66.66%,#CE1126 66.66% 100%)" }} />
      </div>

      {/* Internal tools */}
      <section className="max-w-[900px] mx-auto mt-6 px-5 py-4 border rounded-lg text-sm leading-relaxed" style={{ borderColor: "#ffe08a", background: "#fff7db", color: "#5b4a00" }}>
        <strong className="flex items-center gap-2 text-base">🔒 Herramientas internas</strong>
        <p className="mt-2">
          Las siguientes acciones están destinadas <b>solo</b> al equipo interno para ejecuciones manuales o pruebas.
          En condiciones normales, estas tareas se ejecutan automáticamente mediante un <i>scheduler</i> recurrente.
        </p>
        <ul className="mt-2 ml-5 list-disc">
          <li><b>Enviar correos</b>: dispara manualmente el proceso de envío.</li>
          <li><b>Descargar propuestas / análisis</b>: genera y descarga archivos desde Athena.</li>
        </ul>
      </section>

      {/* Send emails */}
      <section className="text-center py-10" style={{ background: "#f9f9f9" }}>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={sendEmails}
            disabled={emailsLoading}
            className="px-6 py-3 text-base font-medium text-white border-none rounded-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "#0073e6" }}
          >
            Enviar correos
          </button>
          {emailsLoading && (
            <div className="flex items-center gap-2 text-sm">
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGd4dWM1ZGJ1bzg2a2N0YzFkOGpmamk1Y2FxOXAyenRyd3Qyem1iNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KG4PMQ0jyimywxNt8i/giphy.gif" alt="Cargando" width="42" />
              Procesando...
            </div>
          )}
        </div>
      </section>

      {/* Download buttons */}
      <section className="text-center py-10">
        <div className="inline-flex gap-3 flex-wrap items-center">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => startDownload("proposals", setProposalsLoading)}
              disabled={proposalsLoading}
              className="px-6 py-3 text-base font-medium text-white border-none rounded-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "#10b981" }}
            >
              Descargar propuestas
            </button>
            {proposalsLoading && (
              <div className="flex items-center gap-2 text-sm">
                <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGd4dWM1ZGJ1bzg2a2N0YzFkOGpmamk1Y2FxOXAyenRyd3Qyem1iNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KG4PMQ0jyimywxNt8i/giphy.gif" alt="Cargando" width="42" />
                Generando archivo...
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => startDownload("proposals_analyzed", setAnalysisLoading)}
              disabled={analysisLoading}
              className="px-6 py-3 text-base font-medium text-white border-none rounded-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "#2563eb" }}
            >
              Descargar análisis
            </button>
            {analysisLoading && (
              <div className="flex items-center gap-2 text-sm">
                <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGd4dWM1ZGJ1bzg2a2N0YzFkOGpmamk1Y2FxOXAyenRyd3Qyem1iNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KG4PMQ0jyimywxNt8i/giphy.gif" alt="Cargando" width="42" />
                Generando archivo...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FajardoPropuestas;
