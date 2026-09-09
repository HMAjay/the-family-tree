import { makeMemoryArt, makePortrait } from "./portraits";
import type { FamilyEvent, FamilySnapshot, MemoryItem, Person, Relationship } from "./types";

function p(
  id: string,
  name: string,
  gender: Person["gender"],
  dob: string,
  extra: Partial<Person> = {}
): Person {
  return {
    id,
    name,
    gender,
    dateOfBirth: dob,
    photo: extra.photo ?? makePortrait(name, gender),
    ...extra,
  };
}

const people: Person[] = [
  p("vishwanatha", "Vishwanatha Sharma", "male", "1898-03-12", {
    dateOfDeath: "1976-08-04",
    nickname: "Ajja",
    location: "Mysuru",
    occupation: "Temple accountant & farmer",
    biography:
      "The quiet root of the Sharma household. He kept the family ledgers beside the tulsi courtyard and believed a name was only as strong as the promises kept under it.",
    notes: "Established the family home near Chamundi Hill.",
  }),
  p("lakshmi", "Lakshmi Bai", "female", "1902-11-21", {
    dateOfDeath: "1981-01-19",
    nickname: "Ajji",
    location: "Mysuru",
    occupation: "Homemaker & storyteller",
    biography:
      "She remembered every cousin's birth star and every monsoon that nearly took the roof. Her stories are still the family's first inheritance.",
  }),
  p("krishnamurthy", "Krishnamurthy Sharma", "male", "1924-06-02", {
    dateOfDeath: "2003-12-11",
    nickname: "Krishna",
    location: "Mysuru",
    occupation: "Silk merchant",
    biography:
      "He turned a modest stall into the first family business, trading Mysore silk with a handshake that rarely needed paper.",
  }),
  p("kamala", "Kamala Devi", "female", "1928-09-14", {
    dateOfDeath: "2010-04-03",
    location: "Mysuru",
    occupation: "Classical vocalist",
    biography: "Her evening ragas filled the courtyard. Neighbours said you could tell the season by what she sang.",
  }),
  p("suryanarayana", "Suryanarayana Sharma", "male", "1926-01-30", {
    dateOfDeath: "2008-07-22",
    nickname: "Surya",
    location: "Mysuru",
    occupation: "School headmaster",
    biography: "He taught three generations of the neighbourhood and never raised his voice louder than a temple bell.",
  }),
  p("parvati", "Parvati Ammal", "female", "1930-05-08", {
    dateOfDeath: "2015-02-17",
    location: "Mysuru",
    occupation: "Weaver",
    biography: "Her looms kept the household in color. Every festival saree in the trunk still carries her knot.",
  }),
  p("sharada", "Sharada Rao", "female", "1929-12-02", {
    dateOfDeath: "2012-09-09",
    location: "Bengaluru",
    occupation: "Nurse",
    biography: "She married into the Rao family of Malleswaram and became the aunt every child wrote letters to.",
  }),
  p("venkatesh", "Venkatesh Rao", "male", "1925-04-18", {
    dateOfDeath: "2001-11-05",
    location: "Bengaluru",
    occupation: "Railway clerk",
    biography: "A punctual man who measured love in return tickets home for Dasara.",
  }),
  p("raghav", "Raghav Sharma", "male", "1948-02-11", {
    dateOfDeath: "2018-06-20",
    nickname: "Thatha",
    location: "Mysuru",
    occupation: "Farmer & storyteller",
    biography:
      "Beloved grandfather, farmer, storyteller and the person who kept the family together. He planted the mango tree that still shades the old house.",
    notes: "Kept a diary of rains and family births.",
  }),
  p("savitri", "Savitri Sharma", "female", "1952-08-27", {
    nickname: "Ajji Savi",
    location: "Mysuru",
    occupation: "Teacher",
    biography: "She taught Kannada for thirty years and still corrects everyone's pronunciation with a smile.",
  }),
  p("ramesh", "Ramesh Sharma", "male", "1951-10-03", {
    location: "Bengaluru",
    occupation: "Chartered accountant",
    biography: "He moved the family accounts to Bengaluru and never missed a sibling's wedding, however far.",
  }),
  p("leela", "Leela Sharma", "female", "1954-03-19", {
    location: "Bengaluru",
    occupation: "Classical dancer",
    biography: "Bharatanatyam shaped her posture and her patience. The children still call her studio 'the gold room'.",
  }),
  p("meenakshi", "Meenakshi Iyer", "female", "1955-07-07", {
    location: "Chennai",
    occupation: "Carnatic violinist",
    biography: "She carried the Sharma kitchen to Chennai and returned every Kartika with jasmine and gossip.",
  }),
  p("suresh", "Suresh Iyer", "male", "1953-01-25", {
    location: "Chennai",
    occupation: "Engineer",
    biography: "A quiet in-law who learned to make filter coffee the Mysuru way, which earned him permanent respect.",
  }),
  p("mohan", "Mohan Sharma", "male", "1956-11-12", {
    location: "Mysuru",
    occupation: "Historian",
    biography: "He archived temple inscriptions and, unofficially, every family photograph before 1980.",
  }),
  p("anjali", "Anjali Hegde", "female", "1958-06-30", {
    location: "Mangaluru",
    occupation: "Physician",
    biography: "The first doctor in the wider family. She still asks after everyone's blood pressure before asking after their news.",
  }),
  p("amit", "Amit Sharma", "male", "1974-05-16", {
    location: "Bengaluru",
    occupation: "Architect",
    biography: "He designs courtyards into modern homes, as if the old Mysuru house were a blueprint he cannot put down.",
  }),
  p("kavita", "Kavita Sharma", "female", "1976-09-02", {
    location: "Bengaluru",
    occupation: "Editor",
    biography: "She collects oral histories and is the reason this family tree was written down at all.",
  }),
  p("priya", "Priya Menon", "female", "1977-12-22", {
    location: "Bengaluru",
    occupation: "School principal",
    biography: "Firm, warm, and never late. The cousins still straighten their spines when she enters a room.",
  }),
  p("vikram", "Vikram Menon", "male", "1975-04-09", {
    location: "Bengaluru",
    occupation: "Journalist",
    biography: "He married into the Sharmas and became the unofficial photographer of every gathering.",
  }),
  p("arjun", "Arjun Sharma", "male", "1980-08-14", {
    location: "Pune",
    occupation: "Software engineer",
    biography: "He left for Pune with a steel tiffin and a promise to come home for every Deepavali. He has kept it.",
  }),
  p("divya", "Divya Sharma", "female", "1982-02-28", {
    location: "Pune",
    occupation: "Ceramicist",
    biography: "Her diyas line the family puja each year — each one slightly imperfect, each one loved.",
  }),
  p("rahul", "Rahul Sharma", "male", "1978-01-05", {
    location: "Bengaluru",
    occupation: "Entrepreneur",
    biography: "He built a small spice company named after his grandfather's orchard.",
  }),
  p("nisha", "Nisha Sharma", "female", "1981-10-17", {
    location: "Bengaluru",
    occupation: "Chef",
    biography: "Guardian of the family recipes. She can taste whether the rasam was made with Ajji's patience or without it.",
  }),
  p("kavya", "Kavya Sharma", "female", "1982-11-09", {
    location: "London",
    occupation: "Museum curator",
    biography: "She sends home postcards of other people's heirlooms and asks for ours to be kept well.",
  }),
  p("ananya", "Ananya Sharma", "female", "2001-03-03", {
    nickname: "Anu",
    location: "Bengaluru",
    occupation: "Design researcher",
    biography: "The keeper of this digital heirloom. She listens more than she speaks, and the elders trust her with names.",
  }),
  p("aditya", "Aditya Sharma", "male", "2005-07-21", {
    nickname: "Adi",
    location: "Bengaluru",
    occupation: "Student",
    biography: "He films the elders on his phone and pretends it is for a college project. Everyone knows it is love.",
  }),
  p("meera", "Meera Menon", "female", "2003-05-18", {
    location: "Bengaluru",
    occupation: "Musician",
    biography: "She inherited Kamala Devi's ear and Priya's discipline. Festival evenings begin when she sits at the veena.",
  }),
  p("rohan", "Rohan Sharma", "male", "2008-09-11", {
    location: "Pune",
    occupation: "Student",
    biography: "Curious about roots he has only visited in summer. He draws the banyan from memory.",
  }),
  p("ishaan", "Ishaan Sharma", "male", "2006-12-01", {
    location: "Bengaluru",
    occupation: "Student",
    biography: "A storyteller like Raghav, except his stories happen on a cricket field first.",
  }),
  p("diya", "Diya Sharma", "female", "2010-02-14", {
    location: "Bengaluru",
    occupation: "Student",
    biography: "Named for light. She is already the one who remembers everyone's favourite sweets.",
  }),
  p("aryan", "Aryan Sharma", "male", "2024-08-08", {
    location: "Bengaluru",
    occupation: "The newest leaf",
    biography: "The family story continues in a very small pair of hands.",
  }),
];

