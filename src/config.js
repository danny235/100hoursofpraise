// Edit these in one place.
export const VOLUNTEER_URL = 'https://docs.google.com/forms/d/1xMSbclv53nqZqknpAhc-_1XclHHXgxUUQwlsNS6Civ4/viewform';
// Kickoff and finish, West Africa Time (UTC+1). Exactly 100 hours apart.
export const START = new Date('2026-11-16T09:00:00+01:00').getTime();
export const END = new Date('2026-11-20T13:00:00+01:00').getTime();
export const DEPARTMENTS = [
  'Sanitation', 'Protocol', 'Ushering', 'Media', 'Technical', 'Welfare', 'Choir', 'Instrumentalist',
  'Security', 'Medical / First Aid', 'Hospitality', 'Logistics / Transportation',
  'Decoration and Event Setup', 'Follow-up / Evangelism',
];

// Background music: the YouTube video that plays when a visitor enters with sound.
// Set to '' to use the built-in generated loop instead. The link you gave was
// https://music.youtube.com/watch?v=D6PJ6Uib2t0 , so the ID is the part after v=.
export const YOUTUBE_ID = 'D6PJ6Uib2t0';
