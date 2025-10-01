import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enCommon from "@/locales/en/common.json";
import enDashboard from "@/locales/en/dashboard.json";
import enExpenses from "@/locales/en/expenses.json";
import enVehicles from "@/locales/en/vehicles.json";
import enUsers from "@/locales/en/users.json";
import enRoles from "@/locales/en/roles.json";
import enRoleManagement from "@/locales/en/roleManagement.json";
import enProfile from "@/locales/en/profile.json";
import enUserManagement from "@/locales/en/userManagement.json";
import enAudit from "@/locales/en/audit.json";
import enSidebar from "@/locales/en/sidebar.json";

import deCommon from "@/locales/de/common.json";
import deDashboard from "@/locales/de/dashboard.json";
import deExpenses from "@/locales/de/expenses.json";
import deVehicles from "@/locales/de/vehicles.json";
import deUsers from "@/locales/de/users.json";
import deRoles from "@/locales/de/roles.json";
import deRoleManagement from "@/locales/de/roleManagement.json";
import deProfile from "@/locales/de/profile.json";
import deUserManagement from "@/locales/de/userManagement.json";
import deAudit from "@/locales/de/audit.json";
import deSidebar from "@/locales/de/sidebar.json";

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    expenses: enExpenses,
    vehicles: enVehicles,
    users: enUsers,
    roles: enRoles,
    roleManagement: enRoleManagement,
    profile: enProfile,
    userManagement: enUserManagement,
    audit: enAudit,
    sidebar: enSidebar,
  },
  de: {
    common: deCommon,
    dashboard: deDashboard,
    expenses: deExpenses,
    vehicles: deVehicles,
    users: deUsers,
    roles: deRoles,
    roleManagement: deRoleManagement,
    profile: deProfile,
    userManagement: deUserManagement,
    audit: deAudit,
    sidebar: deSidebar,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    lng: "de", // Set German as default language
    fallbackLng: "en",
    defaultNS: "common",
    ns: [
      "common",
      "dashboard",
      "expenses",
      "vehicles",
      "users",
      "roles",
      "roleManagement",
      "profile",
      "userManagement",
      "audit",
      "sidebar",
    ],

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for better SSR support
    },
  });

export default i18n;

// Helper function to format currency based on locale
export const formatCurrency = (amount: number, currency: string = "EUR") => {
  const locale = i18n.language === "de" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Helper function to format dates based on locale
export const formatDate = (date: Date | string) => {
  const locale = i18n.language === "de" ? "de-DE" : "en-US";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
};

// Helper function to format numbers based on locale
export const formatNumber = (number: number) => {
  const locale = i18n.language === "de" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale).format(number);
};