function rel(id: string, personA: string, type: Relationship["type"], personB: string): Relationship {
  return { id, personA, personB, type };
}

const relationships: Relationship[] = [
  rel("r1", "vishwanatha", "husband", "lakshmi"),
  rel("r2", "vishwanatha", "father", "krishnamurthy"),
  rel("r3", "lakshmi", "mother", "krishnamurthy"),
  rel("r4", "vishwanatha", "father", "suryanarayana"),
  rel("r5", "lakshmi", "mother", "suryanarayana"),
  rel("r6", "vishwanatha", "father", "sharada"),
  rel("r7", "lakshmi", "mother", "sharada"),
  rel("r8", "krishnamurthy", "husband", "kamala"),
  rel("r9", "suryanarayana", "husband", "parvati"),
  rel("r10", "sharada", "wife", "venkatesh"),
  rel("r11", "krishnamurthy", "father", "raghav"),
  rel("r12", "kamala", "mother", "raghav"),
  rel("r13", "krishnamurthy", "father", "ramesh"),
  rel("r14", "kamala", "mother", "ramesh"),
  rel("r15", "krishnamurthy", "father", "meenakshi"),
  rel("r16", "kamala", "mother", "meenakshi"),
  rel("r17", "suryanarayana", "father", "mohan"),
  rel("r18", "parvati", "mother", "mohan"),
  rel("r19", "suryanarayana", "father", "anjali"),
  rel("r20", "parvati", "mother", "anjali"),
  rel("r21", "raghav", "husband", "savitri"),
  rel("r22", "ramesh", "husband", "leela"),
  rel("r23", "meenakshi", "wife", "suresh"),
  rel("r24", "raghav", "father", "amit"),
  rel("r25", "savitri", "mother", "amit"),
  rel("r26", "raghav", "father", "priya"),
  rel("r27", "savitri", "mother", "priya"),
  rel("r28", "raghav", "father", "arjun"),
  rel("r29", "savitri", "mother", "arjun"),
  rel("r30", "ramesh", "father", "rahul"),
  rel("r31", "leela", "mother", "rahul"),
  rel("r32", "ramesh", "father", "kavya"),
  rel("r33", "leela", "mother", "kavya"),
  rel("r34", "amit", "husband", "kavita"),
  rel("r35", "priya", "wife", "vikram"),
  rel("r36", "arjun", "husband", "divya"),
  rel("r37", "rahul", "husband", "nisha"),
  rel("r38", "amit", "father", "ananya"),
  rel("r39", "kavita", "mother", "ananya"),
  rel("r40", "amit", "father", "aditya"),
  rel("r41", "kavita", "mother", "aditya"),
  rel("r42", "priya", "mother", "meera"),
  rel("r43", "vikram", "father", "meera"),
  rel("r44", "arjun", "father", "rohan"),
  rel("r45", "divya", "mother", "rohan"),
  rel("r46", "rahul", "father", "ishaan"),
  rel("r47", "nisha", "mother", "ishaan"),
  rel("r48", "rahul", "father", "diya"),
  rel("r49", "nisha", "mother", "diya"),
  rel("r50", "ananya", "mother", "aryan"),
];

