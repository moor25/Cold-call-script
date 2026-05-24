import { useState, useEffect } from "react";

const STORAGE_KEY = "smma-live-v2";

/* eslint-disable no-irregular-whitespace */
const Q1 = "„"; // Hungarian opening quote
const Q2 = "”"; // Hungarian closing quote
const DASH = "–"; // en dash

const DEFAULT = [
  { type: "phase", label: "NYITÁS" },
  { type: "you", text: Q1 + "[Vezetéknév] úr/asszony, jól hívtam?" + Q2 },
  { type: "wait", text: "Várd meg a választ" },
  { type: "you", text: Q1 + "[Neved] vagyok, [cég neve]. Bevallom, ez egy hideg hívás " + DASH + " de pontosan 30 másodpercet kérek, és ha azt mondja, nem releváns, azonnal lerakom. Rendben?" + Q2 },
  { type: "phase", label: "FÁJDALOM" },
  { type: "you", text: Q1 + "Azért keresem, mert építőipari cégekkel dolgozunk együtt, és azt látom újra és újra, hogy az érdeklődők nagy része bekér egy árajánlatot, aztkán eltűnik " + DASH + " vagy kiderül, hogy sem a büdzsé, sem a határidő nem volt valós. Ez önöknél is előfordul?" + Q2 },
  { type: "wait", text: "Várd meg a választ " + DASH + " ők kezdjenek el beszélni" },
  {
    type: "ab",
    a: {
      label: "HA IGEN " + DASH + " elismeri a problémát",
      they: Q1 + "Igen, sajnos ez nálunk is gond." + Q2,
      you: "→ Folytasd a Hitelesség résszel lentebb",
    },
    b: {
      label: "HA NEM " + DASH + " nem ismeri el",
      they: Q1 + "Nem, ez nálunk nem jellemző." + Q2,
      you: Q1 + "Örülök, hogy így van. Ha szabad megkérdeznem: jelenleg honnan jön az érdeklődők nagy része " + DASH + " ajánlás, vagy aktívan hirdetnek is valamit?" + Q2,
    },
  },
  {
    type: "sub-ab",
    title: "HA NEM ISMERI EL " + DASH + " következő kérdés után",
    a: {
      label: "HA AJÁNLÁSBÓL ÉL",
      they: Q1 + "Főleg ajánlásból érkeznek." + Q2,
      you: Q1 + "Ez nagyon jól hangzik. A kérdés csak az, hogy ha holnap az egyik fő ajánló forrás kiesik, van-e más csatorna? Mert ezt szokák a cégek akkor meglépni, amikor már szűk a munka " + DASH + " mi azt javasoljuk, hogy előtte legyen kész a rendszer. Pont erről szólna az a 20 perc. Inkább hét eleje vagy vége jobb?" + Q2,
    },
    b: {
      label: "HA HIRDETNEK MÁR",
      they: Q1 + "Igen, hirdetünk is valamit." + Q2,
      you: Q1 + "Melyik platformon fut jelenleg?" + Q2 + " → Ha Facebook: " + Q1 + "És az onnan jövő érdeklődők minősége hogyan alakul?" + Q2 + " → Ha Google/egyéb: " + Q1 + "Mi kifejezetten Facebookon dolgozunk, ahol az AI-alapú előszűrés sokkal pontosabban beállítható. Ez más megközelítés " + DASH + " pont ezt mutatnám meg. Mikor lenne jobb?" + Q2,
    },
  },
  { type: "phase", label: "HITELESSÉG" },
  { type: "you", text: Q1 + "Amit mi csinálunk: Meta-alapú lead kvalifikációs rendszert üzemeltezünk építőipari cégeknek. A hirdetés csak az eszköz " + DASH + " a valódi munka az előszűrésnél történik: AI-val mérjük minden érdeklődő szándékát, projekttípust, időkeretet és büdzsét még az előtt, hogy önökhöz kerülne. Csak az jut el önökhöz, aki valós igénnyel rendelkezik. Jellemzően [X] héten belül [Y db] ilyen, előszűrt érdeklődőt hozunk." + Q2 },
  { type: "phase", label: "ZÁRÁS" },
  { type: "you", text: Q1 + "Nem szeretnék most részletekbe menni telefonon " + DASH + " ez nem egy 10 perces pitch. Amit javaslok: egy 20 perces, kötetlen egyéztetes, ahol megmutatom pontosan hogyan működik a rendszer, önök pedig elmondhaják mi a jelenlegi helyzetük. Ha nem illik össze, nincs semmi következménye. Inkább a hét eleje vagy a vége jobb önöknek?" + Q2 },
  { type: "phase", label: "KIFOGÁSKEZELÉS" },
  {
    type: "objection",
    obj: Q1 + "Már próbáltuk a Facebook hirdetést, nem működött." + Q2,
    resp: Q1 + "Ezt hallom a legtöbbször " + DASH + " és őszintén, az esetek nagy részében igaza van, mert általában nem szűrik az érdeklődőket előre. Mi éppen ebből a problémából indultunk ki. Megmutatom mi a különbség " + DASH + " ha 20 perc után azt mondja, nincs benne semmi új, szóljon. Mikor lenne jobb, kedd vagy csütörtök?" + Q2,
  },
  {
    type: "objection",
    obj: Q1 + "Nincs rá időm most, sok munkánk van." + Q2,
    resp: Q1 + "Ez pontosan a legjobb szituáció erre " + DASH + " mert ha lassabb a szezon, akkor már kapkodni kell. 20 percet tudunk csinálni akár kora reggel is, ahogy kényelmes. Mikor lenne jobb?" + Q2,
  },
  {
    type: "objection",
    obj: Q1 + "Mennyibe kerül?" + Q2,
    resp: Q1 + "Ezt szándékosan nem mondanám most telefonon " + DASH + " mert attól függ, mekkora területet fednek le és milyen kapacitással dolgoznak. Ezt a 20 perces egyéztetesén szoktuk tisztázni. Mikor lenne ez jobb, hét elején vagy végén?" + Q2,
  },
  {
    type: "objection",
    obj: Q1 + "Küldjön emailt / majd visszahívom." + Q2,
    resp: Q1 + "Szoktam emailt küldeni, de tapasztalatból tudom, hogy az építőiparban ez általában elvész. Inkább tegyük be a naptárba most " + DASH + " ha mégsem stimmel, lemondia, semmi gond. Kedd délelőtt vagy csütörtök délután jobb?" + Q2,
  },
  {
    type: "objection",
    obj: Q1 + "Nem érdekel a közösségi média / a hirdetés." + Q2,
    resp: Q1 + "Teljesen érthétő. Amit mi csinálunk, az inkább egy lead-rendszer, mint klasszikus hirdetés. A platform csak az eszköz " + DASH + " a lényeg az, hogy ki jut el önökhöz és ki nem. Ez 20 perc alatt megítélhető. Hét eleje vagy vége jobb?" + Q2,
  },
  {
    type: "objection",
    obj: Q1 + "Van már marketingesünk / ügynökségünk." + Q2,
    resp: Q1 + "Remek " + DASH + " akkor valószínűleg már látják, milyen érdeklődők jönnek. Azt mutatnám meg, hogyan egészíthető ki ez egy AI-alapú szűrővel, ami az érdeklődők minőségét javítja " + DASH + " függetlenül attól, ki futtatja a hirdetéseket. 20 perc " + DASH + " kedd vagy csütörtök jobb?" + Q2,
  },
];

