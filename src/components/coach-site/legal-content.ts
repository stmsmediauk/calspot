/**
 * DRAFT legal text for the public coach page. It is a plain-English starting
 * point, not legal advice. Placeholders in [square brackets] must be completed
 * and the whole text reviewed by a qualified UK solicitor before launch.
 */
export type LegalSection = { heading: string; body: string[] };

export const privacySections = (coach: string): LegalSection[] => [
  {
    heading: "Who is responsible",
    body: [
      `${coach} is responsible for the personal information you give when you request a session on this page. Calspot provides the booking-request service on ${coach}’s behalf. [Confirm the controller and processor roles and add the coach’s legal or trading name and contact address.]`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Your name, email address and, if you choose, your phone number, playing level and a message. We also keep the lesson, club and time you asked for and your preferred way to be contacted.",
      "This page does not take payments and does not currently use advertising or analytics cookies. [Confirm before launch.]",
    ],
  },
  {
    heading: "Why we use it",
    body: [
      "To receive your request, let your coach reply to you, arrange a lesson if they accept, and keep a record of the request. [Add the lawful basis, for example steps at your request before a contract, and legitimate interests for record keeping.]",
    ],
  },
  {
    heading: "Who can see it",
    body: [
      `${coach} can see your request. Our hosting and email providers handle it only to run the service. We do not sell your information. [List the providers and any transfers outside the UK.]`,
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "[Add the retention period, for example 12 months after your last request, and how deletion works.]",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask to see, correct or delete the information we hold about you, or object to how we use it. You can also complain to the Information Commissioner’s Office (ico.org.uk). [Add the contact route for requests.]",
    ],
  },
];

export const termsSections = (coach: string): LegalSection[] => [
  {
    heading: "Requests, not bookings",
    body: [
      `Sending a request does not book a lesson. ${coach} reviews each request and a lesson is only confirmed when they approve it.`,
      "A request does not reserve a court. Your coach will confirm court availability with you.",
    ],
  },
  {
    heading: "Prices and payment",
    body: [
      "Prices shown are a guide. This page does not take payment. Your coach will tell you how and when to pay. [Add the coach’s payment terms.]",
    ],
  },
  {
    heading: "Changes and cancellations",
    body: ["[Add the coach’s cancellation, rescheduling and weather policy.]"],
  },
  {
    heading: "Taking part",
    body: [
      "Padel and tennis involve physical activity. Please tell your coach about any injury or health condition before you play. [Add any waiver or insurance wording after legal review.]",
    ],
  },
  {
    heading: "Liability",
    body: [
      "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or anything else the law does not allow to be limited. [Add proportionate limitation wording after legal review.]",
    ],
  },
];