const memories: MemoryItem[] = [
  {
    id: "m1",
    title: "The Mysuru courtyard, 1958",
    description: "The first family photograph after the silk stall opened. Vishwanatha stands as if the camera might steal his name.",
    date: "1958-11-02",
    media: makeMemoryArt("Mysuru courtyard", "1958", "home"),
    mediaType: "photo",
    associatedPeople: ["vishwanatha", "lakshmi", "krishnamurthy", "kamala"],
    vintage: true,
  },
  {
    id: "m2",
    title: "Raghav and Savitri's wedding",
    description: "Jasmine, silk, and a mango leaf toran that Savitri still keeps pressed in a book.",
    date: "1971-05-14",
    media: makeMemoryArt("Wedding", "1971", "wedding"),
    mediaType: "photo",
    associatedPeople: ["raghav", "savitri", "krishnamurthy", "kamala"],
    vintage: true,
  },
  {
    id: "m3",
    title: "Dasara gathering, 1987",
    description: "The year the family moved part of the household to Bengaluru. Everyone returned to Mysuru for the procession.",
    date: "1987-10-02",
    media: makeMemoryArt("Dasara", "1987", "gathering"),
    mediaType: "photo",
    associatedPeople: ["raghav", "ramesh", "meenakshi", "amit", "priya"],
    vintage: true,
  },
  {
    id: "m4",
    title: "Letter from Sharada",
    description: "A letter on onion-skin paper asking after the mango tree and sending railway sweets.",
    date: "1992-03-11",
    media: makeMemoryArt("Letter", "1992", "letter"),
    mediaType: "letter",
    associatedPeople: ["sharada", "raghav", "savitri"],
    vintage: true,
  },
  {
    id: "m5",
    title: "The banyan behind the house",
    description: "Raghav's favourite photograph. He said the roots remembered more than the people did.",
    date: "1999-08-20",
    media: makeMemoryArt("Banyan", "1999", "tree"),
    mediaType: "photo",
    associatedPeople: ["raghav", "amit", "arjun"],
    vintage: true,
  },
  {
    id: "m6",
    title: "Devaraja Market mornings",
    description: "Kamala buying jasmine before sunrise. The children were allowed one jalebi if they did not complain.",
    date: "1964-04-09",
    media: makeMemoryArt("Market", "1964", "market"),
    mediaType: "photo",
    associatedPeople: ["kamala", "raghav", "ramesh"],
    vintage: true,
  },
  {
    id: "m7",
    title: "Ananya's naming ceremony",
    description: "The newest generation received her name under the same brass lamp that blessed Raghav.",
    date: "2001-03-21",
    media: makeMemoryArt("Naming", "2001", "gathering"),
    mediaType: "photo",
    associatedPeople: ["ananya", "amit", "kavita", "raghav", "savitri"],
    vintage: false,
  },
  {
    id: "m8",
    title: "Family cookbook pages",
    description: "Nisha photographed Ajji's rasam notes before the ink faded.",
    date: "2016-01-08",
    media: makeMemoryArt("Recipes", "2016", "letter"),
    mediaType: "document",
    associatedPeople: ["nisha", "savitri", "leela"],
    vintage: false,
  },
];

