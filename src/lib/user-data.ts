import type { Lang, Role } from "@/types";

const USER_PROFILES = {
  manager: {
    name: { th: "ปริญญา ทวีศักดิ์", en: "Parinya Taweesak" },
    initials: "PT",
    email: "parinya.t@minibigc.example",
    employeeId: "EMP-0421-M",
  },
  staff: {
    name: { th: "ณัฐวุฒิ สมบูรณ์", en: "Nattawut Somboon" },
    initials: "NS",
    email: "nattawut.s@minibigc.example",
    employeeId: "EMP-0421-S",
  },
} as const;

export function getUserProfile(role: Role, lang: Lang) {
  const user = USER_PROFILES[role];

  return {
    name: user.name[lang],
    initials: user.initials,
    email: user.email,
    employeeId: user.employeeId,
  };
}
