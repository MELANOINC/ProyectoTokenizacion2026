export type GuideLesson = {
  id: string;
  title: string;
  durationMin: number;
  kicker: string;
  body: string[];
  demoPath: string;
};

/** Guías comerciales: quiénes / qué / cómo — conversión + demo. */
export const GUIDE_LESSONS: GuideLesson[] = [
  {
    id: "tokenizar",
    title: "Qué es tokenizar un activo",
    durationMin: 8,
    kicker: "Tokenización",
    body: [
      "Tokenizar convierte derechos sobre un activo (inmueble, fondo, factura) en un registro digital en blockchain.",
      "En NOTORIUS trabajás con borradores, redes y estándares (ERC-20, 721, 1155, 3643, REIT, revenue share).",
    ],
    demoPath: "/dashboard/contratos",
  },
  {
    id: "flujo-emision",
    title: "Flujo de emisión en NOTORIUS",
    durationMin: 6,
    kicker: "Emisión",
    body: [
      "El flujo operativo es lineal: conectar wallet → firmar acuerdo EIP-712 → deploy IdentityRegistry + SecurityToken → KYC/whitelist → mint controlado.",
      "Cada paso queda trazable on-chain. El emisor opera desde el panel; el inversor solo recibe si está verificado.",
    ],
    demoPath: "/dashboard/emisor",
  },
  {
    id: "quienes-como",
    title: "Quiénes somos y cómo lo implementamos",
    durationMin: 7,
    kicker: "Melano Inc",
    body: [
      "NOTORIUS es el motor de tokenización del hub Melano: Alenya capta, Luxia convierte, NOTORIUS tokeniza.",
      "Implementación en días: diagnóstico del activo, arquitectura legal/técnica, deploy, onboarding KYC y go-live con métricas en el dashboard.",
    ],
    demoPath: "/dashboard",
  },
];

export const GUIDE_STORAGE_KEY = "notorius.guide.completed";
