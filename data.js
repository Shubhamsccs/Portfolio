// ==========================================================================
// Portfolio Data — Book-Flip Theme ("My Universe")
// Personal data configuration for Shubham. Update fields as needed.
// ==========================================================================

const portfolioData = {

  // ── PAGE 1: HEADLINE (Full-Spread Hero) ──
  headline: {
    greeting: "Hi there! I'm",
    name: "Shubham",
    tagline: "Google Gemini Student Ambassador (May–July 2026) | CSE (Data Science) @ VIT Pune",
    bio: "Welcome to my universe — a quiet notebook of code, craft, and curiosity.",
    email: "shubhammahekchauhan@gmail.com",
    github: "https://github.com/shubhamsccs",
    linkedin: "https://www.linkedin.com/in/shubham-s-chauhan-b19340370",
    photoUrl: "assets/profile.png"
  },

  // ── PAGE 2: ABOUT ──
  about: {
    paragraphs: [
      "I am a Second Year B.Tech student studying Computer Science (Data Science) at VIT Pune.",
      "I spend most of my time learning web development, practicing programming, and understanding how software works under the hood.",
      "I like using AI tools to assist my learning process, but I always prioritize understanding the core fundamentals first.",
      "I'm here to keep improving my skills, build practical projects, and connect with others in tech."
    ]
  },

  // ── PAGE 3: FEATURED WORK ──
  featured: [],

  // ── PAGE 4: EXPERIENCE ──
  experience: [
    {
      role: "Google Gemini Student Ambassador",
      company: "Google • Internship",
      location: "Pune • On-site",
      period: "May 2026 — July 2026",
      bullets: [
        "Product Marketing and Social Media Marketing.",
        "Representing Google Gemini across campus communities and student tech initiatives."
      ]
    },
    {
      role: "Website Volunteer",
      company: "Student Council VIT PUNE • Apprenticeship",
      location: "Pune • On-site",
      period: "Oct 2025 — Jun 2026",
      description: "Volunteered as a front-end developer for the VIT Pune Student Council, building digital infrastructure for flagship festivals. Progressed from learning team workflows to taking independent ownership of front-end features.",
      skills: ["Web Development", "JavaScript", "Git", "Cascading Style Sheets (CSS)", "HTML5", "GitHub", "Bootstrap (Framework)", "Project Management"],
      projects: [
        {
          id: "crescendo-fest",
          title: "CRESCENDO (2025-2026) - Inter College Fest",
          subtitle: "Upgraded workflows & skills to take on greater development responsibilities.",
          imageUrl: "assets/crescendo.png",
          liveUrl: "https://crsc.studentcouncilvitpune.in/",
          details: [
            "Independently engineered the interactive Timeline page, building a dynamic UI for attendees to track event schedules and deadlines.",
            "Collaborated closely with peers under strict deadlines to ensure a seamless launch for the inter-college festival."
          ]
        },
        {
          id: "vishwakarandak-fest",
          title: "Vishwakarandak (2025-2026)",
          subtitle: "Served as a fresher, adapting to real-world team environments and web development.",
          imageUrl: "assets/vishwakarandak.png",
          liveUrl: "https://www.studentcouncilvitpune.in/",
          details: [
            "Gained hands-on experience in version control with Git & GitHub, managing branches, resolving merge conflicts, and integrating team code.",
            "Assisted in developing and maintaining responsive front-end components for the high-traffic intra-college fest platform."
          ]
        }
      ]
    }
  ],

  // ── PAGE 5: EDUCATION ──
  education: [
    {
      degree: "B.Tech — Computer Science and Engineering (Data Science)",
      institution: "Vishwakarma Institute Of Technology",
      location: "Pune",
      period: "Sep 2025 — Sep 2029",
      note: "CGPA: 9.0"
    },
    {
      degree: "HSC (Higher Secondary Certificate)",
      institution: "KBP College",
      location: "Thane, Mumbai",
      period: "Jul 2022 — Jul 2024",
      note: "Grade: 79.00%"
    },
    {
      degree: "SSC (Secondary School Certificate)",
      institution: "Navodaya English High School & Junior College",
      location: "Thane, Mumbai",
      period: "Jun 2012 — Jun 2022",
      note: "Grade: 91.60%"
    }
  ],

  // ── PAGE 6: SKILLS ──
  skills: [
    {
      category: "Languages & Web",
      items: ["JavaScript", "Java", "C", "HTML5", "Cascading Style Sheets (CSS)", "Web Development"]
    },
    {
      category: "Frameworks & Tech",
      items: ["MERN Stack", "Bootstrap (Framework)", "jQuery"]
    },
    {
      category: "Tools & Environment",
      items: ["Git", "GitHub", "VS Code", "AntiGravity", "Google Stitch"]
    },
    {
      category: "Research & Management",
      items: ["Research and Development (R&D)", "Literature Reviews", "Social Media Marketing", "Project Management"]
    }
  ],

  // ── PAGE 7: PROJECTS — Actual (Team/College) ──
  actualProjects: [
    {
      id: "crescendo-actual",
      title: "CRESCENDO 2025-26 — Timeline Page",
      subtitle: "VIT Pune Student Council • Inter-College Fest",
      description: "Independently engineered the interactive Timeline page for the inter-college fest. Built a dynamic UI so attendees could track event schedules and deadlines in real time.",
      tags: ["HTML5", "CSS", "JavaScript", "Bootstrap", "Git"],
      links: [
        { label: "Live Site", url: "https://crsc.studentcouncilvitpune.in/" }
      ]
    },
    {
      id: "vishwakarandak-actual",
      title: "Vishwakarandak 2025-26",
      subtitle: "VIT Pune Student Council • Intra-College Fest",
      description: "Assisted in developing and maintaining responsive front-end components for the high-traffic intra-college fest platform. Gained hands-on Git & GitHub experience managing branches and resolving merge conflicts.",
      tags: ["HTML5", "CSS", "JavaScript", "Git", "GitHub"],
      links: [
        { label: "Live Site", url: "https://www.studentcouncilvitpune.in/" }
      ]
    }
  ],

  // ── PAGE 7: PROJECTS — Whiteboard (Vibe-Built Personal / Sandbox) ──
  whiteboardProjects: [
    {
      id: "beam-cast",
      title: "Beam Cast — Screen & Data Mirroring Bridge",
      subtitle: "Dual Ecosystem · Android Native Sender + Web Browser Receiver",
      description: "Zero-latency cross-platform screen casting, telemetry HUD, bidirectional clipboard synchronization, and high-speed binary file transfer connecting Android mobile devices with web browser displays.",
      tags: ["WebRTC", "Android Native", "MediaProjection", "WebSocket Signaling", "HTML5 Video / Canvas", "SCTP DataChannel", "JavaScript"],
      links: [
        { label: "View Showcase & Gallery", url: "#", action: "openModal", modalId: "beam-cast" }
      ],
      ecosystems: [
        {
          id: "mobile-sender",
          name: "Mobile App (Android Sender)",
          iconType: "mobile",
          tagline: "Native Hardware-Accelerated Capture & Transmission Engine",
          features: [
            {
              title: "Instant QR Pairing",
              desc: "Quick camera scanner to automatically detect server IP and join the casting session without manual typing."
            },
            {
              title: "Low-Latency Screen & Audio Casting",
              desc: "Native hardware-accelerated screen capture streamed directly over peer-to-peer WebRTC."
            },
            {
              title: "Bidirectional File & Clipboard Sync",
              desc: "Seamlessly shares device clipboard text and sends files in high-speed binary chunks."
            }
          ]
        },
        {
          id: "web-receiver",
          name: "Web App (Web Receiver)",
          iconType: "web",
          tagline: "Zero-Install Browser Receiver Hub & Stream Diagnostics",
          features: [
            {
              title: "Real-Time Display & Stream HUD",
              desc: "High-performance video player with live diagnostics for FPS, resolution, bitrate, and network latency."
            },
            {
              title: "Playback & Capture Controls",
              desc: "Features Fullscreen, Picture-in-Picture (PiP), custom aspect ratio fitting, and one-click HD snapshots."
            },
            {
              title: "Dynamic QR Room Generator & Auto-Downloader",
              desc: "Hosts dynamic room sessions and automatically reassembles and downloads incoming files."
            }
          ]
        }
      ],
      gallery: [
        {
          url: "assets/beamcast-demo.jpg",
          title: "Live Peer-to-Peer Mirroring",
          tabLabel: "Live Demo",
          tag: "Live Demo",
          desc: "Real-world hardware-accelerated screen mirroring from an Android phone directly onto a laptop display with near-zero latency."
        },
        {
          url: "assets/beamcast-app-control.jpg",
          title: "Mobile Stream Control & Telemetry",
          tabLabel: "Android HUD",
          tag: "Android Sender",
          desc: "Active casting dashboard featuring real-time stream status, FPS/Latency/Bitrate telemetry monitors, chunked RTC file sender, and clipboard sync."
        },
        {
          url: "assets/beamcast-app-scanner.jpg",
          title: "Instant Camera QR Scanner",
          tabLabel: "QR Scanner",
          tag: "Android Scanner",
          desc: "Built-in optical viewfinder for instant receiver room pairing, automatic host IP discovery, and manual fallback room entry."
        },
        {
          url: "assets/beamcast-web-receiver.png",
          title: "Web Receiver & Dynamic Hub",
          tabLabel: "Web Hub",
          tag: "Web App Hub",
          desc: "Dynamic QR code room host interface, real-time incoming clipboard stream, and automatic binary file reassembly panel."
        }
      ]
    }
  ],

  // ── COURSES & CERTIFICATIONS ──
  courses: [],

  // ── PAGE 8: BRAIN DUMP (Articles & Thoughts) ──
  blog: {
    subtext: "A collection of thoughts, technical walkthroughs, and personal notes.",
    posts: []
  }

};
