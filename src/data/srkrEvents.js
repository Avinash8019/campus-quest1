export function getEventTimingStatus(event) {
  if (!event) return { label: 'UPCOMING', color: 'green', text: '🟢 UPCOMING' }

  const eventDate = event.eventDate || event.dateValue || (event.date && event.date.match(/^\d{4}-\d{2}-\d{2}$/) ? event.date : null)
  const startTime = event.startTime
  const endTime = event.endTime

  if (eventDate && startTime) {
    try {
      const now = new Date()
      const [startHour, startMin] = startTime.split(':').map(Number)
      const startDateTime = new Date(`${eventDate}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`)

      let endDateTime
      if (endTime) {
        const [endHour, endMin] = endTime.split(':').map(Number)
        endDateTime = new Date(`${eventDate}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`)
      } else {
        endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)
      }

      if (now < startDateTime) {
        return { label: 'UPCOMING', color: 'green', text: '🟢 UPCOMING' }
      } else if (now >= startDateTime && now <= endDateTime) {
        return { label: 'LIVE NOW', color: 'red', text: '🔴 LIVE NOW' }
      } else {
        return { label: 'COMPLETED', color: 'gray', text: '✓ COMPLETED' }
      }
    } catch {
      // Fallback
    }
  }

  if (event.status && event.status.toLowerCase().includes('completed')) {
    return { label: 'COMPLETED', color: 'gray', text: '✓ COMPLETED' }
  }
  return { label: 'UPCOMING', color: 'green', text: '🟢 UPCOMING' }
}

