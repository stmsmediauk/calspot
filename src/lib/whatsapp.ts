/**
 * WhatsApp click-to-chat helpers. A wa.me link opens a chat with the message
 * already typed in; the person still taps Send in their own WhatsApp. Nothing
 * is sent by Calspot and no WhatsApp API is used.
 */
export type WhatsAppTemplates = {
  confirm: string;
  decline: string;
  suggest: string;
  reminder: string;
};

export const defaultTemplates: WhatsAppTemplates = {
  confirm:
    "Hi {first}, you’re booked in: {lesson} at {club} on {date} at {time}. See you on court! {coach}",
  decline:
    "Hi {first}, thanks for your request for {date} at {time}. Sorry, I can’t do that one. {coach}",
  suggest:
    "Hi {first}, thanks for your request. I can’t do {date} at {time}, but could you do {suggestion} instead? Let me know and I’ll confirm. {coach}",
  reminder:
    "Hi {first}, a quick reminder about your {lesson} on {date} at {time} at {club}. See you then! {coach}",
};

export const templateLabels: Record<keyof WhatsAppTemplates, string> = {
  confirm: "Request approved",
  decline: "Request declined",
  suggest: "Suggest another time",
  reminder: "Session reminder",
};
export const templateFields = [
  "{first}",
  "{name}",
  "{lesson}",
  "{club}",
  "{date}",
  "{time}",
  "{suggestion}",
  "{coach}",
] as const;

export type TemplateVars = Partial<
  Record<(typeof templateFields)[number] extends `{${infer K}}` ? K : never, string>
>;

/** Fills {placeholders}. Unknown or missing values are left blank. */
export function renderTemplate(template: string, vars: TemplateVars) {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) =>
      (vars as Record<string, string | undefined>)[key] ?? "",
    )
    .replace(/[ \t]+/g, " ")
    .replace(/ ([.,!?])/g, "$1")
    .trim();
}

/**
 * Digits-only international number for wa.me, or null if it does not look
 * valid. UK-style numbers starting 0 are treated as +44, matching the
 * platform's default timezone and market.
 */
export function waNumber(input: string, defaultCountry = "44") {
  const cleaned = input.replace(/[\s().-]/g, "");
  if (!cleaned) return null;
  let digits: string;
  if (cleaned.startsWith("+")) digits = cleaned.slice(1);
  else if (cleaned.startsWith("00")) digits = cleaned.slice(2);
  else if (cleaned.startsWith("0")) digits = defaultCountry + cleaned.slice(1);
  else digits = cleaned;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

/** A wa.me chat link with a prefilled message, or null without a valid number. */
export function waLink(number: string, message: string) {
  const digits = waNumber(number);
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : null;
}
