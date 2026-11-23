import type { Lesson, Rule } from "./mock-data";
import {
  defaultProfile,
  type CoachWorkspace,
  type Highlight,
  type Testimonial,
} from "./workspace-model";
import { lookPresets } from "./coach-theme";

/**
 * Fictional example pages for the landing page, one per look. The coach's name
 * is whatever the visitor types in the "Your name" field. Every club, price,
 * quote and photograph is invented or AI-generated. These
 * never reach the database and are never presented as real people.
 */
export const placeholderName = "Your Name";

type Example = {
  id: string;
  /** Short label for the showcase tab. */
  tab: string;
  look: (typeof lookPresets)[number]["id"];
  workspace: CoachWorkspace;
};

const rule = (
  id: string,
  day: number,
  clubId: string,
  start: number,
  end: number,
  lessonId = "all",
): Rule => ({
  id,
  day,
  clubId,
  lessonId,
  start,
  end,
  effectiveStart: "2020-01-01",
  effectiveEnd: "2099-12-31",
});

const lesson = (
  id: string,
  name: string,
  duration: 60 | 90 | 120,
  price: number,
  capacity: number,
  description: string,
): Lesson => ({ id, name, duration, price, capacity, description, active: true });

function build(input: {
  id: string;
  tab: string;
  look: (typeof lookPresets)[number]["id"];
  title: string;
  tagline: string;
  introduction: string;
  experience: string;
  location: string;
  highlights: Highlight[];
  testimonials: Testimonial[];
  focus: [number, number];
  clubs: { name: string; address: string; notes: string }[];
  lessons: Lesson[];
  /** [day, clubIndex, start, end] */
  hours: [number, number, number, number][];
  instagram: string;
}): Example {
  const preset = lookPresets.find((p) => p.id === input.look)!;
  const clubs = input.clubs.map((c, i) => ({
    id: `${input.id}-club-${i}`,
    ...c,
    active: true,
  }));
  return {
    id: input.id,
    tab: input.tab,
    look: input.look,
    workspace: {
      profile: {
        ...defaultProfile,
        name: placeholderName,
        title: input.title,
        tagline: input.tagline,
        introduction: input.introduction,
        experience: input.experience,
        location: input.location,
        highlights: input.highlights,
        testimonials: input.testimonials,
        instagram: input.instagram,
        photograph: `/examples/${input.id}.jpg`,
        photoFocusX: input.focus[0],
        photoFocusY: input.focus[1],
        // No WhatsApp number, so none is ever shown.
        whatsapp: "",
        appearance: {
          ...preset.appearance,
          showHighlights: true,
          showTestimonials: true,
          showFaq: true,
          poweredBy: true,
        },
      },
      clubs,
      lessons: input.lessons.map((l) => ({ ...l, id: `${input.id}-${l.id}` })),
      bookings: [],
      rules: input.hours.map(([day, club, start, end], i) =>
        rule(`${input.id}-rule-${i}`, day, clubs[club].id, start, end),
      ),
      exceptions: [],
    },
  };
}

