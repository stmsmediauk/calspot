/** Concept content only. Kelly-Jane's name is supplied; business details await approval. */
export const publicCoach = {
  name: "Kelly-Jane Whalley",
  shortName: "Kelly-Jane",
  basePath: "/kelly-jane",
  lessons: [
    {
      id: "private",
      title: "Just you. Your game.",
      name: "Private coaching",
      description:
        "Time to slow things down, focus on the details and work on what matters to you.",
      duration: 60,
      price: 65,
      tag: "One to one",
    },
    {
      id: "duo",
      title: "Better, together.",
      name: "Duo session",
      description:
        "Bring your playing partner. Explore the movement, communication and tactics of playing as a pair.",
      duration: 60,
      price: 80,
      tag: "Two players",
    },
    {
      id: "group",
      title: "More play. More possibility.",
      name: "Group coaching",
      description:
        "Share the court, explore match situations and make learning a little more social.",
      duration: 90,
      price: 100,
      tag: "Up to four players",
    },
  ],
  venues: [
    {
      id: "yard",
      name: "The Padel Yard",
      detail: "Outdoor courts",
      note: "Sample venue — location and coaching arrangements to be confirmed.",
    },
    {
      id: "riverside",
      name: "Riverside Padel Club",
      detail: "Indoor courts",
      note: "Sample venue — location and coaching arrangements to be confirmed.",
    },
  ],
};
