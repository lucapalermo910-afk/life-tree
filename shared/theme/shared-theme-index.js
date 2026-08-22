// ── SHARED THEME ──────────────────────────────────────────────────────────────
// Tema centralizado — usado por todos os módulos do monorepo

export const DARK = {
  bg:      "#07090f",
  surface: "#0c1018",
  card:    "#0f1520",
  b1:      "#182030",
  b2:      "#253040",
  text:    "#eef2ff",
  muted:   "#44556a",
  dim:     "#7a8fa8",
  nav:     "#060b12",
};

export const LIGHT = {
  bg:      "#eef1f9",
  surface: "#ffffff",
  card:    "#f8faff",
  b1:      "#c4cfe6",
  b2:      "#98aacf",
  text:    "#07101e",
  muted:   "#556080",
  dim:     "#1e3060",
  nav:     "#eef1f9",
};

// Cor de destaque por módulo (sefirá)
export const MODULE_COLORS = {
  kether:    "#06b6d4", // Desejos
  chokmah:   "#c084fc", // Espiritualidade
  binah:     "#4f46e5", // Conhecimento
  chesed:    "#ec4899", // Relacionamentos
  geburah:   "#ef4444", // Saúde
  tiphareth: "#f59e0b", // Autocuidado
  netzach:   "#84cc16", // Qualidade de Vida
  hod:       "#f97316", // Profissional
  yesod:     "#10b981", // Finanças
  malkuth:   "#b45309", // Pessoal
};

// Mapeamento completo das sefirot
export const SEFIROT_INFO = {
  kether:    { name: "Kether",    ptName: "Coroa",         module: "kether-desejos",          label: "Desejos"          },
  chokmah:   { name: "Chokmah",   ptName: "Sabedoria",     module: "chokmah-espiritualidade",  label: "Espiritualidade"  },
  binah:     { name: "Binah",     ptName: "Entendimento",  module: "binah-conhecimento",       label: "Conhecimento"     },
  chesed:    { name: "Chesed",    ptName: "Misericórdia",  module: "chesed-relacionamentos",   label: "Relacionamentos"  },
  geburah:   { name: "Geburah",   ptName: "Força",         module: "geburah-saude",            label: "Saúde"            },
  tiphareth: { name: "Tiphareth", ptName: "Beleza",        module: "tiphareth-autocuidado",    label: "Autocuidado"      },
  netzach:   { name: "Netzach",   ptName: "Vitória",       module: "netzach-qualidade",        label: "Qualidade de Vida"},
  hod:       { name: "Hod",       ptName: "Esplendor",     module: "hod-profissional",         label: "Profissional"     },
  yesod:     { name: "Yesod",     ptName: "Fundação",      module: "yesod-financas",           label: "Finanças"         },
  malkuth:   { name: "Malkuth",   ptName: "Reino",         module: "malkuth-pessoal",          label: "Pessoal"          },
};

export default { DARK, LIGHT, MODULE_COLORS, SEFIROT_INFO };
