import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";

export function buildFlowHref(
  path: string,
  entry?: EntryFlow | null,
  userType?: QuestionnaireUserType | null,
  extra?: Record<string, string | number | undefined | null>,
) {
  const params = new URLSearchParams();
  if (entry) {
    params.set("entry", entry);
  }
  if (userType) {
    params.set("userType", userType);
  }
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
  }

  const query = params.toString();
  if (!query) {
    return path;
  }
  return `${path}?${query}`;
}