export function formatEventTime(startTime, endTime) {
  if (!startTime) return 'Time to be announced'
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

export function formatEventDate(dateStr) {
  if (!dateStr) return 'Schedule to be announced'
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return dateStr
}

export const srkrEvents = [
  {
    id: 'event-ai-workshop',
    name: 'AI Workshop',
    title: 'AI Workshop',
    category: 'Workshop',
    date: '2026-08-28',
    eventDate: '2026-08-28',
    dateValue: '2026-08-28',
    startTime: '10:00',
    endTime: '12:00',
    venue: 'Main Auditorium',
    location: 'Main Auditorium',
    organizer: 'AI & ML Club',
    description: 'Hands-on interactive AI & Machine Learning workshop covering deep learning foundations, computer vision models, and practical neural networks.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    status: 'Upcoming Official Event',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-hackoverflow',
    name: 'HackOverflow — National Level Hackathon',
    title: 'HackOverflow — National Level Hackathon',
    category: 'Hackathon',
    date: '2026-09-15',
    eventDate: '2026-09-15',
    dateValue: '2026-09-15',
    startTime: '09:00',
    endTime: '18:00',
    venue: 'SRKR Computing Hub & Central Auditorium',
    location: 'SRKR Computing Hub & Central Auditorium',
    organizer: 'SRKR Coding Club & CSE Department',
    description: 'Flagship 24-hour national level hackathon organized for engineering students across the country to solve real-world problems and build innovative software prototypes.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    status: 'Upcoming Official Event',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-samagra',
    name: 'SAMAGRA — National Level Technical Fest',
    title: 'SAMAGRA — National Level Technical Fest',
    category: 'Technical',
    date: '2026-10-10',
    eventDate: '2026-10-10',
    dateValue: '2026-10-10',
    startTime: '09:30',
    endTime: '17:00',
    venue: 'Campus Open Air Theatre & Department Blocks',
    location: 'Campus Open Air Theatre & Department Blocks',
    organizer: 'SRKR Engineering College & Student Activity Centre (SAC)',
    description: 'Premier annual techno-management festival bringing together technical competitions, robotics challenges, coding battles, project expos, and guest lectures.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    status: 'Annual Flagship Fest',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-jaitra',
    name: 'JAITRA — Annual Cultural Festival',
    title: 'JAITRA — Annual Cultural Festival',
    category: 'Cultural',
    date: '2026-11-20',
    eventDate: '2026-11-20',
    dateValue: '2026-11-20',
    startTime: '10:00',
    endTime: '21:00',
    venue: 'Main Campus Grounds & Auditorium',
    location: 'Main Campus Grounds & Auditorium',
    organizer: 'Literary & Cultural Club & Srujana Vatika',
    description: 'Grand annual cultural celebration showcasing fine arts, music, theatre, dance, literary competitions, and creative expressions of SRKR students.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    status: 'Annual Flagship Fest',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-edgecase',
    name: 'EDGECASE — Biweekly Coding Contest',
    title: 'EDGECASE — Biweekly Coding Contest',
    category: 'Competition',
    date: '2026-08-30',
    eventDate: '2026-08-30',
    dateValue: '2026-08-30',
    startTime: '18:00',
    endTime: '20:00',
    venue: 'Online / SRKR Computer Labs',
    location: 'Online / SRKR Computer Labs',
    organizer: 'SRKR Coding Club',
    description: 'Biweekly algorithmic programming challenge designed to enhance competitive programming skills, problem-solving speed, and data structure proficiency.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    status: 'Recurring Activity',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-codequest',
    name: 'CodeQuest — Problem of the Day',
    title: 'CodeQuest — Problem of the Day',
    category: 'Student Activity',
    date: 'Daily during semester sessions',
    dateValue: null,
    startTime: null,
    endTime: null,
    venue: 'Online Coding Portal',
    location: 'Online Coding Portal',
    organizer: 'SRKR Coding Club',
    description: 'Daily practice problem initiative encouraging consistent coding discipline, logic building, and technical interview preparation.',
    image: 'https://images.unsplash.com/photo-1516116211227-bbc15c2cf6bc?auto=format&fit=crop&w=800&q=80',
    status: 'Ongoing Activity',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-iconcoderz',
    name: 'Icon Coderz — Internal Coding Competition',
    title: 'Icon Coderz — Internal Coding Competition',
    category: 'Competition',
    date: '2026-09-05',
    eventDate: '2026-09-05',
    dateValue: '2026-09-05',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'SRKR Computer Center',
    location: 'SRKR Computer Center',
    organizer: 'SRKR Coding Club',
    description: 'Intra-college programming showdown for beginner and advanced coders across all engineering branches to showcase algorithmic thinking.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    status: 'Semester Competition',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-iste-symposium',
    name: 'ISTE Student Convention & Paper Presentation',
    title: 'ISTE Student Convention & Paper Presentation',
    category: 'Seminar',
    date: '2026-09-22',
    eventDate: '2026-09-22',
    dateValue: '2026-09-22',
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Central Library Seminar Hall',
    location: 'Central Library Seminar Hall',
    organizer: 'ISTE SRKR Student Chapter',
    description: 'Technical paper presentation contest and technical symposium covering advancements in artificial intelligence, renewable energy, and core engineering.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    status: 'Scheduled according to academic calendar',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-wec-summit',
    name: 'Women in Leadership & Tech Workshop',
    title: 'Women in Leadership & Tech Workshop',
    category: 'Workshop',
    date: '2026-09-28',
    eventDate: '2026-09-28',
    dateValue: '2026-09-28',
    startTime: '11:00',
    endTime: '13:30',
    venue: 'Administration Seminar Hall',
    location: 'Administration Seminar Hall',
    organizer: 'Women Empowerment Cell (WEC)',
    description: 'Special mentorship, career guidance, and leadership skill-building workshop tailored for women engineering students.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    status: 'Scheduled according to academic calendar',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
  {
    id: 'event-nss-camp',
    name: 'NSS Special Community Service & Blood Donation Camp',
    title: 'NSS Special Community Service & Blood Donation Camp',
    category: 'Student Activity',
    date: '2026-10-02',
    eventDate: '2026-10-02',
    dateValue: '2026-10-02',
    startTime: '08:30',
    endTime: '14:00',
    venue: 'Campus Medical Centre & SAC',
    location: 'Campus Medical Centre & SAC',
    organizer: 'National Service Scheme (NSS Unit)',
    description: 'Voluntary social service initiative, health awareness drive, and blood donation camp supporting the local community in Bhimavaram.',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
    status: 'Annual Community Program',
    official: true,
    verified: true,
    officialUrl: 'https://srkrec.edu.in/',
    isToday: false,
  },
]

export const EVENT_CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Hackathon',
  'Competition',
  'Seminar',
  'Student Activity',
  'Other',
]

export default srkrEvents
