// ── Types ────────────────────────────────────────────────────────────────────

export interface Institution {
  name: string;
  fullName: string;
  city: string;
  type: "Polytechnic" | "University" | "College";
  color: string;
  website: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const INSTITUTIONS: Institution[] = [
  { name: "SAIT",           fullName: "Southern Alberta Institute of Technology",  city: "Calgary",       type: "Polytechnic", color: "#D4342A", website: "https://www.sait.ca" },
  { name: "NAIT",           fullName: "Northern Alberta Institute of Technology",  city: "Edmonton",      type: "Polytechnic", color: "#003B71", website: "https://www.nait.ca" },
  { name: "U of C",         fullName: "University of Calgary",                     city: "Calgary",       type: "University",  color: "#CF0722", website: "https://ucalgary.ca" },
  { name: "U of A",         fullName: "University of Alberta",                     city: "Edmonton",      type: "University",  color: "#007C41", website: "https://www.ualberta.ca" },
  { name: "MRU",            fullName: "Mount Royal University",                    city: "Calgary",       type: "University",  color: "#003D6B", website: "https://www.mtroyal.ca" },
  { name: "MacEwan",        fullName: "MacEwan University",                        city: "Edmonton",      type: "University",  color: "#00447C", website: "https://www.macewan.ca" },
  { name: "BVC",            fullName: "Bow Valley College",                        city: "Calgary",       type: "College",     color: "#0072CE", website: "https://bowvalleycollege.ca" },
  { name: "U of L",         fullName: "University of Lethbridge",                  city: "Lethbridge",    type: "University",  color: "#00205B", website: "https://www.ulethbridge.ca" },
  { name: "RDP",            fullName: "Red Deer Polytechnic",                      city: "Red Deer",      type: "Polytechnic", color: "#B8292F", website: "https://rdpolytech.ca" },
  { name: "NorQuest",       fullName: "NorQuest College",                          city: "Edmonton",      type: "College",     color: "#4B2E83", website: "https://www.norquest.ca" },
  { name: "Lethbridge Poly",fullName: "Lethbridge Polytechnic",                   city: "Lethbridge",    type: "Polytechnic", color: "#006341", website: "https://lethpolytech.ca" },
  { name: "MHC",            fullName: "Medicine Hat College",                      city: "Medicine Hat",  type: "College",     color: "#0055A2", website: "https://www.mhc.ab.ca" },
  { name: "Olds College",   fullName: "Olds College of Agriculture & Technology",  city: "Olds",          type: "College",     color: "#006B3F", website: "https://www.oldscollege.ca" },
  { name: "Lakeland",       fullName: "Lakeland College",                          city: "Vermilion",     type: "College",     color: "#003F72", website: "https://www.lakelandcollege.ca" },
  { name: "Keyano",         fullName: "Keyano College",                            city: "Fort McMurray", type: "College",     color: "#0055A4", website: "https://www.keyano.ca" },
  { name: "NWP",            fullName: "Northwestern Polytechnic",                  city: "Grande Prairie", type: "Polytechnic", color: "#1D3557", website: "https://nwpolytech.ca" },
  { name: "Concordia",      fullName: "Concordia University of Edmonton",          city: "Edmonton",      type: "University",  color: "#002D62", website: "https://concordia.ab.ca" },
  { name: "Athabasca",      fullName: "Athabasca University",                      city: "Athabasca",     type: "University",  color: "#00539B", website: "https://www.athabascau.ca" },
  { name: "Portage",        fullName: "Portage College",                           city: "Lac La Biche",  type: "College",     color: "#00703C", website: "https://www.portagecollege.ca" },
  { name: "NLC",            fullName: "Northern Lakes College",                    city: "Slave Lake",    type: "College",     color: "#1B4D3E", website: "https://www.northernlakescollege.ca" },
  { name: "AUArts",         fullName: "Alberta University of the Arts",            city: "Calgary",       type: "University",  color: "#E31837", website: "https://www.auarts.ca" },
  { name: "Ambrose",        fullName: "Ambrose University",                        city: "Calgary",       type: "University",  color: "#003366", website: "https://ambrose.edu" },
  { name: "Burman",         fullName: "Burman University",                         city: "Lacombe",       type: "University",  color: "#003B5C", website: "https://www.burmanu.ca" },
  { name: "STMU",           fullName: "St. Mary's University",                     city: "Calgary",       type: "University",  color: "#1E3A5F", website: "https://stmu.ca" },
  { name: "King's",         fullName: "The King's University",                     city: "Edmonton",      type: "University",  color: "#1E3764", website: "https://www.kingsu.ca" },
  { name: "Banff Centre",   fullName: "Banff Centre for Arts and Creativity",      city: "Banff",         type: "College",     color: "#E4572E", website: "https://www.banffcentre.ca" },
];

export const SUGGESTED_QUERIES: string[] = [
  "Software development programs in Calgary",
  "Affordable nursing programs in Alberta",
  "Business diploma under $10,000",
  "Data science or AI courses in Edmonton",
  "Welding or trades certificates",
  "Online degree programs in Alberta",
  "Engineering transfer programs",
  "Early childhood education diploma",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function findInstitution(name: string | null | undefined): Institution | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  return INSTITUTIONS.find(
    (i) =>
      lower.includes(i.name.toLowerCase()) ||
      lower.includes(i.fullName.toLowerCase())
  );
}