const events: FamilyEvent[] = [
  {
    id: "e1",
    title: "Family roots established in Mysuru",
    date: "1924-06-02",
    description: "Krishnamurthy's birth marked the first generation raised entirely in the Chamundi foothills house.",
    location: "Mysuru",
    associatedPeople: ["vishwanatha", "lakshmi", "krishnamurthy"],
  },
  {
    id: "e2",
    title: "First family business",
    date: "1958-11-01",
    description: "The silk stall opened near Devaraja Market, a handshake business that fed three generations.",
    location: "Mysuru",
    associatedPeople: ["krishnamurthy", "kamala"],
  },
  {
    id: "e3",
    title: "Family moved to Bengaluru",
    date: "1987-06-15",
    description: "Ramesh took a posting in the city. The Mysuru house remained the festival home.",
    location: "Bengaluru",
    associatedPeople: ["ramesh", "leela", "rahul"],
  },
  {
    id: "e4",
    title: "New generation begins",
    date: "2005-07-21",
    description: "Cousins filled the old courtyard again. Aditya's birth was celebrated with mangoes from Raghav's tree.",
    location: "Bengaluru",
    associatedPeople: ["aditya", "amit", "ananya"],
  },
  {
    id: "e5",
    title: "The family story continues",
    date: "2026-01-01",
    description: "This digital heirloom is opened so the youngest leaves can still find the roots.",
    location: "Bengaluru",
    associatedPeople: ["ananya", "aryan"],
  },
  {
    id: "e6",
    title: "Raghav plants the mango tree",
    date: "1973-06-01",
    description: "A sapling for the children, he said. It outlived him, as he hoped.",
    location: "Mysuru",
    associatedPeople: ["raghav", "savitri", "amit"],
  },
];