export const exampleCoaches: Example[] = [
  build({
    id: "studio",
    tab: "Studio",
    look: "studio",
    title: "Padel coach",
    tagline: "Confidence first, technique second",
    introduction:
      "I help adult beginners and returning players fall in love with padel. My sessions are relaxed, practical and built around what you actually want to improve, whether that’s your first rally or your bandeja.",
    experience:
      "Level 2 padel coach with six years coaching adults and juniors across South London.",
    location: "South London",
    highlights: [
      { value: "6 yrs", label: "Coaching" },
      { value: "400+", label: "Players coached" },
      { value: "Level 2", label: "Qualified" },
    ],
    testimonials: [
      {
        quote:
          "I’d never held a padel racket. Three sessions in, I was beating my partner. Maya makes it fun.",
        attribution: "Hannah, beginner",
      },
    ],
    focus: [35, 30],
    instagram: "",
    clubs: [
      {
        name: "Brixton Padel Club",
        address: "12 Railway Arches, London SW9",
        notes: "Indoor courts. Rackets available to borrow.",
      },
      {
        name: "Clapham Common Courts",
        address: "Windmill Drive, London SW4",
        notes: "Outdoor courts, floodlit.",
      },
    ],
    lessons: [
      lesson("one", "One-to-one lesson", 60, 55, 1, "Fully tailored to you."),
      lesson("duo", "Duo lesson", 60, 35, 2, "Bring a friend and share the court."),
      lesson("beginner", "Beginner group", 90, 18, 4, "Four players, all the basics."),
    ],
    hours: [
      [1, 0, 17, 21],
      [3, 0, 17, 21],
      [2, 1, 9, 13],
      [6, 1, 9, 14],
    ],
  }),
  build({
    id: "journal",
    tab: "Journal",
    look: "journal",
    title: "Padel coach",
    tagline: "Thirty years of racket sports, now on the padel court",
    introduction:
      "After three decades teaching tennis and squash, I found padel and never looked back. I coach thoughtful, tactical padel for players who want to understand the game, not just hit the ball.",
    experience:
      "Former county tennis coach. Padel coach since 2018, working with club teams and social players.",
    location: "Cheshire",
    highlights: [
      { value: "30 yrs", label: "Racket sports" },
      { value: "Club", label: "Team coach" },
      { value: "All levels", label: "Welcome" },
    ],
    testimonials: [
      {
        quote:
          "Tom sees things in your game that nobody else does. Our doubles have never been better.",
        attribution: "Rob and Clare, club players",
      },
    ],
    focus: [40, 25],
    instagram: "",
    clubs: [
      {
        name: "Wilmslow Racquets",
        address: "Station Road, Wilmslow SK9",
        notes: "Indoor courts with a café.",
      },
    ],
    lessons: [
      lesson("private", "Private lesson", 60, 50, 1, "Technique and tactics, one to one."),
      lesson("doubles", "Doubles clinic", 90, 22, 4, "Positioning and patterns for pairs."),
      lesson("match", "Match play coaching", 120, 28, 4, "Coached games with feedback."),
    ],
    hours: [
      [2, 0, 10, 16],
      [4, 0, 10, 16],
      [0, 0, 9, 13],
    ],
  }),
  build({
    id: "clay",
    tab: "Clay split",
    look: "clay",
    title: "Padel coach",
    tagline: "Spanish-style padel, taught properly",
    introduction:
      "I grew up playing padel in Madrid and now bring that energy to Bristol. My lessons are lively and full of drills that make you faster, sharper and braver at the net.",
    experience:
      "Competitive player and qualified coach with ten years in the game, coaching adults and young players.",
    location: "Bristol",
    highlights: [
      { value: "10 yrs", label: "Playing & coaching" },
      { value: "Juniors", label: "Welcome" },
      { value: "Americano", label: "Socials monthly" },
    ],
    testimonials: [
      {
        quote:
          "Sofia’s sessions are the highlight of my week. I’ve learnt more in a month than in a year on my own.",
        attribution: "Daniel, intermediate",
      },
    ],
    focus: [50, 20],
    instagram: "",
    clubs: [
      {
        name: "Harbourside Padel",
        address: "Wapping Wharf, Bristol BS1",
        notes: "Covered courts by the water.",
      },
      {
        name: "Clifton Sports Club",
        address: "Beaufort Road, Bristol BS8",
        notes: "Two outdoor courts.",
      },
    ],
    lessons: [
      lesson("one", "One-to-one lesson", 60, 48, 1, "Personal coaching at your pace."),
      lesson("duo", "Duo lesson", 60, 30, 2, "Train with a partner."),
      lesson("junior", "Junior group", 60, 14, 6, "Fun, skills-first sessions for under-16s."),
      lesson("americano", "Social americano", 120, 12, 12, "Rotating-partner social tournament."),
    ],
    hours: [
      [1, 0, 16, 20],
      [3, 1, 17, 21],
      [6, 0, 9, 14],
    ],
  }),
  build({
    id: "court",
    tab: "Fresh court",
    look: "court",
    title: "Padel coach",
    tagline: "Fast progress, big smiles",
    introduction:
      "I coach padel the way I like to play it: fast, fun and full of laughs. Whether it’s your first lesson or your fiftieth, you’ll leave with something new to work on and a reason to come back.",
    experience:
      "Padel coach for four years, with a background in sports science and a love of group sessions.",
    location: "Manchester",
    highlights: [
      { value: "4 yrs", label: "Coaching" },
      { value: "Groups", label: "My speciality" },
      { value: "Fun", label: "Guaranteed" },
    ],
    testimonials: [
      {
        quote:
          "Jack’s group sessions are the best way to start a weekend. Brilliant energy and everyone improves.",
        attribution: "Priya, regular",
      },
    ],
    focus: [50, 18],
    instagram: "",
    clubs: [
      {
        name: "Northern Quarter Padel",
        address: "Dale Street, Manchester M1",
        notes: "City-centre indoor courts.",
      },
    ],
    lessons: [
      lesson("one", "One-to-one lesson", 60, 45, 1, "Quick progress, tailored to you."),
      lesson("group", "Small group lesson", 60, 16, 4, "Share the court with three others."),
      lesson("social", "Social session", 90, 10, 8, "Coached games with new faces."),
    ],
    hours: [
      [2, 0, 18, 21],
      [4, 0, 18, 21],
      [6, 0, 10, 15],
      [0, 0, 10, 14],
    ],
  }),
  build({
    id: "midnight",
    tab: "Midnight bold",
    look: "midnight",
    title: "Performance padel coach",
    tagline: "Train harder. Play smarter.",
    introduction:
      "I work with competitive players who want to win more. Expect video review, tough drills and honest feedback, with sessions that prepare you for tournament play.",
    experience:
      "Former national-circuit player. Eight years coaching competitive and tournament players.",
    location: "Birmingham",
    highlights: [
      { value: "8 yrs", label: "Coaching" },
      { value: "Circuit", label: "Ex-player" },
      { value: "Video", label: "Match review" },
    ],
    testimonials: [
      {
        quote:
          "Marcus tightened up our tactics and we reached the final of our first tournament. Worth every penny.",
        attribution: "Sam and Jo, tournament pair",
      },
    ],
    focus: [65, 30],
    instagram: "",
    clubs: [
      {
        name: "Edgbaston Padel Centre",
        address: "Harborne Road, Birmingham B15",
        notes: "Floodlit indoor and outdoor courts.",
      },
    ],
    lessons: [
      lesson("performance", "Performance session", 60, 65, 1, "High-intensity one-to-one."),
      lesson("pairs", "Pairs training", 90, 40, 2, "Tactics and patterns for your partnership."),
      lesson("match", "Match analysis", 120, 80, 1, "On-court play with video review."),
    ],
    hours: [
      [1, 0, 19, 22],
      [3, 0, 19, 22],
      [5, 0, 18, 21],
      [0, 0, 9, 13],
    ],
  }),
];

export const getExample = (id: string) =>
  exampleCoaches.find((e) => e.id === id) ?? null;

/** The example workspace with the visitor's name in place of the placeholder. */
export function withName(workspace: CoachWorkspace, name: string): CoachWorkspace {
  const clean = name.trim().slice(0, 60);
  return clean
    ? { ...workspace, profile: { ...workspace.profile, name: clean } }
    : workspace;
}
