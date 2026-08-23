export function formatClubTime(startTime, endTime) {
  if (!startTime) return 'Schedule varies — check official announcement'
  function to12Hr(t) {
    if (!t) return ''
    if (t.includes('AM') || t.includes('PM')) return t
    const parts = t.split(':')
    if (parts.length < 2) return t
    let h = parseInt(parts[0], 10)
    const m = parts[1]
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${ampm}`
  }

  if (startTime && endTime) {
    return `${to12Hr(startTime)} – ${to12Hr(endTime)}`
  }
  return to12Hr(startTime)
}

export function formatClubDate(dateStr) {
  if (!dateStr) return 'Schedule varies — check official announcement'
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return dateStr
}

export const srkrClubs = [
  {
    id: 'aiml-club',
    name: 'AI & ML Club',
    category: 'Technical',
    icon: '🤖',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Student technical community exploring artificial intelligence, deep learning models, and computer vision projects.',
    description: 'The AI & ML Club at SRKR connects aspiring machine learning engineers to build predictive models, participate in AI hackathons, and collaborate on cutting-edge research.',
    activities: [
      'Weekly Machine Learning and Neural Network hands-on labs',
      'Computer Vision and NLP Project Workshops',
      'AI Hackathon Preparation and Mentorship',
      'Guest talks with Industry AI Specialists',
    ],
    meetingDate: '2026-08-29',
    meetingSchedule: '29 August 2026',
    startTime: '16:00',
    endTime: '17:30',
    location: 'AI & ML Department',
    mapsLocation: 'SRKR Engineering College Bhimavaram Computer Lab',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'AI & ML Department Coordinator',
  },
  {
    id: 'coding-club',
    name: 'SRKR Coding Club',
    category: 'Technical',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Promotes coding culture through workshops, coding challenges, hands-on development sessions, and hackathons.',
    description: 'The SRKR Coding Club is an official student technical organization dedicated to cultivating software development, algorithm design, and competitive programming proficiency across all branches. It organizes regular peer learning sessions, hackathons, and technical interview workshops.',
    activities: [
      'CodeQuest — Problem of the Day practice initiative',
      'EDGECASE — Biweekly Competitive Programming Contest',
      'Icon Coderz — Intra-College Internal Coding Competition',
      'HackOverflow — National Level 24-Hour Hackathon',
      'C Programming & Foundational Problem Solving Workshops',
      'Python & Machine Learning Hands-on Bootcamps',
      'Web Development & Full-Stack Projects',
      'Online Programming Courses & Certifications',
      'Resume Building & Technical Interview Preparation Sessions',
    ],
    meetingDate: '2026-08-30',
    meetingSchedule: '30 August 2026',
    startTime: '17:00',
    endTime: '18:30',
    location: 'SRKR Student Activity Centre (SAC) / Computer Center',
    mapsLocation: 'SRKR Engineering College Bhimavaram Computer Lab',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'Faculty Coordinator & SAC Notice Board',
  },
  {
    id: 'language-nest',
    name: 'Language Nest',
    category: 'Student Activity',
    icon: '🌐',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Centre for foreign languages, communicative English skills, and global career readiness.',
    description: 'Language Nest facilitates linguistic growth, foreign language orientation (including Japanese, German, and French), soft skills development, and international education preparation for SRKR students.',
    activities: [
      'Foreign Language Introductory Modules',
      'Interactive English Communication Workshops',
      'Public Speaking & Debating Sessions',
      'Global Study & Career Guidance Seminars',
    ],
    meetingDate: '2026-09-02',
    meetingSchedule: '2 September 2026',
    startTime: '16:30',
    endTime: '18:00',
    location: 'Centre for Foreign Languages / Central Library',
    mapsLocation: 'SRKR Engineering College Bhimavaram Library',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'Centre for Foreign Languages Coordinator',
  },
  {
    id: 'literary-cultural-club',
    name: 'Literary & Cultural Club',
    category: 'Cultural',
    icon: '🎭',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Coordinates campus arts, literature, stage drama, music, dance, and annual cultural celebrations.',
    description: 'The Literary & Cultural Club is the premier creative body on campus responsible for fostering artistic talents, dramatic performance, literary expression, and organizing flagship college celebrations like JAITRA.',
    activities: [
      'Annual Cultural Fest (JAITRA) Coordination',
      'Literary Debates, Elocution, and Creative Writing',
      'Music, Classical & Western Dance Competitions',
      'Theatre, Mime & Stage Drama Showcases',
    ],
    meetingDate: '2026-09-04',
    meetingSchedule: '4 September 2026',
    startTime: '15:30',
    endTime: '17:30',
    location: 'Central Auditorium & Open Air Theatre',
    mapsLocation: 'SRKR Engineering College Bhimavaram Auditorium',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'Cultural Committee & SAC',
  },
  {
    id: 'iste-chapter',
    name: 'Indian Society for Technical Education (ISTE)',
    category: 'Technical',
    icon: '⚙️',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'National professional society promoting technical innovation, paper presentations, and engineering symposiums.',
    description: 'The ISTE Student Chapter at SRKR provides an interdisciplinary platform for budding engineers to present research findings, attend guest lectures by eminent industrialists, and participate in technical competitions.',
    activities: [
      'National Student Conventions & Conferences',
      'Technical Paper & Poster Presentations',
      'Guest Lectures from Industry Experts',
      'Engineering Model Exhibitions & Quizzes',
    ],
    meetingDate: '2026-09-10',
    meetingSchedule: '10 September 2026',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Department Seminar Halls',
    mapsLocation: 'SRKR Engineering College Bhimavaram',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'ISTE Faculty Advisor',
  },
  {
    id: 'ieee-branch',
    name: 'IEEE Student Branch',
    category: 'Technical',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'World largest technical professional organization promoting electrical, electronics, and computing innovations.',
    description: 'IEEE Student Branch at SRKR organizes international webinars, technical paper contests, circuit design challenges, and gives students access to IEEE Xplore digital library publications and global networking.',
    activities: [
      'IEEE Technical Paper Contests',
      'Circuit Simulation & Hardware Hackathons',
      'Webinars with Global IEEE Senior Members',
      'Leadership Training & IEEE Student Conferences',
    ],
    meetingDate: '2026-09-12',
    meetingSchedule: '12 September 2026',
    startTime: '16:00',
    endTime: '17:30',
    location: 'ECE / EEE Department Seminar Hall',
    mapsLocation: 'SRKR Engineering College Bhimavaram',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    contact: 'IEEE Branch Counselor',
  },
]

export const CLUB_CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Social & Outreach',
  'Student Activity',
  'Professional Societies',
]

export default srkrClubs