export const seedFamily: FamilySnapshot = {
  familyName: "The Sharma Family",
  viewerId: "ananya",
  people,
  relationships,
  memories,
  events,
  heritage: {
    origins:
      "The Sharmas trace their known roots to the foothills of Chamundi in Mysuru, where temple accounts, silk, and monsoon farming braided into one household.",
    nativePlace: "Mysuru, Karnataka",
    traditions: [
      "Lighting the brass lamp before any journey",
      "Returning home for Dasara, however far the posting",
      "Naming children under the courtyard mango tree",
      "Keeping a written rain diary beside the kitchen",
    ],
    languages: ["Kannada", "Sanskrit (for ritual)", "Hindi", "English", "Tamil (through the Iyer branch)"],
    festivals: ["Dasara", "Deepavali", "Ugadi", "Makara Sankranti", "Kartika Deepam"],
    occupations: ["Farming", "Silk trade", "Teaching", "Accountancy", "Music", "Medicine", "Design"],
    values: ["Keep your word", "Feed whoever arrives", "Remember the names", "Do not waste water or stories"],
    stories: [
      {
        title: "The ledger and the lamp",
        body: "Vishwanatha would not close the shop until the courtyard lamp was lit. He said numbers should sleep only after the house was blessed.",
      },
      {
        title: "Kamala's raga for rain",
        body: "When the monsoon delayed in 1965, Kamala sang Megh Malhar on the steps until the first drops fell. The children still argue about whether the clouds listened.",
      },
      {
        title: "The railway sweets",
        body: "Sharada sent Mysore pak on every train Venkatesh could arrange. The tin arrived dented, the sweets intact, the letter always asking after the mango tree.",
      },
    ],
    recipes: [
      {
        name: "Ajji's tomato rasam",
        story: "Pepper, cumin, and a tempering that must be heard before it is tasted. Nisha still uses Lakshmi Bai's iron ladle.",
      },
      {
        name: "Festival holige",
        story: "Prepared the night before Ugadi. The filling is never written down; it is learned by standing close enough to be trusted.",
      },
      {
        name: "Filter coffee, Mysuru way",
        story: "Decoction thick enough to stain the steel tumbler. Suresh Iyer's acceptance into the family began with getting this right.",
      },
    ],
  },
};

export const emptyFamily = (familyName = "Our Family"): FamilySnapshot => ({
  familyName,
  viewerId: null,
  people: [],
  relationships: [],
  memories: [],
  events: [],
  heritage: {
    origins: "",
    nativePlace: "",
    traditions: [],
    languages: [],
    festivals: [],
    occupations: [],
    values: [],
    stories: [],
    recipes: [],
  },
});
