"use client";

import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame } from "remotion";

export const INTRO_FPS = 30;
const scenes = [
  {
    "label": "BUNYODKOR ENSIKLOPEDIYASI",
    "title": "Yutuqlaringiz e’tiborga loyiq.",
    "body": "O‘zbekiston yoshlarini tanitadigan platformada o‘z o‘rningizni egallang.",
    "tags": [
      "Yoshlar",
      "Yutuqlar"
    ],
    "number": "01"
  },
  {
    "label": "SIZ HAQINGIZDA MAQOLA",
    "title": "Hayot yo‘lingiz — bir maqolada.",
    "body": "Ta’limingiz, faoliyatingiz va yutuqlaringizni biografiyada yoritamiz.",
    "tags": [
      "Biografiya",
      "Shaxsiy sahifa"
    ],
    "number": "02"
  },
  {
    "label": "GOOGLE VA SUN’IY INTELLEKT",
    "title": "Ismingiz orqali topilish imkoniyati.",
    "body": "Biografiyangiz Google va sun’iy intellekt qidiruvlarida topilishi mumkin.",
    "tags": [
      "Google",
      "Sun’iy intellekt"
    ],
    "number": "03"
  },
  {
    "label": "ULASHISH QULAY",
    "title": "O‘zingizni bitta havola bilan taniting.",
    "body": "Maqolangizni do‘stlar, hamkorlar va ijtimoiy tarmoqlarda ulashing.",
    "tags": [
      "Shaxsiy havola",
      "QR kod"
    ],
    "number": "04"
  },
  {
    "label": "NAVBAT SIZGA",
    "title": "Siz haqingizda ham maqola chiqsin!",
    "body": "“Ariza qoldirish” tugmasini bosing. Ma’lumotlaringizni ko‘rib chiqamiz.",
    "tags": [
      "bunyodkor.com"
    ],
    "number": "05"
  }
];
export const INTRO_FRAMES = scenes.length * 180;

function StoryScene({ scene }: { scene: (typeof scenes)[number] }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ padding: "64px 58px 78px", opacity: interpolate(frame, [0, 14, 168, 179], [0, 1, 1, scene === scenes[scenes.length - 1] ? 1 : 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), translate: `0 ${interpolate(frame, [0, 22], [24, 0], { extrapolateRight: "clamp" })}px` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <Img src="/tilda/images/ozbye-new-logo.svg" style={{ width: 72, height: 72, objectFit: "contain" }} />
      <span style={{ fontSize: 26, fontWeight: 850, letterSpacing: 4, color: "#245991" }}>BUNYODKOR</span>
      <span style={{ marginLeft: "auto", fontSize: 24, color: "#526984" }}>{scene.number} / {String(scenes.length).padStart(2, "0")}</span>
    </div>
    <div style={{ marginTop: 75, fontSize: 23, fontWeight: 800, letterSpacing: 3, color: "#207c82" }}>{scene.label}</div>
    <div style={{ marginTop: 26, fontSize: 60, fontWeight: 850, lineHeight: 1.12, letterSpacing: -2.2, color: "#163e68" }}>{scene.title}</div>
    <div style={{ width: 88, height: 7, borderRadius: 9, background: "#31adb8", marginTop: 36 }} />
    <div style={{ marginTop: 32, fontSize: 30, lineHeight: 1.5, color: "#304d69" }}>{scene.body}</div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
      {scene.tags.map((tag, i) => <span key={tag} style={{ padding: "12px 20px", borderRadius: 30, background: "#ffffffb8", border: "1px solid #bdcee1", fontSize: 24, fontWeight: 750, color: "#245991", opacity: interpolate(frame, [26 + i * 8, 40 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{tag}</span>)}
    </div>
  </AbsoluteFill>;
}

export default function IntroFilm() {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#e4effc", fontFamily: 'var(--font-manrope), Arial, sans-serif', overflow: "hidden" }}>
    <Img src="/images/article-light-waves.webp" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: .38, scale: String(interpolate(frame, [0, INTRO_FRAMES], [1, 1.08])) }} />
    {scenes.map((scene, index) => <Sequence key={scene.number} from={index * 180} durationInFrames={180} name={scene.label}><StoryScene scene={scene} /></Sequence>)}
    <div style={{ position: "absolute", bottom: 30, left: 58, right: 58, display: "flex", gap: 8 }}>
      {scenes.map((scene, index) => <div key={scene.number} style={{ height: 5, flex: 1, borderRadius: 4, background: "#bfd0e5", overflow: "hidden" }}><div style={{ height: "100%", width: `${interpolate(frame, [index * 180, (index + 1) * 180], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`, background: "#245991" }} /></div>)}
    </div>
  </AbsoluteFill>;
}
