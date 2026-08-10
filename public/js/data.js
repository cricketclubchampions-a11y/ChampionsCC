// Champions Cricket Club - Structured Data Store

const APP_DATA = {
  fixtures: [
    {
      id: "fix-1",
      category: "match",
      type: "League Match",
      title: "Champions CC 1st XI vs Metro Royals",
      date: "Saturday, Aug 15, 2026",
      time: "10:00 AM EST",
      venue: "Main Stadium Oval - Pitch A",
      description: "Premier Division Cup semi-final clash. An amazing display of teamwork and resilience by our boys!",
      homeTeam: "Champions CC",
      awayTeam: "Metro Royals",
      status: "Upcoming"
    },
    {
      id: "fix-2",
      category: "match",
      type: "Friendly Match",
      title: "Weekend Warriors Friendly",
      date: "Sunday, Aug 16, 2026",
      time: "08:30 AM EST",
      venue: "Local Park Ground",
      description: "A casual Sunday morning match where all members got a chance to showcase their skills.",
      status: "Scheduled"
    },
    {
      id: "fix-3",
      category: "tournament",
      type: "Tournament",
      title: "Champions Regional T20 Cup",
      date: "Aug 22 - Aug 25, 2026",
      time: "Full Day Event",
      venue: "Champions Sports Complex",
      description: "Annual 16-team championship featuring premier clubs from across the region competing for the Champions Cup.",
      status: "Featured"
    },
    {
      id: "fix-4",
      category: "camp",
      type: "Training Camp",
      title: "Summer Youth High-Performance Camp",
      date: "Aug 28 - Aug 30, 2026",
      time: "09:00 AM - 04:00 PM",
      venue: "Floodlit Net Complex & Biomechanics Studio",
      description: "3-day intensive camp covering bat speed techniques, seam control, and video action analysis.",
      status: "Open Registration"
    },
    {
      id: "fix-5",
      category: "meeting",
      type: "Club Event",
      title: "Annual Members Gala & Awards Night",
      date: "Friday, Sep 04, 2026",
      time: "07:00 PM EST",
      venue: "Grand Pavilion Ballroom",
      description: "Celebrating player achievements, team trophies, and dinner gala.",
      status: "Upcoming"
    }
  ],

  squad: [
    {
      id: "m-vance",
      roleCategory: "management",
      name: "Marcus Vance",
      role: "Club Captain",
      experience: "12 Years Exp.",
      tenure: "Member for 8 Years",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
      bio: "Former State Opening Batsman with over 4,500 first-class runs. Leads the 1st XI with tactical aggression and mentors younger players.",
      stats: { matches: 142, runs: 4850, average: "42.5", highscore: "164*" }
    },
    {
      id: "s-jenkins",
      roleCategory: "coaches",
      name: "Sarah Jenkins",
      role: "Vice Captain",
      experience: "10 Years Pro",
      tenure: "Member for 6 Years",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
      bio: "Dynamic left-arm spinner. Always happy to share spin variation tactics with new club members.",
      stats: { matches: 118, wickets: 210, economy: "3.85", bestBowling: "6/18" }
    },
    {
      id: "r-sharma",
      roleCategory: "batters",
      name: "Rahul Sharma",
      role: "Top-Order Wicketkeeper Batter",
      experience: "5 Years Pro",
      tenure: "Member for 4 Years",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
      bio: "Explosive stroke-player behind the stumps. Known for quick glovework and high-tempo batting during death overs.",
      stats: { matches: 84, runs: 2940, dismissals: 112, strikeRate: "144.2" }
    },
    {
      id: "l-taylor",
      roleCategory: "bowlers",
      name: "Liam Taylor",
      role: "Fast Bowling Specialist",
      experience: "7 Years Pro",
      tenure: "Member for 5 Years",
      photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
      bio: "Clocking speeds above 140 km/h, Liam leads our pace attack with aggressive seam position and lethal yorkers.",
      stats: { matches: 96, wickets: 178, speedRecord: "144.5 km/h", economy: "4.12" }
    }
  ],

  achievements: [
    { year: "2025", title: "Regional Premier League Champions", desc: "Undefeated championship streak across 14 league matches." },
    { year: "2022", title: "State T20 Cup Winners", desc: "Thrilling 4-run victory in front of 8,000 spectators." },
    { year: "2018", title: "Community Club Founded", desc: "A passionate group of cricketers started this club." }
  ],

  gallery: [
    {
      id: "gal-1",
      category: "matches",
      title: "Championship Final Victory",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    },
    {
      id: "gal-2",
      category: "nets",
      title: "Sunset Turf Net Session",
      image: "https://images.unsplash.com/photo-1512719994953-eabf50895df7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    },
    {
      id: "gal-3",
      category: "training",
      title: "Weekend Friendly Match",
      image: "https://images.unsplash.com/photo-1565787154274-c8d076ad34e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    },
    {
      id: "gal-4",
      category: "awards",
      title: "Annual Awards Gala Celebration",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    }
  ]
};