function EditText({ value, onChange, editing }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  if (!editing) return <>{value}</>;
  return (
    <textarea
      value={v}
      onChange={e => setV(e.target.value)}
      onBlur={() => onChange(v)}
      rows={Math.max(2, Math.ceil(v.length / 55))}
      style={{
        width: "100%",
        background: "rgba(232,97,42,0.1)",
        border: "1.5px solid #e8612a",
        borderRadius: 8,
        color: "#f0ece4",
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        fontStyle: "inherit",
        padding: "6px 10px",
        outline: "none",
        resize: "vertical",
      }}
    />
  );
}

export default function App() {
  const [blocks, setBlocks] = useState(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(STORAGE_KEY);
      if (r) setBlocks(JSON.parse(r));
    } catch {}
    setLoaded(true);
  }, []);

  const persist = (b) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const upd = (b) => { setBlocks(b); persist(b); };

  const setF = (i, path, val) => {
    const c = JSON.parse(JSON.stringify(blocks));
    const keys = path.split(".");
    let cur = c[i];
    for (let k = 0; k < keys.length - 1; k++) cur = cur[keys[k]];
    cur[keys[keys.length - 1]] = val;
    upd(c);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#0d0d0b;}
    textarea{font-family:inherit!important;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}

    .phase{font-family:Syne,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#e8612a;display:flex;align-items:center;gap:14px;margin:44px 0 22px;}
    .phase::before{content:'';width:24px;height:2px;background:#e8612a;flex-shrink:0;}
    .phase::after{content:'';flex:1;height:1px;background:rgba(232,97,42,0.18);}

    .you-row{display:grid;grid-template-columns:64px 1fr;gap:0 0;margin:10px 0;}
    .you-pill{display:flex;align-items:flex-start;justify-content:center;padding-top:18px;}
    .you-tag{font-family:Syne,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#e8612a;writing-mode:vertical-rl;transform:rotate(180deg);opacity:0.7;}
    .you-bubble{background:#181510;border-left:3px solid #e8612a;border-radius:0 14px 14px 0;padding:18px 22px;font-style:italic;font-size:15px;line-height:1.8;color:#f0ece4;flex:1;}

    .wait-row{margin:8px 0 8px 64px;}
    .wait-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:7px 14px;font-size:12px;color:#4a4540;letter-spacing:0.03em;}

    .ab-row{margin:10px 0;display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    @media(max-width:640px){.ab-row{grid-template-columns:1fr;}}

    .branch{border-radius:14px;padding:22px 24px;}
    .branch-a{background:#0c1a0d;border:1px solid rgba(60,180,80,0.22);}
    .branch-b{background:#1a0c0c;border:1px solid rgba(220,75,55,0.22);}

    .b-tag{font-family:Syne,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:12px;}
    .b-tag-a{color:#5dba72;}
    .b-tag-b{color:#d05848;}

    .b-they{font-size:13px;color:#6a6360;font-style:italic;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);line-height:1.6;}
    .b-they-label{font-family:Syne,sans-serif;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#3a3530;margin-bottom:5px;}

    .b-you{font-style:italic;font-size:14px;color:#ddd8d0;line-height:1.75;}
    .b-you-label{font-family:Syne,sans-serif;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#c06030;margin-bottom:5px;}

    .sub-ab{margin:6px 0 0 64px;padding-left:20px;border-left:2px solid rgba(220,75,55,0.18);}
    .sub-title{font-family:Syne,sans-serif;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#3a3530;margin:0 0 12px;}

    .obj{margin:12px 0;background:#111;border:1px solid rgba(255,255,255,0.05);border-radius:14px;overflow:hidden;}
    .obj-head{padding:18px 24px 14px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .obj-body{padding:16px 24px 18px;}
    .obj-they-label{font-family:Syne,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#b04838;margin-bottom:8px;}
    .obj-you-label{font-family:Syne,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#4a9a5a;margin-bottom:8px;}
    .obj-they-text{font-size:14px;color:#6a6360;font-style:italic;line-height:1.65;}
    .obj-you-text{font-size:14px;color:#ddd8d0;font-style:italic;line-height:1.75;}

    .edit-btn{background:none;border:1px solid rgba(255,255,255,0.1);color:#4a4540;border-radius:8px;padding:7px 18px;cursor:pointer;font-family:Syne,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.15s;}
    .edit-btn.on{border-color:#e8612a;color:#e8612a;background:rgba(232,97,42,0.1);}
    .del-btn{background:none;border:none;cursor:pointer;color:#2a2520;font-size:13px;padding:2px 5px;border-radius:4px;transition:color 0.15s;margin-top:10px;}
    .del-btn:hover{color:#b04838;}
    .add-btn{background:rgba(232,97,42,0.07);border:1px dashed rgba(232,97,42,0.3);color:#e8612a;border-radius:12px;padding:12px;width:100%;cursor:pointer;font-family:Syne,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:10px;}
    .toast{position:fixed;bottom:20px;right:20px;background:#0c1a0d;border:1px solid rgba(60,180,80,0.4);color:#5dba72;padding:9px 16px;border-radius:9px;font-size:12px;font-family:Syne,sans-serif;font-weight:700;z-index:999;}
  `;

  if (!loaded) return (
    <div style={{ background: "#0d0d0b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style>
      <div style={{ color: "#e8612a", fontFamily: "Syne,sans-serif", fontSize: 13 }}>{"Betöltés…"}</div>
    </div>
  );

  return (
    <div style={{ background: "#0d0d0b", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "#f5f3ee" }}>
      <style>{css}</style>

      <div style={{ borderBottom: "1px solid rgba(232,97,42,0.1)", padding: "14px 32px", position: "sticky", top: 0, background: "rgba(13,13,11,0.97)", backdropFilter: "blur(12px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "Syne,sans-serif", fontSize: 13, fontWeight: 800, color: "#e8612a", letterSpacing: "0.06em" }}>COLD CALL SCRIPT</span>
          <span style={{ fontSize: 12, color: "#2a2520" }}>|</span>
          <span style={{ fontSize: 12, color: "#4a4540" }}>{"Építőipar · 20 perces egyeztetés"}</span>
        </div>
        <button className={`edit-btn${editing ? " on" : ""}`} onClick={() => setEditing(e => !e)}>
          {editing ? "✓ Kész" : "✏ Szerkesztés"}
        </button>
      </div>

      <div style={{ padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 24, flexWrap: "wrap" }}>
        {[
          { color: "#e8612a", label: "Te mondod" },
          { color: "#5dba72", label: "Ha igent mond" },
          { color: "#d05848", label: "Ha nemet mond" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#4a4540" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "4px 28px 80px" }}>
        {blocks.map((block, i) => {

          if (block.type === "phase") return (
            <div key={i} className="phase">
              {editing
                ? <input value={block.label} onChange={e => setF(i, "label", e.target.value)} style={{ background: "rgba(232,97,42,0.1)", border: "1.5px solid #e8612a", borderRadius: 6, color: "#e8612a", fontFamily: "Syne,sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", padding: "3px 8px", outline: "none", width: 160 }} />
                : block.label
              }
            </div>
          );

          if (block.type === "you") return (
            <div key={i} className="you-row">
              <div className="you-pill"><span className="you-tag">Te mondod</span></div>
              <div className="you-bubble">
                <EditText value={block.text} onChange={v => setF(i, "text", v)} editing={editing} />
              </div>
            </div>
          );

          if (block.type === "wait") return (
            <div key={i} className="wait-row">
              <div className="wait-pill">&#9208; <EditText value={block.text} onChange={v => setF(i, "text", v)} editing={editing} /></div>
            </div>
          );

          if (block.type === "ab") return (
            <div key={i} className="ab-row">
              {["a", "b"].map(side => (
                <div key={side} className={`branch branch-${side}`}>
                  <div className={`b-tag b-tag-${side}`}>
                    <EditText value={block[side].label} onChange={v => setF(i, `${side}.label`, v)} editing={editing} />
                  </div>
                  <div className="b-they-label">{"Ő mondja:"}</div>
                  <div className="b-they">
                    <EditText value={block[side].they} onChange={v => setF(i, `${side}.they`, v)} editing={editing} />
                  </div>
                  <div className="b-you-label">Te mondod:</div>
                  <div className="b-you">
                    <EditText value={block[side].you} onChange={v => setF(i, `${side}.you`, v)} editing={editing} />
                  </div>
                </div>
              ))}
            </div>
          );

          if (block.type === "sub-ab") return (
            <div key={i} className="sub-ab">
              <div className="sub-title">
                <EditText value={block.title} onChange={v => setF(i, "title", v)} editing={editing} />
              </div>
              <div className="ab-row" style={{ margin: 0 }}>
                {["a", "b"].map(side => (
                  <div key={side} className={`branch branch-${side}`}>
                    <div className={`b-tag b-tag-${side}`}>
                      <EditText value={block[side].label} onChange={v => setF(i, `${side}.label`, v)} editing={editing} />
                    </div>
                    <div className="b-they-label">{"Ő mondja:"}</div>
                    <div className="b-they">
                      <EditText value={block[side].they} onChange={v => setF(i, `${side}.they`, v)} editing={editing} />
                    </div>
                    <div className="b-you-label">Te mondod:</div>
                    <div className="b-you">
                      <EditText value={block[side].you} onChange={v => setF(i, `${side}.you`, v)} editing={editing} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

          if (block.type === "objection") return (
            <div key={i} className="obj">
              <div className="obj-head">
                <div className="obj-they-label">&#10060; {"Ő mondja:"}</div>
                <div className="obj-they-text">
                  <EditText value={block.obj} onChange={v => setF(i, "obj", v)} editing={editing} />
                </div>
              </div>
              <div className="obj-body">
                <div className="obj-you-label">&#10003; Te mondod:</div>
                <div className="obj-you-text">
                  <EditText value={block.resp} onChange={v => setF(i, "resp", v)} editing={editing} />
                </div>
                {editing && <button className="del-btn" onClick={() => { const c = [...blocks]; c.splice(i, 1); upd(c); }}>&#215; {"töröl"}</button>}
              </div>
            </div>
          );

          return null;
        })}

        {editing && (
          <button className="add-btn" onClick={() => {
            const c = [...blocks];
            c.push({ type: "objection", obj: "Új kifogás…", resp: "Válasz…" });
            upd(c);
          }}>+ {"Új kifogás hozzáadása"}</button>
        )}
      </div>

      {saved && <div className="toast">&#10003; Mentve</div>}
    </div>
  );
}
