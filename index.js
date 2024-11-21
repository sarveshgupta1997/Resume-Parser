const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({
  dest: "upload/",
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const mimetypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = mimetypes.includes(file.mimetype);
    // console.log("Uploaded File:", file);
    // console.log("MIME Type:", file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not supported"));
  },
});


const predefinedRoles = [
  // Programming Languages
  "Software Developer", "Project Manager", ".NET Developer", ".Net Developer", "Software Engineer", "Full Stack Web Developer", "Full Stack Developer", "full-stack web developer", "Frontend Developer", "Backend Developer",
  "System Engineer", "Embedded Software Engineer", "Application Developer", "Game Developer", "Automation Engineer",
  "AI Developer", "ML Engineer", "Data Engineer", "Quantitative Developer", "Scripting Engineer", "Code Reviewer",
  "Lead Software Developer", "Senior Software Engineer", "Principal Engineer", "Java Spring Boot Developer",
  "Senior Java Developer", "Lead Java Developer", "Java Module Lead", "Team Lead",

  // Frontend Development
  "Frontend Developer", "UI Developer", "Web Developer", "React Developer", "Angular Developer",
  "Vue.js Developer", "Svelte Developer", "HTML/CSS Developer", "UI/UX Engineer", "Web Designer",
  "Mobile Frontend Developer", "Frontend Architect", "SPA Developer", "UI Framework Specialist",
  "Senior Frontend Developer", "Lead Frontend Developer", "Frontend Team Lead", "Frontend Module Lead",

  // Backend Development
  "Backend Developer", "Node.js Developer", "Django Developer", "Flask Developer", "Express.js Developer",
  "Ruby on Rails Developer", "Java Backend Developer", "PHP Developer", "API Developer", "Microservices Developer",
  "Middleware Developer", "Backend Architect", "Data Engineer", "Platform Engineer", "Backend Infrastructure Engineer",
  "Senior Backend Developer", "Lead Backend Developer", "Backend Team Lead", "Java Spring Boot Developer",
  "Microservices Module Lead", "Backend Module Lead",

  // Databases
  "Database Administrator", "Data Engineer", "SQL Developer", "Database Developer", "MongoDB Specialist",
  "Data Scientist", "ETL Developer", "Big Data Engineer", "Data Architect", "Database Migration Specialist",
  "Data Warehouse Engineer", "Database Security Engineer", "Data Ops Engineer", "Cloud Database Administrator",
  "Senior Database Engineer", "Lead Database Engineer", "Database Team Lead",

  // Cloud and DevOps
  "DevOps Engineer", "Cloud Engineer", "AWS Developer", "Azure Engineer", "Google Cloud Architect",
  "Site Reliability Engineer (SRE)", "Infrastructure Engineer", "Build and Release Engineer", "CI/CD Specialist",
  "Platform Engineer", "Cloud Architect", "Containerization Specialist", "Automation Engineer", "Cloud Migration Specialist",
  "Network Operations Engineer", "Kubernetes Administrator", "Infrastructure Architect", "Cloud Solutions Engineer",
  "Senior DevOps Engineer", "Lead DevOps Engineer", "DevOps Team Lead",

  // Tools and Version Control
  "Software Engineer", "Version Control Specialist", "Release Manager", "Build Engineer", "Automation Engineer",
  "Technical Support Engineer", "Systems Administrator", "Quality Assurance Engineer", "Software Configuration Manager",
  "Git Specialist", "Source Control Engineer", "CI/CD Pipeline Engineer", "DevOps Support Engineer",
  "Senior Build Engineer", "Lead QA Engineer", "Configuration Manager",

  // Network Engineering
  "Network Engineer", "Senior Associate (Network Engineer)", "TECHNICAL SPECIALIST", "System  Administrator", "Network Administrator", "Assistant Manager (L3)– Systems (DTIS).", "Assistant Manager (L3)",
  "Network Security Engineer", "Network Architect", "Systems Engineer", "Firewall Engineer",
  "Telecommunications Engineer", "Network Analyst", "Network Infrastructure Engineer", "VoIP Engineer",
  "Wireless Network Engineer", "Cloud Network Engineer", "Network Design Specialist",
  "Network Operations Center (NOC) Engineer", "Routing Specialist", "LAN/WAN Engineer", "Load Balancer Specialist",
  "Lead Network Engineer", "Senior Network Engineer", "LINUX ADMINISTRATOR",

  // Security Specialist
  "Cybersecurity Engineer", "Security Specialist", "SOC Analyst", "Penetration Tester", "Vulnerability Analyst",
  "IAM Specialist", "Threat Analyst", "Forensics Analyst", "Incident Response Engineer", "Application Security Engineer",
  "Data Security Analyst", "SOC Manager", "Security Consultant", "Red Team Specialist", "Endpoint Security Engineer",
  "Compliance Analyst", "Security Policy Analyst", "IT Risk Specialist", "Malware Analyst", "Cryptography Engineer",
  "Lead Cybersecurity Engineer", "Senior Security Engineer", "Security Team Lead",

  // Solution Architect
  "Solution Architect", "Cloud Architect", "Enterprise Architect", "Technical Architect", "Software Architect",
  "Infrastructure Architect", "Application Architect", "Business Solutions Architect", "Data Architect",
  "Platform Architect", "System Design Engineer", "Scalability Engineer", "Digital Transformation Specialist",
  "Integration Architect", "Cloud Solutions Architect", "IT Infrastructure Architect",
  "Lead Architect", "Principal Architect", "Chief Architect",

  // Other Relevant Technologies
  "API Developer", "Integration Engineer", "Middleware Developer", "WebSocket Developer", "GraphQL Developer",
  "OAuth Engineer", "Microservices Engineer", "Event-Driven Developer", "System Monitoring Engineer",
  "DevOps Monitoring Specialist", "Telemetry Engineer", "Data Integration Specialist", "IoT Developer",
  "Data Visualization Engineer", "Network Automation Engineer", "Messaging Specialist", "Service Mesh Specialist",
  "Kafka Developer", "RabbitMQ Engineer", "Real-Time Data Engineer", "Alerting and Monitoring Engineer",
  "Distributed Systems Engineer", "Resilience Engineer", "Business Intelligence Developer",
  "Senior API Developer", "Lead Data Engineer", "Platform Lead",

  // Specialized and Emerging Roles
  "Blockchain Developer", "Quantum Computing Engineer", "Edge Computing Specialist", "Virtualization Engineer",
  "AI Infrastructure Engineer", "Digital Twins Developer", "Augmented Reality Developer", "Robotic Process Automation (RPA) Developer",
  "Synthetic Data Engineer", "5G Network Engineer", "Machine Vision Engineer", "Deep Learning Engineer",
  "Bioinformatics Developer", "Medical Imaging Specialist", "Quantum Cryptographer", "Smart Contract Developer",
  "Senior AI Engineer", "Technical Lead", "TechnicalLead", "Senior Technical Lead", "Engineering Manager", "Lead Engineer",
  "Principal Software Engineer", "Technical Project Lead", "Development Manager", "Delivery Module Lead"
];

// //Function for extracting name ---------
// function extractNameFromResume(text) {
//   const nameFromKeyword = extractNameUsingKeywords(text);

//   if (nameFromKeyword !== "Not found") {
//     return nameFromKeyword;
//   }

//   const nameFromTopLines = extractNameFromTopLines(text);

//   if (nameFromTopLines) {
//     return nameFromTopLines;
//   }

//   return "Not found";
// }

// // function extractNameUsingKeywords(text) {
// //   const nameKeywords = [
// //     "Name",
// //     "Candidate Name",
// //     "Applicant Name",
// //     "Full Name",
// //   ];

// //   const prevWords = [
// //     "project", "college", "father", "father's", "fathers", "mother", "mother's", "spouse",
// //     "spouse's", "husband", "husband's", "wife", "wife's", "school", "university",
// //     "company", "company's", "organization", "organization's", "institute",
// //     "institute's", "employer", "employer's", "department", "department's",
// //     "branch", "branch's", "division", "division's", "team", "team's", "supervisor",
// //     "supervisor's", "manager", "manager's", "head", "head's", "coordinator",
// //     "coordinator's", "contact", "contact's", "relation", "relation's", "reference",
// //     "reference's", "next of kin", "guardian", "guardian's", "emergency contact",
// //     "emergency contact's", "advisor", "advisor's", "tutor", "tutor's", "mentor",
// //     "mentor's", "teacher", "teacher's", "guide", "guide's", "counselor", "counselor's"
// //   ];

// //   const lines = text.split("\n");

// //   for (let line of lines) {
// //     // Convert the line to lowercase for case-insensitive matching
// //     const lowerLine = line.toLowerCase();

// //     for (let keyword of nameKeywords) {
// //       // Check if the line contains the keyword and does not contain any of the prevWords
// //       if (line.includes(keyword) && !prevWords.some(prev => lowerLine.includes(prev))) {
// //         const parts = line.split(":");
// //         if (parts.length > 1) {
// //           const name = parts[1].trim();
// //           return validateName(name) ? name : "Not found";
// //         }
// //       }
// //     }
// //   }

// //   return "Not found";
// // }
// function extractNameUsingKeywords(text) {
//   const nameKeywords = [
//     "Name",
//     "Candidate Name",
//     "Applicant Name",
//     "Full Name",
//   ];

//   const prevWords = [
//     "project", "college", "father", "father's", "fathers", "mother", "mother's", "spouse",
//     "spouse's", "husband", "husband's", "wife", "wife's", "school", "university",
//     "company", "company's", "organization", "organization's", "institute",
//     "institute's", "employer", "employer's", "department", "department's",
//     "branch", "branch's", "division", "division's", "team", "team's", "supervisor",
//     "supervisor's", "manager", "manager's", "head", "head's", "coordinator",
//     "coordinator's", "contact", "contact's", "relation", "relation's", "reference",
//     "reference's", "next of kin", "guardian", "guardian's", "emergency contact",
//     "emergency contact's", "advisor", "advisor's", "tutor", "tutor's", "mentor",
//     "mentor's", "teacher", "teacher's", "guide", "guide's", "counselor", "counselor's"
//   ];

//   const lines = text.split("\n");
//   let previousWordsBuffer = []; // Buffer to store the last few words

//   for (let line of lines) {
//     // Convert the line to lowercase for case-insensitive matching
//     const lowerLine = line.toLowerCase();

//     // Add the last 5 words of the current line to the buffer
//     const currentWords = lowerLine.trim().split(/\s+/).slice(-5); // Extract last 5 words
//     previousWordsBuffer.push(...currentWords);

//     // Limit the buffer size to 5 words
//     if (previousWordsBuffer.length > 5) {
//       previousWordsBuffer = previousWordsBuffer.slice(-5); // Keep only the last 5 words
//     }

//     for (let keyword of nameKeywords) {
//       // Check if the line contains the keyword and does not match with any `prevWords` in the buffer
//       if (
//         line.includes(keyword) &&
//         !previousWordsBuffer.some((prev) => lowerLine.includes(prev))
//       ) {
//         const parts = line.split(":");
//         if (parts.length > 1) {
//           const name = parts[1].trim();
//           return validateName(name) ? name : "Not found";
//         }
//       }
//     }
//   }

//   return "Not found";
// }

// // function extractNameFromTopLines(text) {
// //   // List of keywords to skip when looking for names at the top
// //   const skipsKeywords = [
// //     "Resume", "Biodata", "CURRICULUM VITAE", "CV", "Profile", "Introduction",
// //     "Summary", "Professional Summary", "Objective", "Cover Letter", "Personal Information",
// //     "Candidate Profile", "Details", "Applicant Profile", "Application", "Applicant",
// //     "Contact Information", "Contact Details", "Personal Details", "Name", "Title",
// //     "Experience", "Skills", "Technical Skills", "Education", "Projects", "Certifications",
// //     "Training", "Achievements", "Professional Background",

// //     // Common roles in tech and other domains
// //     "Developer", "Engineer", "Manager", "Consultant", "Analyst", "Administrator",
// //     "Specialist", "Coordinator", "Operator", "Support", "Executive", "HR", "Sales",
// //     "Marketing", "Finance", "Accounts", "Operations", "Testing", "Tester", "QA",
// //     "Quality Assurance", "Product Owner", "Product Manager", "Scrum Master", "Team Lead",

// //     // Specific tech roles and technologies
// //     "Java Developer", "Java Spring Boot Developer", "JavaScript Developer",
// //     "Frontend Developer", "Backend Developer", "Full Stack Developer", "Node.js Developer",
// //     "Python Developer", "Dotnet Developer", ".NET Developer", "Angular Developer",
// //     "React Developer", "Vue Developer", "PHP Developer", "SQL Developer", "Data Scientist",
// //     "Machine Learning Engineer", "AI Engineer", "Cloud Engineer", "DevOps Engineer",
// //     "Systems Administrator", "IT Support", "Software Engineer", "Software Developer",
// //     "Web Developer", "Mobile Developer", "iOS Developer", "Android Developer",
// //     "Technical Support", "Helpdesk", "Customer Support", "Customer Service",

// //     // Additional qualifiers
// //     "Immediate Joiner", "Looking for Opportunities", "Open to Work", "Available Immediately",
// //     "Notice Period", "Freelancer", "Intern", "Contractor", "Consultant",
// //     "Temporary", "Full-time", "Part-time", "Remote Worker", "Onsite", "Hybrid"
// //   ];


// //   const lines = text.split("\n");

// //   for (let i = 0; i < Math.min(5, lines.length); i++) {
// //     // Skip lines containing any of the skip keywords
// //     if (skipsKeywords.some(keyword => lines[i].toUpperCase().includes(keyword.toUpperCase()))) {
// //       continue;
// //     }

// //     // console.log( "lines: ",lines);
// //     const words = lines[i].trim().split(/\s+/);

// //     // Filter capitalized words
// //     const capitalizedWords = words.filter((word) =>
// //       /^[A-Z][a-zA-Z]+$/.test(word) || /^[A-Z]+$/.test(word)
// //       // /^[A-Z][a-zA-Z]+$/.test(word)
// //     );
// //     // console.log("capitalizedWords: ",capitalizedWords, "Words: ",words)
// //     if (
// //       capitalizedWords.length === 2 ||
// //       capitalizedWords.length === 3 ||
// //       capitalizedWords.length === 4
// //     ) {
// //       const potentialName = capitalizedWords.join(" ");

// //       if (validateName(potentialName)) {
// //         return potentialName;
// //       }
// //     }
// //   }

// //   return null;
// // }

// // // best till now
// function extractNameFromTopLines(text) {
//   // List of keywords to skip when looking for names at the top
//   const skipsKeywords = [
//     "Resume", "Biodata", "CURRICULUM VITAE", "CV", "Profile", "Introduction",
//     "Summary", "Professional Summary", "Objective", "Cover Letter", "Personal Information",
//     "Candidate Profile", "Details", "Applicant Profile", "Application", "Applicant",
//     "Contact Information", "Contact Details", "Personal Details", "Name", "Title",
//     "Experience", "Skills", "Technical Skills", "Education", "Projects", "Certifications",
//     "Training", "Achievements", "Professional Background",

//     // Common roles in tech and other domains
//     "Developer", "Engineer", "Manager", "Consultant", "Analyst", "Administrator",
//     "Specialist", "Coordinator", "Operator", "Support", "Executive", "HR", "Sales",
//     "Marketing", "Finance", "Accounts", "Operations", "Testing", "Tester", "QA",
//     "Quality Assurance", "Product Owner", "Product Manager", "Scrum Master", "Team Lead",

//     // Specific tech roles and technologies
//     "Java Developer", "Java Spring Boot Developer", "JavaScript Developer",
//     "Frontend Developer", "Backend Developer", "Full Stack Developer", "Node.js Developer",
//     "Python Developer", "Dotnet Developer", ".NET Developer", "Angular Developer",
//     "React Developer", "Vue Developer", "PHP Developer", "SQL Developer", "Data Scientist",
//     "Machine Learning Engineer", "AI Engineer", "Cloud Engineer", "DevOps Engineer",
//     "Systems Administrator", "IT Support", "Software Engineer", "Software Developer",
//     "Web Developer", "Mobile Developer", "iOS Developer", "Android Developer",
//     "Technical Support", "Helpdesk", "Customer Support", "Customer Service",

//     // Additional qualifiers
//     "Immediate Joiner", "Looking for Opportunities", "Open to Work", "Available Immediately",
//     "Notice Period", "Freelancer", "Intern", "Contractor", "Consultant",
//     "Temporary", "Full-time", "Part-time", "Remote Worker", "Onsite", "Hybrid"
//   ];


//   const lines = text.split("\n");

//   for (let i = 0; i < Math.min(5, lines.length); i++) {
//     const line = lines[i].trim();
//     if (line.length === 0) continue; // Skip empty lines

//     // Skip lines containing any of the skip keywords
//     if (skipsKeywords.some(keyword => line.toUpperCase().includes(keyword.toUpperCase()))) {
//       continue;
//     }

//     // Split the line into words
//     const words = line.split(/\s+/);

//     // Check if the line contains 2 to 4 words where the first word starts with a capital letter
//     if (
//       words.length >= 2 &&
//       words.length <= 4 &&
//       /^[A-Z][a-z]+$/.test(words[0]) // First word starts with an uppercase letter
//     ) {
//       const potentialName = words.join(" ");

//       if (validateName(potentialName)) {
//         return potentialName;
//       }
//     }
//   }

//   return null;
// }


// function validateName(name) {
//   // Common terms that should not be considered as names
//   const invalidNameTerms = [
//     "Soft Skills",
//     "Technical Skills",
//     "Education",
//     "Work Experience",
//     "Projects",
//     "Tools",
//     "Languages",
//     "Achievements",
//     "Developer Tools",
//     "Gender",
//   ];

//   // Check if the extracted name matches any invalid terms
//   return !invalidNameTerms.some((term) => name.includes(term));
// }

// Function for extracting name
function extractNameFromResume(text) {
  const nameFromKeyword = extractNameUsingKeywords(text);

  if (nameFromKeyword !== "Not found") {
    return nameFromKeyword;
  }

  const nameFromTopLines = extractNameFromTopLines(text);

  if (nameFromTopLines) {
    return nameFromTopLines;
  }

  return "Not found";
}

function extractNameUsingKeywords(text) {
  const nameKeywords = [
    "Name",
    "Candidate Name",
    "Applicant Name",
    "Full Name",
  ];

  const prevWords = [
    "project", "college", "father", "father's", "fathers", "mother", "mother's", "spouse",
    "spouse's", "husband", "husband's", "wife", "wife's", "school", "university",
    "company", "company's", "organization", "organization's", "institute",
    "institute's", "employer", "employer's", "department", "department's",
    "branch", "branch's", "division", "division's", "team", "team's", "supervisor",
    "supervisor's", "manager", "manager's", "head", "head's", "coordinator",
    "coordinator's", "contact", "contact's", "relation", "relation's", "reference",
    "reference's", "next of kin", "guardian", "guardian's", "emergency contact",
    "emergency contact's", "advisor", "advisor's", "tutor", "tutor's", "mentor",
    "mentor's", "teacher", "teacher's", "guide", "guide's", "counselor", "counselor's"
  ];

  const lines = text.split("\n");
  let previousWordsBuffer = []; // Buffer to store the last few words

  for (let line of lines) {
    const trimmedLine = line.trim();

    // Add the last 5 words of the current line to the buffer
    const currentWords = trimmedLine.split(/\s+/).slice(-5); // Extract last 5 words
    previousWordsBuffer.push(...currentWords);

    // Limit the buffer size to 5 words
    if (previousWordsBuffer.length > 5) {
      previousWordsBuffer = previousWordsBuffer.slice(-5); // Keep only the last 5 words
    }

    for (let keyword of nameKeywords) {
      // Check if the line contains the keyword and does not match with any `prevWords` in the buffer
      if (
        line.includes(keyword) &&
        !previousWordsBuffer.some((prev) => line.includes(prev))
      ) {
        const parts = line.split(":");
        if (parts.length > 1) {
          const name = parts[1].trim();
          return validateName(name) ? name : "Not found";
        }
      }
    }
  }

  return "Not found";
}

function extractNameFromTopLines(text) {
  // List of keywords to skip when looking for names at the top
   const skipsKeywords = [
    "Resume", "Biodata", "CURRICULUM VITAE", "CV", "Profile", "Introduction",
    "Summary", "Professional Summary", "Objective", "Cover Letter", "Personal Information",
    "Candidate Profile", "Details", "Applicant Profile", "Application", "Applicant",
    "Contact Information", "Contact Details", "Personal Details", "Name", "Title",
    "Experience", "Skills", "Technical Skills", "Education", "Projects", "Certifications",
    "Training", "Achievements", "Professional Background",

    // Common roles in tech and other domains
    "Developer", "Engineer", "Manager", "Consultant", "Analyst", "Administrator",
    "Specialist", "Coordinator", "Operator", "Support", "Executive", "Sales",
    "Marketing", "Finance", "Accounts", "Operations", "Testing", "Tester", "QA",
    "Quality Assurance", "Product Owner", "Product Manager", "Scrum Master", "Team Lead",

    // Specific tech roles and technologies
    "Java Developer", "Java Spring Boot Developer", "JavaScript Developer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Node.js Developer",
    "Python Developer", "Dotnet Developer", ".NET Developer", "Angular Developer",
    "React Developer", "Vue Developer", "PHP Developer", "SQL Developer", "Data Scientist",
    "Machine Learning Engineer", "AI Engineer", "Cloud Engineer", "DevOps Engineer",
    "Systems Administrator", "IT Support", "Software Engineer", "Software Developer",
    "Web Developer", "Mobile Developer", "iOS Developer", "Android Developer",
    "Technical Support", "Helpdesk", "Customer Support", "Customer Service",

    // Additional qualifiers
    "Immediate Joiner", "Looking for Opportunities", "Open to Work", "Available Immediately",
    "Notice Period", "Freelancer", "Intern", "Contractor", "Consultant",
    "Temporary", "Full-time", "Part-time", "Remote Worker", "Onsite", "Hybrid"
  ];

  const lines = text.split("\n");

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue; // Skip empty lines

    // Skip lines containing any of the skip keywords
    if (skipsKeywords.some(keyword => line.includes(keyword))) {
      continue;
    }

    // Split the line into words
    const words = line.split(/\s+/);

    // Check if the line contains 2 to 4 words
    if (words.length >= 2 && words.length <= 4) {
      const potentialName = words.join(" ");

      if (validateName(potentialName)) {
        return potentialName;
      }
    }
  }

  return null;
}

function validateName(name) {
  // Common terms that should not be considered as names
  const invalidNameTerms = [
    "Soft Skills",
    "Technical Skills",
    "Education",
    "Work Experience",
    "Projects",
    "Tools",
    "Languages",
    "Achievements",
    "Developer Tools",
    "Gender",
  ];

  // Check if the extracted name matches any invalid terms
  return !invalidNameTerms.some((term) => name.includes(term));
}




// // Function for extracting Date of Birth (DOB)
// function extractDOB(text) {
//   const dobRegex = /(?:D\.?O\.?B\.?\s*[-–—]?\s*)(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;

//   const dobMatch = text.match(dobRegex);
//   return dobMatch ? dobMatch[1].trim() : "Not found";
// }

// function extractDOB(text) {
//   // Define date of birth keywords (case insensitive)
//   const dobKeywords = ["dob", "d o b", "d.o.b", "d.o.b.", "DOB", "D O B", "D.O.B", "D.O.B.", "Date of Birth"];

//   // Create a regex pattern to handle dates in both numeric (dd/mm/yyyy or dd-mm-yyyy) 
//   // and textual month formats (dd Month yyyy or ddth Month yyyy)
//   const dobPattern = new RegExp(
//       `(?:${dobKeywords.join("|")})[:\\s-]*` + // Match any DOB keyword followed by optional characters
//       `(\\d{1,2})(?:st|nd|rd|th)?[\\/\\-\\s]?` + // Match day with optional ordinal suffix (1st, 2nd, 3rd, 4th)
//       `([a-zA-Z]+|\\d{1,2})[\\/\\-\\s]?` +       // Match month (numeric or abbreviated textual month)
//       `(\\d{4})`,                                // Match year (4 digits)
//       "i"
//   );

//   // Define month names mapping
//   const monthMapping = {
//       "jan": "01", "feb": "02", "mar": "03", "apr": "04",
//       "may": "05", "jun": "06", "jul": "07", "aug": "08",
//       "sep": "09", "oct": "10", "nov": "11", "dec": "12",
//       "january": "01", "february": "02", "march": "03", "april": "04",
//       "june": "06", "july": "07", "august": "08", "september": "09",
//       "october": "10", "november": "11", "december": "12"
//   };

//   // Search for the date pattern in the input text
//   const match = text.match(dobPattern);

//   if (match) {
//       // Extract day, month, and year from the matched pattern
//       let day = match[1].padStart(2, "0");
//       let month = match[2];
//       let year = match[3];

//       // Convert textual month to numeric if necessary
//       month = isNaN(month) ? monthMapping[month.toLowerCase().slice(0, 3)] : month.padStart(2, "0");

//       return `${day}/${month}/${year}`;
//   }

//   return "Not found";
// }
function extractDOB(text) {
  // Define date of birth keywords (case insensitive)
  const dobKeywords = [
    "dob", "d o b", "d.o.b", "d.o.b.",
    "DOB", "D O B", "D.O.B", "D.O.B.",
    "Date of Birth", "DATE OF BIRTH", "date of birth"
  ];

  // Create a keyword regex pattern
  const keywordPattern = dobKeywords.join("|");

  // Define month names mapping (both full and abbreviated)
  const monthMapping = {
    "january": "01", "february": "02", "march": "03", "april": "04",
    "may": "05", "june": "06", "july": "07", "august": "08",
    "september": "09", "october": "10", "november": "11", "december": "12",
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "jun": "06", "jul": "07", "aug": "08", "sep": "09",
    "oct": "10", "nov": "11", "dec": "12"
  };

  // Define regex patterns for different date formats
  const patterns = [
    // Pattern 1: Day Month Year (e.g., 19 Jan 1988, 04.08.1993, 8-2-2023)
    new RegExp(
      `(?:${keywordPattern})[:\\s-]*` +                      // DOB keyword
      `(\\d{1,2})(?:\\s?)(?:st|nd|rd|th)?[\\.\\/\\-\\s,]*` + // Day with optional ordinal and whitespace
      `([a-zA-Z]+|\\d{1,2})[\\.\\/\\-\\s,]*` +               // Month (text or number)
      `(\\d{4})`,                                            // Year
      "i"
    ),
    // Pattern 2: Month Day Year (e.g., October 20, 1995, June 12th, 1993)
    new RegExp(
      `(?:${keywordPattern})[:\\s-]*` +                      // DOB keyword
      `([a-zA-Z]+)[\\.\\/\\-\\s,]*` +                       // Month (text)
      `(\\d{1,2})(?:\\s?)(?:st|nd|rd|th)?[\\.\\/\\-\\s,]*` + // Day with optional ordinal and whitespace
      `(\\d{4})`,                                            // Year
      "i"
    )
  ];

  // Iterate over each pattern to find a match
  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let day, month, year;

      if (pattern === patterns[0]) {
        // Pattern 1 matched: Day Month Year
        day = match[1].padStart(2, '0');
        month = match[2];
        year = match[3];
      } else {
        // Pattern 2 matched: Month Day Year
        month = match[1];
        day = match[2].padStart(2, '0');
        year = match[3];
      }

      // Convert month to numeric if it's in text format
      if (isNaN(month)) {
        month = monthMapping[month.toLowerCase()];
        if (!month) {
          // If month is not recognized, return null
          return null;
        }
      } else {
        month = month.padStart(2, '0');
      }

      return `${day}/${month}/${year}`;
    }
  }
  return "Not found";
}

//Function for extracting Email -------
function extractEmailFromResume(text) {
  // console.log(text)
  const emailKeywords = ["E-mail-", "E-mail:", "Email-", "Email:", "Email", "email", "E-mail", "Mail", "mail"];
  const emailRegex = new RegExp(
    `(?:[\\u2709\\uE001]?\\s*(?:${emailKeywords.join(
      "|"
    )})?\\s*[:]?\\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}))`,
    "i"
  );
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1]?.trim() : "Not found";

  return email;
}

//Function for extracting Gender -------
function extractGenderFromResume(text) {
  // console.log(text)
  const genderKeywords = [
    "gender", "Gender", "sex", "Sex", "SEX",
    "gndr", "Gndr", "GENDER",
    "Sex/Gender", "Gender/Sex",
    "gender:", "sex:", "sex -", "gender -",
    "gender identity", "Gender Identity"
  ];
  const lines = text.split('\n'); // Split the text into lines for easier processing

  for (const line of lines) {
    for (const keyword of genderKeywords) {
      const regex = new RegExp(`${keyword}\\s*[:\\-\\s.]*\\s*(male|female|other|Male|Female|Other)`, 'i'); // Regex to match gender after the keyword

      const match = line.match(regex);
      if (match) {
        return match[1]; // Return the matched gender
      }
    }
  }

  return "Not found";
}


// //Function for Phone No. Extraction------
// function extractPhoneFromResume(text) {
//   const phoneKeywords = [
//     "Phone",
//     "Contact No",
//     "Mobile",
//     "Phone Number",
//     "Tel",
//   ];
//   const phoneRegex = new RegExp(
//     `(?:[\\u260E\\u2706\\u1F4DE]?\\s*(?:${phoneKeywords.join(
//       "|"
//     )})?\\s*[:]?\\s*(\\d{10}))`,
//     "i"
//   );
//   const phoneMatch = text.match(phoneRegex);
//   const phone = phoneMatch ? phoneMatch[1]?.trim() : "Not found";

//   return phone;
// }

function extractPhoneFromResume(text) {
  const phoneKeywords = [
    "Phone",
    "Contact No",
    "Mobile",
    "Phone Number",
    "Tel",
  ];

  // Regular expression to match phone numbers with optional country code prefixes
  const phoneRegex = new RegExp(
    `(?:[\\u260E\\u2706\\u1F4DE]?\\s*(?:${phoneKeywords.join(
      "|"
    )})?\\s*[:]?\\s*([+]?91|0)?(\\d{10,14}))`,
    "i"
  );

  const phoneMatch = text.match(phoneRegex);

  let phone = phoneMatch ? phoneMatch[2]?.trim() : "Not found";

  // If phone is more than 10 digits, take the last 10 digits as the primary number
  if (phone && phone.length > 10) {
    phone = phone.slice(-10);
  }

  return phone;
}


// Function for extracting Marital Status
function extractMaritalStatus(text) {
  const maritalStatusKeywords = ["Marital Status", "Marital"];
  const statusRegex = new RegExp(
    `(?:${maritalStatusKeywords.join("|")})\\s*[-–—:]?\\s*(Single|Married|Divorced|Widowed|Unmarried)`,
    "i"
  );
  const statusMatch = text.match(statusRegex);
  return statusMatch ? statusMatch[1].trim() : "Not found";
}
// Function for extracting Education details
function extractEducation(text) {
  const keywords = ["Education", "Academic Background", "Degrees", "Qualifications"];
  const ignorableWords = ["Experience", "Work Experience", "Skills", "Projects", "PROFESSIONAL SUMMARY", "Certification", "Certifications"];

  // Create regex patterns from keywords and ignorable words
  const keywordsPattern = keywords.join("|");
  const ignorableWordsPattern = ignorableWords.join("|");

  // Regex to extract the Education section (exclude the keyword from the output)
  const educationRegex = new RegExp(
    `(?:${keywordsPattern})[\\s\\S]*?(?=\\n(?:${ignorableWordsPattern}|$))`,
    "i"
  );

  const match = text.match(educationRegex);

  if (match) {
    let educationDetails = match[0].trim(); // Extract the full match
    // Remove the keyword explicitly
    educationDetails = educationDetails.replace(new RegExp(`^(${keywordsPattern})`, "i"), "").trim();
    educationDetails = educationDetails.replace(/\s{2,}/g, " "); // Normalize excessive whitespace
    educationDetails = educationDetails.replace(/;+/g, ";"); // Normalize semicolons
    return educationDetails;
  }

  return "No detailed education information found";
}

//Function for Technical Skills Extraction ------------
// function extractTechnicalSkills(text) {
//   const sections = {
//     collective: ["Technical Skills", "Skills", "Core Skills", "Relevant Skills"],
//     languages: ["Programming Languages", "Languages"],
//     frameworks: ["Technologies", "Frameworks", "Libraries"],
//     tools: ["Tools", "Developer Tools"],
//   };

//   const skills = { collective: [], languages: [], frameworks: [], tools: [] };
//   const predefinedLanguages = ["C++", "Java", "JavaScript", "Python", "HTML", "CSS", "C"];
//   const predefinedFrameworks = ["React", "Angular", "Node.js", "Django", "Flask"];
//   const predefinedTools = ["Git", "VS Code", "Postman"];

//   function extractSectionSkills(sectionKeywords, defaultSkills) {
//     for (const keyword of sectionKeywords) {
//       const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*([\\w\\s,]+)`, "i");
//       const match = text.match(regex);
//       if (match) {
//         return match[1].split(/,\s*/).filter(skill => defaultSkills.includes(skill));
//       }
//     }
//     return defaultSkills.filter(skill => text.includes(skill));
//   }

//   // Extract skills from each section
//   skills.collective = extractSectionSkills(sections.collective, [...predefinedLanguages, ...predefinedFrameworks, ...predefinedTools]);
//   skills.languages = extractSectionSkills(sections.languages, predefinedLanguages);
//   skills.frameworks = extractSectionSkills(sections.frameworks, predefinedFrameworks);
//   skills.tools = extractSectionSkills(sections.tools, predefinedTools);

//   // Combine all skills into one array and remove duplicates
//   skills.allSkills = Array.from(new Set([
//     ...skills.collective,
//     ...skills.languages,
//     ...skills.frameworks,
//     ...skills.tools,
//   ]));

//   return skills;
// }

// function extractTechnicalSkills(text) {
//   if (!text || typeof text !== "string") {
//     throw new Error("Invalid input: text must be a non-empty string");
//   }

//   const keywords = [
//     "Technical Skills",
//     "Skills",
//     "Core Skills",
//     "Relevant Skills",
//     "Tech Stack",
//   ];

//   const predefinedSkills = [
//     // Programming Languages
//     "C++", "Java", "JavaScript", "Python", "HTML", "HTML5", "CSS", "C",
//     "TypeScript", "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala",
//     "VB.NET", "C#", "F#", "Perl", "R", "Matlab", "Data Structures And Algorithms",
//     // Frontend Development
//     "React JS", "React", "Angular", "Vue.js", "Svelte", "jQuery", "jQuery", "Bootstrap",
//     "TailwindCSS", "Material-UI", "Ant Design", "Sass", "Less",

//     // Backend Development
//     "Node.js", "Django", "Flask", "Express.js", "Ruby on Rails",
//     "Spring", "Spring Boot", "Spring MVC", "Hibernate", "Laravel",
//     "CodeIgniter", "Symfony", "ASP.NET Core", "Koa.js", "FastAPI",

//     // Databases
//     "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Firebase", "SQLite", "SQL",
//     "Redis", "Cassandra", "Elasticsearch", "MariaDB", "DynamoDB", "CockroachDB",

//     // Cloud and DevOps
//     "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
//     "Jenkins", "Ansible", "Puppet", "Chef", "CloudFormation", "Heroku",
//     "Netlify", "Vercel", "CircleCI", "GitHub Actions",

//     // Tools and Version Control
//     "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Eclipse",
//     "IntelliJ IDEA", "PyCharm", "Xcode", "NetBeans", "Postman", "Fiddler",
//     "Wireshark", "JIRA", "Confluence", "Maven", "Gradle", "NPM", "Yarn",

//     // Network Engineering
//     "Cisco", "Juniper", "BGP", "OSPF", "IPSec", "VPN", "Firewall", "Load Balancer",
//     "Network Security", "F5 BIG-IP", "NGINX", "HAProxy", "TCP/IP", "Ethernet", "DNS",
//     "DHCP", "LAN", "WAN", "SD-WAN", "Packet Tracing", "Subnetting", "SNMP", "VLAN", "VTP", "HSRP", "VRRP", "STP",
//     "MPLS", "MPLS L2 VPN", "MPLS L3 VPN", "Routing", "Switching", "Configuration", "Protocols",
//     "BGP", "OSPF", "EIGRP", "Access lists", "Extended IP access lists", "Standard IP access lists", "BGP Configuration", " VPN Configuration", "OSPF Configuration",
//     "STP Configuration", "NAT Configuration", "Troubleshooting",

//     // Security Specialist
//     "SSL/TLS", "WAF", "DDoS Mitigation", "SOC Operations", "SIEM",
//     "F5 BIG-IP LTM", "F5 ASM", "F5 APM", "Zero Trust", "IAM", "Penetration Testing",
//     "Vulnerability Assessment", "IDS/IPS", "Threat Hunting", "Endpoint Security",
//     "OWASP", "SANS", "CyberArk", "Fortinet", "Palo Alto Networks", "Splunk",

//     // Solution Architect
//     "Microservices", "Event-Driven Architecture", "Monolithic Architecture",
//     "SOA", "API Gateway", "Load Balancing", "High Availability", "Disaster Recovery",
//     "Scalability", "Elasticity", "CI/CD Pipelines", "Serverless",
//     "Cost Optimization", "Cloud Migration", "System Design", "Business Continuity",

//     // Other Relevant Technologies
//     "GraphQL", "REST APIs", "WebSockets", "OAuth", "JWT", "AJAX",
//     "WebRTC", "OpenShift", "Kong API Gateway", "Istio", "Apache Kafka",
//     "RabbitMQ", "ActiveMQ", "Elastic Stack", "Prometheus", "Grafana",
//     "Logstash", "Kibana", "New Relic", "Datadog", "PagerDuty"
//   ];

//   const predefinedSkillsLower = predefinedSkills.map(skill => skill.toLowerCase());

//   const keywordRegex = new RegExp(
//     `(${keywords.join("|")})\\s*[:\\-]?\\s*([\\w\\W]+?)(?=\\n\\n|$)`,
//     "gi"
//   );

//   const matches = [];
//   let match;

//   while ((match = keywordRegex.exec(text)) !== null) {
//     matches.push({
//       keyword: match[1],
//       content: match[2],
//     });
//   }

//   if (!matches || matches.length === 0) {
//     // console.log("No matches found in the text.");
//     return { foundKeywords: [], extractedSkills: [] };
//   }

//   const foundKeywords = matches.map(match => match.keyword);
//   // console.log("Found Keywords:", foundKeywords);

//   const extractedSkills = matches
//     .flatMap(match => {
//       if (match && match.content) {
//         return match.content.split(/[\n,]/); // Split skills by newline or comma
//       }
//       console.warn("Skipping invalid match:", match);
//       return [];
//     })
//     .map(skill => skill.trim().toLowerCase())
//     .filter(skill => predefinedSkillsLower.includes(skill));

//   // Ensure unique skills (deduplicate the list)
//   const uniqueSkills = Array.from(new Set(extractedSkills)).map(skill =>
//     predefinedSkills.find(predefined => predefined.toLowerCase() === skill)
//   );

//   // console.log("Extracted Skills:", uniqueSkills);

//   return { foundKeywords, extractedSkills: uniqueSkills };
// }

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escapes special regex characters
}

function extractTechnicalSkills(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  const keywords = [
    "Technical Skills",
    "Skills",
    "Network Skills",
    "Core Skills",
    "Relevant Skills",
    "Tech Stack",
    "Technical Profile",
    "Software Skills (Technical and project management )",
  ];

  const predefinedSkills = [
    // Programming Languages
    "C++", "Java", "JavaScript", "Python", "HTML", "HTML 5", "CSS", "C","J2SE","J2EE",
    "TypeScript", "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala",
    "VB.NET", "C#", "F#", "Perl",  "Matlab", "Data Structures And Algorithms","Shell Scripting",
    // Frontend Development
    "React JS", "React","React.js", "AngularJs", "Vue.js", "Svelte", "jQuery", "Bootstrap","J-Query",
    "TailwindCSS", "Material-UI", "Ant Design", "Sass", "Less","Ajax",
    // Backend Development
    "Node.js", "Django", "Flask", "Express.js", "Ruby on Rails", "Spring", "DHCP","DNS Servers",
    "Spring Boot", "Spring MVC", "Hibernate", "Laravel", "CodeIgniter", "ASP.mvc",
    "Symfony","Asp.net", "ASP.NET Core", "Koa.js", "FastAPI","VB.net","C#.net",
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Firebase", "SQLite", "SQL","My-Sql",
    "Redis", "Cassandra", "Elasticsearch", "MariaDB", "DynamoDB", "CockroachDB","Postgray",
    // Cloud and DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "Jenkins", "Ansible", "Puppet", "Chef", "CloudFormation", "Heroku", 
    "Netlify", "Vercel", "CircleCI", "GitHub Actions",
    // Tools and Version Control
    "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Eclipse", "J-Boss",
    "IntelliJ IDEA", "PyCharm", "Xcode", "NetBeans", "Postman", "Fiddler", 
    "Wireshark", "JIRA", "Confluence", "Maven", "Gradle", "NPM", "Yarn","CMS",
    //Other Network Skills 
    "LAN"," WAN", "SNMP", "DNS" ,"VLAN", "VTP", "HSRP", "VRRP", "STP",
    "MPLS", "MPLS L2 VPN", "MPLS L3 VPN","Routing Configuration ", "Switching Configuration", "Configuration", "Protocols",
    "BGP", "OSPF", "EIGRP","BGP","OSPF","STP","NAT",
    // Other Relevant Technologies
    "GraphQL", "REST APIs", "WebSockets", "OAuth", "JWT", "AJAX", "Linux RHEL 7.0/8.0","CentOS","YUM","RPM",
    "WebRTC", "OpenShift", "Kong API Gateway", "Istio", "Apache Kafka", "LVM","Splunk", "Dynatrace", "AppDynamics", "SVN",
    "RabbitMQ", "ActiveMQ", "Elastic Stack", "Prometheus dashboard", "Grafana","FTP", "NFS","SAMBA","Jenkins", "Maven", "Docker", 
    "Pivotal Cloud Foundry", "Apache Tomcat", "Hazel cast", "Cassandra", "JIRA", "Target deployment port (IBM Tool)", 
    "Windows", "Linux", "Mac", "Agile" , "Scrum", "IP Configuration","FIREWALL", "SELINUX", "TCP wrappers","Microservices",
    "SVN","CVS","BigBucket"
  ];

  // Escape special characters in predefined skills
  const escapedSkills = predefinedSkills.map(escapeRegExp);

  const keywordRegex = new RegExp(
    `(${keywords.join("|")})\\s*[:\\-]?\\s*([\\w\\W]+?)(?=\\n\\n|$)`,
    "gi"
  );

  const matches = [];
  let match;

  while ((match = keywordRegex.exec(text)) !== null) {
    matches.push({
      keyword: match[1],
      content: match[2],
    });
  }

  const foundKeywords = matches.map((match) => match.keyword);
  const extractedSkillsFromKeywords = matches
    .flatMap((match) => {
      if (match && match.content) {
        return match.content.split(/[\n,]/);
      }
      return [];
    })
    .map((skill) => skill.trim().toLowerCase()) // Normalize case
    .filter((skill) =>
      escapedSkills.some((escapedSkill) => new RegExp(`^${escapedSkill}$`, "i").test(skill))
    );

  // Ensure unique skills from keyword matches
  const uniqueSkillsFromKeywords = Array.from(new Set(extractedSkillsFromKeywords)).map((skill) =>
    predefinedSkills.find((predefined) => predefined.toLowerCase() === skill)
  );

  // If no keywords were found, perform a full-text scan for skills
  let uniqueSkillsFromText = [];
  if (uniqueSkillsFromKeywords.length === 0) {
    uniqueSkillsFromText = predefinedSkills.filter((skill) =>
      new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i").test(text)
    );
  }

  const finalExtractedSkills =
    uniqueSkillsFromKeywords.length > 0
      ? uniqueSkillsFromKeywords
      : uniqueSkillsFromText;

  return { foundKeywords, extractedSkills: finalExtractedSkills };
}

// function extractJobTitle(text) {
//   const jobKeywords = ["Job Title", "Position", "Role", "Designation"];
//   const jobRegex = new RegExp(
//     `(?:${jobKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s]+)`,
//     "i"
//   );

//   const jobMatch = text.match(jobRegex);
//   return jobMatch ? jobMatch[1].trim() : "Not found";
// }

function extractJobTitle(text) {
  // console.log("text:",text)
  const jobKeywords = [
    "Job Title", "Designation", "Job Position",
    "Employment Title", "Career Position", "Professional Role", "Career Title",
    "Position Title", "Job Role", "Job Description", "Position Name",
    "Position Held", "Position Of", "Official Title", "Current Position",
    "Work Title", "Work Position", "Professional Title"
  ];

  //   const predefinedRoles = [
  //     // Programming Languages
  //     "Software Developer", "Project Manager", ".NET Developer", ".Net Developer","Software Engineer", "Full Stack Web Developer", "Full Stack Developer","full-stack web developer", "Frontend Developer", "Backend Developer",
  //     "System Engineer", "Embedded Software Engineer", "Application Developer", "Game Developer", "Automation Engineer",
  //     "AI Developer", "ML Engineer", "Data Engineer", "Quantitative Developer", "Scripting Engineer", "Code Reviewer",
  //     "Lead Software Developer", "Senior Software Engineer", "Principal Engineer", "Java Spring Boot Developer",
  //     "Senior Java Developer", "Lead Java Developer", "Java Module Lead", "Team Lead",

  //     // Frontend Development
  //     "Frontend Developer", "UI Developer", "Web Developer", "React Developer", "Angular Developer", 
  //     "Vue.js Developer", "Svelte Developer", "HTML/CSS Developer", "UI/UX Engineer", "Web Designer", 
  //     "Mobile Frontend Developer", "Frontend Architect", "SPA Developer", "UI Framework Specialist",
  //     "Senior Frontend Developer", "Lead Frontend Developer", "Frontend Team Lead", "Frontend Module Lead",

  //     // Backend Development
  //     "Backend Developer", "Node.js Developer", "Django Developer", "Flask Developer", "Express.js Developer",
  //     "Ruby on Rails Developer", "Java Backend Developer", "PHP Developer", "API Developer", "Microservices Developer",
  //     "Middleware Developer", "Backend Architect", "Data Engineer", "Platform Engineer", "Backend Infrastructure Engineer",
  //     "Senior Backend Developer", "Lead Backend Developer", "Backend Team Lead", "Java Spring Boot Developer",
  //     "Microservices Module Lead", "Backend Module Lead",

  //     // Databases
  //     "Database Administrator", "Data Engineer", "SQL Developer", "Database Developer", "MongoDB Specialist", 
  //     "Data Scientist", "ETL Developer", "Big Data Engineer", "Data Architect", "Database Migration Specialist",
  //     "Data Warehouse Engineer", "Database Security Engineer", "Data Ops Engineer", "Cloud Database Administrator",
  //     "Senior Database Engineer", "Lead Database Engineer", "Database Team Lead",

  //     // Cloud and DevOps
  //     "DevOps Engineer", "Cloud Engineer", "AWS Developer", "Azure Engineer", "Google Cloud Architect",
  //     "Site Reliability Engineer (SRE)", "Infrastructure Engineer", "Build and Release Engineer", "CI/CD Specialist",
  //     "Platform Engineer", "Cloud Architect", "Containerization Specialist", "Automation Engineer", "Cloud Migration Specialist",
  //     "Network Operations Engineer", "Kubernetes Administrator", "Infrastructure Architect", "Cloud Solutions Engineer",
  //     "Senior DevOps Engineer", "Lead DevOps Engineer", "DevOps Team Lead",

  //     // Tools and Version Control
  //     "Software Engineer", "Version Control Specialist", "Release Manager", "Build Engineer", "Automation Engineer",
  //     "Technical Support Engineer", "Systems Administrator", "Quality Assurance Engineer", "Software Configuration Manager",
  //     "Git Specialist", "Source Control Engineer", "CI/CD Pipeline Engineer", "DevOps Support Engineer",
  //     "Senior Build Engineer", "Lead QA Engineer", "Configuration Manager",

  //     // Network Engineering
  //     "Network Engineer", "Senior Associate (Network Engineer)", "TECHNICAL SPECIALIST", "System  Administrator", "Network Administrator", "Assistant Manager (L3)– Systems (DTIS).", "Assistant Manager (L3)", 
  //     "Network Security Engineer", "Network Architect", "Systems Engineer", "Firewall Engineer", 
  //     "Telecommunications Engineer", "Network Analyst", "Network Infrastructure Engineer", "VoIP Engineer",
  //     "Wireless Network Engineer", "Cloud Network Engineer", "Network Design Specialist", 
  //     "Network Operations Center (NOC) Engineer", "Routing Specialist", "LAN/WAN Engineer", "Load Balancer Specialist",
  //     "Lead Network Engineer", "Senior Network Engineer", "LINUX ADMINISTRATOR",

  //     // Security Specialist
  //     "Cybersecurity Engineer", "Security Specialist", "SOC Analyst", "Penetration Tester", "Vulnerability Analyst",
  //     "IAM Specialist", "Threat Analyst", "Forensics Analyst", "Incident Response Engineer", "Application Security Engineer",
  //     "Data Security Analyst", "SOC Manager", "Security Consultant", "Red Team Specialist", "Endpoint Security Engineer",
  //     "Compliance Analyst", "Security Policy Analyst", "IT Risk Specialist", "Malware Analyst", "Cryptography Engineer",
  //     "Lead Cybersecurity Engineer", "Senior Security Engineer", "Security Team Lead",

  //     // Solution Architect
  //     "Solution Architect", "Cloud Architect", "Enterprise Architect", "Technical Architect", "Software Architect",
  //     "Infrastructure Architect", "Application Architect", "Business Solutions Architect", "Data Architect", 
  //     "Platform Architect", "System Design Engineer", "Scalability Engineer", "Digital Transformation Specialist",
  //     "Integration Architect", "Cloud Solutions Architect", "IT Infrastructure Architect", 
  //     "Lead Architect", "Principal Architect", "Chief Architect",

  //     // Other Relevant Technologies
  //     "API Developer", "Integration Engineer", "Middleware Developer", "WebSocket Developer", "GraphQL Developer",
  //     "OAuth Engineer", "Microservices Engineer", "Event-Driven Developer", "System Monitoring Engineer",
  //     "DevOps Monitoring Specialist", "Telemetry Engineer", "Data Integration Specialist", "IoT Developer",
  //     "Data Visualization Engineer", "Network Automation Engineer", "Messaging Specialist", "Service Mesh Specialist",
  //     "Kafka Developer", "RabbitMQ Engineer", "Real-Time Data Engineer", "Alerting and Monitoring Engineer",
  //     "Distributed Systems Engineer", "Resilience Engineer", "Business Intelligence Developer",
  //     "Senior API Developer", "Lead Data Engineer", "Platform Lead",

  //     // Specialized and Emerging Roles
  //     "Blockchain Developer", "Quantum Computing Engineer", "Edge Computing Specialist", "Virtualization Engineer",
  //     "AI Infrastructure Engineer", "Digital Twins Developer", "Augmented Reality Developer", "Robotic Process Automation (RPA) Developer",
  //     "Synthetic Data Engineer", "5G Network Engineer", "Machine Vision Engineer", "Deep Learning Engineer",
  //     "Bioinformatics Developer", "Medical Imaging Specialist", "Quantum Cryptographer", "Smart Contract Developer",
  //     "Senior AI Engineer", "Technical Lead", "Senior Technical Lead", "Engineering Manager", "Lead Engineer",
  //     "Principal Software Engineer", "Technical Project Lead", "Development Manager", "Delivery Module Lead"
  // ];




  // // Create regex for job keywords
  // const jobRegex = new RegExp(
  //   `(?:${jobKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s]+)`,
  //   "i"
  // );

  // // Try to match using job keywords
  // const jobMatch = text.match(jobRegex);
  // if (jobMatch) return jobMatch[1].trim();

  // // If no match, try to match by predefined roles
  // const roleRegex = new RegExp(`\\b(${predefinedRoles.join("|")})\\b`, "i");
  // const roleMatch = text.match(roleRegex);
  // return roleMatch ? roleMatch[1].trim() : "Not found";

  // const jobRegex = new RegExp(
  //   `(?:${jobKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s]{1,50})(?:\\n|\\r|\\s{2,})`,
  //   "i"
  // );

  // // Try to match using job keywords on the same line only
  // const jobMatch = text.match(jobRegex);
  // if (jobMatch) return jobMatch[1].trim();

  // // If no match by keywords, try to match by predefined roles
  // const roleRegex = new RegExp(`\\b(${predefinedRoles.join("|")})\\b`, "i");
  // const roleMatch = text.match(roleRegex);
  // return roleMatch ? roleMatch[1].trim() : "Not found";
  const jobRegex = new RegExp(
    `(?:${jobKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s(),]{1,100})`,
    "i"
  );

  const jobMatch = text.match(jobRegex);
  if (jobMatch) return jobMatch[1].trim();

  // If no match by keywords, try to match by predefined roles
  const roleRegex = new RegExp(`\\b(${predefinedRoles.join("|")})\\b`, "i");
  const roleMatch = text.match(roleRegex);
  return roleMatch ? roleMatch[1].trim() : "Not found";
}



// function extractExperience(text) {
//   const experienceRegex = /(Experience|Professional Experience|Work History)([\s\S]*?)(Education|Skills|Projects|Certifications|$)/i;
//   const match = text.match(experienceRegex);

//   if (match) {
//     let experienceDetails = match[2].trim();  // Extract the experience content
//     // Clean up the content:
//     experienceDetails = experienceDetails.replace(/\s{2,}/g, " ");  // Replace multiple spaces with a single space
//     experienceDetails = experienceDetails.replace(/;+/g, ";");  // Replace multiple semicolons with a single semicolon
//     experienceDetails = experienceDetails.replace(/(\r?\n){2,}/g, "\n");  // Replace multiple line breaks with a single one
//     experienceDetails = experienceDetails.replace(/^\n+/g, "").replace(/\n+$/g, "");  // Remove leading/trailing line breaks

//     return experienceDetails;
//   }

//   return "No detailed experience information found";
// }

// function extractExperience(text) {
//   console.log("text::",text)
//   const experienceKeywords = [
//     "Experience", 
//     "Work Experience", 
//     "Professional Experience", 
//     "Work History", 
//     "Employment History", 
//     "Career Summary", 
//     "Relevant Experience", 
//     "Previous Experience", 
//     "Professional Background", 
//     "Job History", 
//     "Project Experience", 
//     "Employment Experience", 
//     "Professional History", 
//     "Career Highlights", 
//     "Experience Summary", 
//     "Work Background", 
//     "Professional Summary", 
//     "Roles and Responsibilities", 
//     "Positions Held", 
//     "Past Positions"
//   ];

//   const companyNameKeywords = [
//     "private limited", "pvt. ltd.", "pvt ltd", "limited", "solutions",
//     "Technologies", "Ltd Pvt", "Inc", "Corporation", "Group", "Consulting", "Services"
// ];

// const workExperiences = [];

// // Normalize text for easier parsing
// const normalizedText = text.replace(/\s+/g, " ").trim();

// // Match date ranges (e.g., 2022/02 – present or 2019/04 – 2022/01)
// const experienceRegex = /(\d{4}\/\d{2})\s*[-–]\s*(\d{4}\/\d{2}|present)(.*?)(?=\d{4}\/\d{2}|$)/gi;
// let matches;

// while ((matches = experienceRegex.exec(normalizedText)) !== null) {
//     const fromDate = matches[1];
//     const toDate = matches[2];
//     const remainingText = matches[3].trim();

//     // Extract company name and designation
//     let companyName = "";
//     let designation = "";

//     const companyNameRegex = new RegExp(`\\b(.*?)\\b(?:${companyNameKeywords.join("|")})\\b`, "i");
//     const companyNameMatch = remainingText.match(companyNameRegex);

//     if (companyNameMatch) {
//         companyName = companyNameMatch[0].trim();
//     }

//     // Extract designation (text before company name if present)
//     const designationMatch = remainingText.replace(companyName, "").trim().match(/^[^\d,]+/);
//     if (designationMatch) {
//         designation = designationMatch[0].trim();
//     }

//     workExperiences.push({
//         companyName: companyName || "Unknown",
//         designation: designation || "Unknown",
//         fromDate,
//         toDate,
//     });
// }

// return workExperiences;
//   // return "No detailed experience information found";
// }

// function extractExperience(text) {
//   console.log("text::::",text)
//   const experienceKeywords = [
//     "Experience", 
//     "Work Experience", 
//     "Professional Experience", 
//     "Work History", 
//     "Employment History", 
//     "Career Summary", 
//     "Relevant Experience", 
//     "Previous Experience", 
//     "Professional Background", 
//     "Job History", 
//     "Project Experience", 
//     "Employment Experience", 
//     "Professional History", 
//     "Career Highlights", 
//     "Experience Summary", 
//     "Work Background", 
//     "Professional Summary", 
//     "Roles and Responsibilities", 
//     "Positions Held", 
//     "Past Positions"
//   ];

//   const companyNamesKeywords = [
//     "private limited", "pvt. ltd.", "pvt ltd", "limited", "solutions", 
//     "technologies", "Ltd Pvt", "Inc", "corporation", "LLC", "group"
//   ];

//   // Helper function to extract company name
//   function extractCompanyName(text) {
//     let companyName = null;
//     companyNamesKeywords.forEach(keyword => {
//       if (text.toLowerCase().includes(keyword)) {
//         companyName = text.match(/([A-Za-z0-9&,\s]+(private limited|pvt. ltd.|pvt ltd|solutions|technologies|Ltd Pvt|Inc|corporation|LLC|group)[A-Za-z0-9&,\s]*)/i);
//         if (companyName) companyName = companyName[0].trim();
//       }
//     });
//     return companyName || 'Company name not found';
//   }

//   // Helper function to extract start and end dates
//   function extractDates(text) {
//     const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2},\s?\d{4}|\d{4}[-/]\d{2}[-/]\d{2}\b/g;
//     const dates = text.match(dateRegex);
//     return dates ? dates : ['Start date not found', 'End date not found'];
//   }

//   // Main function to parse the resume text
//   let workExperience = [];
//   experienceKeywords.forEach(keyword => {
//     let keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
//     if (keywordIndex !== -1) {
//       let experienceText = text.slice(keywordIndex);
//       let companyName = extractCompanyName(experienceText);
//       let [startDate, endDate] = extractDates(experienceText);

//       // Assuming that the parsed resume text will have some structure such as:
//       // Job Title - Company Name (Date Range)
//       let jobTitle = experienceText.split('\n')[0]?.trim() || 'Job title not found';

//       // Push experience data to the result array
//       workExperience.push({
//         companyName,
//         jobTitle,
//         startDate,
//         endDate
//       });
//     }
//   });

//   return workExperience;
// }

// function extractExperience(text) {
//     console.log("text::",text)
//   const experienceKeywords = [
//     "Experience", 
//     "Experience Profile", 
//     "Work Experience", 
//     "Professional Experience", 
//     "Work History", 
//     "Employment History", 
//     "Career Summary", 
//     "Relevant Experience", 
//     "Previous Experience", 
//     "Professional Background", 
//     "Job History", 
//     "Project Experience", 
//     "Employment Experience", 
//     "Professional History", 
//     "Career Highlights", 
//     "Experience Summary", 
//     "Work Background", 
//     "Professional Summary", 
//     "Roles and Responsibilities", 
//     "Positions Held", 
//     "Past Positions"
//   ];

//   const companyNamesKeywords = [
//     "private limited", "pvt. ltd.", "pvt ltd", "limited", "solutions", 
//     "technologies", "Ltd Pvt", "Inc", "corporation", "LLC", "group"
//   ];

//   // Helper function to extract company name (based on keywords)
//   function extractCompanyName(text) {
//     for (let keyword of companyNamesKeywords) {
//       const companyMatch = text.match(new RegExp(`([A-Za-z0-9&,\s]+${keyword}[A-Za-z0-9&,\s]*)`, 'i'));
//       if (companyMatch) {
//         return companyMatch[0].trim();
//       }
//     }
//     return 'Company name not found';
//   }

//   // Helper function to extract job title and company from text
//   function extractJobTitleAndCompany(text) {
//     const jobTitleCompanyRegex = /([A-Za-z0-9\s]+)\s*(?:at|in|with)\s*([\w\s&,.]+(?:private limited|pvt\. ltd\.|Ltd|Technologies|Inc|corporation|LLC|group)[\w\s&,.]*)/i;
//     const match = text.match(jobTitleCompanyRegex);
//     if (match) {
//       return {
//         jobTitle: match[1]?.trim() || 'Job title not found',
//         companyName: match[2]?.trim() || 'Company name not found'
//       };
//     }
//     return {
//       jobTitle: 'Job title not found',
//       companyName: 'Company name not found'
//     };
//   }

//   // Helper function to extract start and end dates
//   function extractDates(text) {
//     const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{1,2},?\s?\d{4}|\d{4}[-/]\d{2}[-/]\d{2}\b/g;
//     const dates = text.match(dateRegex);
//     if (dates && dates.length === 2) {
//       return dates;
//     }
//     return ['Start date not found', 'End date not found'];
//   }

//   // Main function to parse the resume text
//   let workExperience = [];
//   experienceKeywords.forEach(keyword => {
//     let keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
//     if (keywordIndex !== -1) {
//       let experienceText = text.slice(keywordIndex);
//       let experienceDetails = experienceText.split('\n').slice(1).join('\n'); // Skip the first line which is the section header

//       // Extract job title, company name, and dates
//       let { jobTitle, companyName } = extractJobTitleAndCompany(experienceDetails);
//       let [startDate, endDate] = extractDates(experienceDetails);

//       // Push experience data to the result array
//       workExperience.push({
//         companyName,
//         jobTitle,
//         startDate,
//         endDate
//       });
//     }
//   });

//   return workExperience;

// }
function extractExperience(text) {
  // console.log("text::", text)

  const experienceKeywords = [
    "Experience", "Work Experience", "Professional Experience", "Work History", 
    "Employment History", "Career Summary", "Relevant Experience", "Previous Experience", 
    "Professional Background", "Job History", "Project Experience", "Employment Experience", 
    "Professional History", "Career Highlights", "Experience Summary", "Work Background", 
    "Professional Summary", "Roles and Responsibilities", "Positions Held", "Past Positions"
  ];

  const companyNamesKeywords = [
    "private limited", "pvt. ltd.", "pvt ltd", "limited", "solutions", 
    "technologies", "Ltd Pvt", "Inc", "corporation", "LLC", "group"
  ];

  // Enhanced regex for dates
  const dateRegex = /\b(?:\d{4}\/\d{2}|[A-Za-z]{3}-\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\b/g;

  // Split lines and trim whitespace
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);

  const results = [];
  let currentCompany = null;
  let currentRole = null;
  let startDate = null;
  let endDate = null;

  lines.forEach(line => {
    // Check for date range
    const dates = line.match(dateRegex);
    if (dates && dates.length >= 1) {
      startDate = dates[0];
      endDate = dates[1] || 'Present';
    }

    // Check for roles
    const matchingRole = predefinedRoles.find(role => line.toLowerCase().includes(role.toLowerCase()));
    if (matchingRole) {
      currentRole = matchingRole;
    }

    // Check for company names
    if (companyNamesKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
      if (currentCompany) {
        // Push the previous entry
        results.push({ company: currentCompany, role: currentRole, startDate, endDate });
      }
      currentCompany = line.split("as")[0]?.trim() || null; // Extract company name
      currentRole = predefinedRoles.find(role => line.toLowerCase().includes(role.toLowerCase())) || null; // Extract role
      startDate = null;
      endDate = null;
    }
  });

  // Push the last entry
  if (currentCompany) {
    results.push({ company: currentCompany, role: currentRole, startDate, endDate });
  }

  return results;
}



function extractCompanyDetails(text) {
  const companyKeywords = [
    "Company",
    "Organization",
    "Employer",
    "Firm",
    "Workplace",
  ];
  const companyRegex = new RegExp(
    `(?:${companyKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s]+)`,
    "i"
  );

  const companyMatch = text.match(companyRegex);
  return companyMatch ? companyMatch[1].trim() : "Not found";
}

function extractCertifications(text) {
  const certificationKeywords = ["Certification", "Certifications", "Courses"];
  const ignorableWords = ["Education", "Skills", "Projects", "Work Experience", "Experience"];

  const certificationKeywordsPattern = certificationKeywords.join("|");
  const ignorableWordsPattern = ignorableWords.join("|");

  // Regex to extract the Certifications section
  const certificationRegex = new RegExp(
    `(?:${certificationKeywordsPattern})[\\s\\S]*?(?=\\n(?:${ignorableWordsPattern}|$))`,
    "i"
  );

  const certificationMatch = text.match(certificationRegex);

  if (certificationMatch) {
    // Use the full matched string (certificationMatch[0]) and remove the header
    const certifications = certificationMatch[0]
      .replace(new RegExp(`^(${certificationKeywordsPattern})`, "i"), "") // Remove the header
      .split(/,\s*/) // Split by commas
      .map((cert) => cert.trim()); // Trim each certification

    return certifications.length ? certifications : ["Not found"];
  }

  return ["Not found"];
}


// function extractLanguages(text) {
//   const languagesKeywords = ["languages known", "language known", "language", "languages"];
//   const lines = text.split('\n');
//   const languages = [];

//   for (const line of lines) {
//     for (const keyword of languagesKeywords) {
//       // Update regex to include '&' and 'and' as additional separators
//       const regex = new RegExp(`\\b${keyword}\\b\\s*[:\\-\\s.]*\\s*([A-Za-z,\\s&]+)`, 'i');

//       const match = line.match(regex);
//       if (match) {
//         // Split by commas, 'and', or '&', trim each item, and filter out empty items
//         languages.push(
//           ...match[1].split(/[,&]+|\band\b/i).map(lang => lang.trim()).filter(Boolean)
//         );
//         break; // Stop after finding the first matching keyword
//       }
//     }
//   }

//   return languages.length > 0 ? languages : ["Not found"];
// }

// function extractLanguages(text) {
//   const languagesKeywords = ["Language Skills", "languages known", "language known", "language", "languages", "spoken languages", "fluent in", "languages spoken", "proficient in", 
//     "languages skills", "known languages", "spoken", "spoken proficiency", 
//     "fluent languages", "linguistic proficiency", "language proficiency", 
//     "linguistic skills", "spoken fluency", "language expertise"];
//   const precedeArrayKeywords = [
//     "programming", "programing", "skills", "coding", "technologies", "technical", 
//     "proficient", "expertise", "tools", "experience", "work experience", "capabilities",
//     "technological", "expert", "knowledge", "competencies"
//   ];
//   const lines = text.split('\n');
//   const languages = [];

//   for (const line of lines) {
//     let isExcluded = false;

//     // Check if any precedeArrayKeywords appear right before any languagesKeywords
//     for (const precedeKeyword of precedeArrayKeywords) {
//       for (const keyword of languagesKeywords) {
//         // Check if the line contains a preceding keyword directly before a languages keyword
//         const regex = new RegExp(`\\b${precedeKeyword}\\b.*\\b${keyword}\\b`, 'i');
//         if (regex.test(line)) {
//           isExcluded = true;
//           break;
//         }
//       }
//       if (isExcluded) break;
//     }

//     if (!isExcluded) {
//       for (const keyword of languagesKeywords) {
//         // Updated regex to match languages separated by commas, bullets, &, 'and' and ignores non-alphabet chars between
//         const regex = new RegExp(`\\b${keyword}\\b\\s*[:\\-\\s.]*\\s*([A-Za-z,\\s&]+)`, 'i');
//         const match = line.match(regex);
//         if (match) {
//           languages.push(
//             ...match[1]
//               .split(/[\s,&]+|\band\b/i)  // Splits on spaces, commas, bullets, ampersand, and 'and'
//               .map(lang => lang.trim())
//               .filter(lang => /^[A-Za-z]+$/.test(lang))  // Ensures each entry is alphabetical
//           );
//           break;
//         }
//       }
//     }
//   }

//   return languages.length > 0 ? languages : ["Not found"];
// }


function extractLanguages(text) {
  const languagesArray = [
    "Hindi", "English", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
    "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili",
    "Santali", "Kashmiri", "Nepali", "Konkani", "Sanskrit", "Sindhi", "Dogri",
    "Manipuri", "Bodo", "Santhali", "Tulu", "Marwari", "Bhojpuri", "Awadhi",
    "Haryanvi", "Rajasthani", "Chhattisgarhi", "Mundari", "Khasi", "Mizo",
    "Garo", "Tripuri", "Ho", "Ladakhi", "Garhwali", "Kumaoni"
  ];
  const languagesKeywords = ["Language Skills", "languages known", "language known", "language", "languages", "spoken languages", "fluent in", "languages spoken", "proficient in",
    "languages skills", "known languages", "spoken", "spoken proficiency",
    "fluent languages", "linguistic proficiency", "language proficiency",
    "linguistic skills", "spoken fluency", "language expertise"];
  const precedeArrayKeywords = [
    "programming", "programing", "skills", "coding", "technologies", "technical",
    "proficient", "expertise", "tools", "experience", "work experience", "capabilities",
    "technological", "expert", "knowledge", "competencies"
  ];
  const lines = text.split('\n');
  const languages = [];

  for (const line of lines) {
    let isExcluded = false;

    // Check if any precedeArrayKeywords appear right before any languagesKeywords
    for (const precedeKeyword of precedeArrayKeywords) {
      for (const keyword of languagesKeywords) {
        // Check if the line contains a preceding keyword directly before a languages keyword
        const regex = new RegExp(`\\b${precedeKeyword}\\b.*\\b${keyword}\\b`, 'i');
        if (regex.test(line)) {
          isExcluded = true;
          break;
        }
      }
      if (isExcluded) break;
    }

    if (!isExcluded) {
      for (const keyword of languagesKeywords) {
        // Updated regex to match languages separated by commas, bullets, &, 'and' and ignores non-alphabet chars between
        const regex = new RegExp(`\\b${keyword}\\b\\s*[:\\-\\s.]*\\s*([A-Za-z,\\s&]+)`, 'i');
        const match = line.match(regex);
        if (match) {
          languages.push(
            ...match[1]
              .split(/[\s,&]+|\band\b/i)  // Splits on spaces, commas, bullets, ampersand, and 'and'
              .map(lang => lang.trim())
              .filter(lang => /^[A-Za-z]+$/.test(lang))  // Ensures each entry is alphabetical
          );
          break;
        }
      }
    }
  }


  // Filter the extracted languages against the languagesArray
  const validLanguages = languages
    .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()) // Normalize case
    .filter(lang => languagesArray.includes(lang));

  return validLanguages.length > 0 ? validLanguages : ["Not found"];

}

// for bullet point logic
// function extractLanguages(text) {
//   const languagesArray = [
//     "Hindi", "English", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
//     "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili",
//     "Santali", "Kashmiri", "Nepali", "Konkani", "Sanskrit", "Sindhi", "Dogri",
//     "Manipuri", "Bodo", "Santhali", "Tulu", "Marwari", "Bhojpuri", "Awadhi",
//     "Haryanvi", "Rajasthani", "Chhattisgarhi", "Mundari", "Khasi", "Mizo",
//     "Garo", "Tripuri", "Ho", "Ladakhi", "Garhwali", "Kumaoni"
//   ];
//   const languagesKeywords = ["Language Skills", "languages known", "language known", "language", "languages", "spoken languages", "fluent in", "languages spoken", "proficient in",
//     "languages skills", "known languages", "spoken", "spoken proficiency",
//     "fluent languages", "linguistic proficiency", "language proficiency",
//     "linguistic skills", "spoken fluency", "language expertise"];
  
//   // Normalize text by replacing bullets and excess whitespace
//   const normalizedText = text.replace(//g, '').replace(/\s+/g, ' ').trim();

//   // Check for language keywords in text
//   const keywordRegex = new RegExp(`\\b(${languagesKeywords.join('|')})\\b`, 'i');
//   if (!keywordRegex.test(normalizedText)) return ["Not found"];

//   // Extract languages
//   const regex = new RegExp(`\\b(?:${languagesKeywords.join('|')})\\b.*?([A-Za-z,\\s&]+)`, 'i');
//   const matches = normalizedText.match(regex);

//   if (matches) {
//     const extractedLanguages = matches[1]
//       .split(/[\s,&]+|\band\b/i) // Split on spaces, commas, bullets, ampersand, and "and"
//       .map(lang => lang.trim())
//       .filter(lang => /^[A-Za-z]+$/.test(lang)); // Only keep valid alphabetical entries

//     // Filter extracted languages against the languagesArray
//     const validLanguages = extractedLanguages
//       .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase())
//       .filter(lang => languagesArray.includes(lang));

//     return validLanguages.length > 0 ? validLanguages : ["Not found"];
//   }

//   return ["Not found"];
// }

// for bullet point logic 2nd
function extractLanguages(text) {
  const languagesArray = [
    "Hindi", "English", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
    "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili",
    "Santali", "Kashmiri", "Nepali", "Konkani", "Sanskrit", "Sindhi", "Dogri",
    "Manipuri", "Bodo", "Santhali", "Tulu", "Marwari", "Bhojpuri", "Awadhi",
    "Haryanvi", "Rajasthani", "Chhattisgarhi", "Mundari", "Khasi", "Mizo",
    "Garo", "Tripuri", "Ho", "Ladakhi", "Garhwali", "Kumaoni"
  ];

  const languagesKeywords = [
    "Language Skills", "languages known", "language known", "language", "languages",
    "spoken languages", "fluent in", "languages spoken", "proficient in",
    "languages skills", "known languages", "spoken", "spoken proficiency",
    "fluent languages", "linguistic proficiency", "language proficiency",
    "linguistic skills", "spoken fluency", "language expertise"
  ];

  const precedeArrayKeywords = [
    "programming", "programing", "skills", "coding", "technologies", "technical",
    "proficient", "expertise", "tools", "experience", "work experience", "capabilities",
    "technological", "expert", "knowledge", "competencies"
  ];

  const lines = text.split('\n');
  const languages = [];

  for (const line of lines) {
    let isExcluded = false;

    // Exclude lines with programming/technical context
    for (const precedeKeyword of precedeArrayKeywords) {
      for (const keyword of languagesKeywords) {
        const regex = new RegExp(`\\b${precedeKeyword}\\b.*\\b${keyword}\\b`, 'i');
        if (regex.test(line)) {
          isExcluded = true;
          break;
        }
      }
      if (isExcluded) break;
    }

    if (!isExcluded) {
      // Check for keywords and extract language list
      for (const keyword of languagesKeywords) {
        const regex = new RegExp(`\\b${keyword}\\b[:\\-\\s.]*([A-Za-z,\\s&]+)`, 'i');
        const match = line.match(regex);
        if (match) {
          languages.push(
            ...match[1]
              .split(/[\s,&]+|\band\b/i)
              .map(lang => lang.trim())
              .filter(lang => /^[A-Za-z]+$/.test(lang))
          );
        }
      }

      // Handle lines with only languages (e.g., bullet points or separated entries)
      const languageOnlyRegex = new RegExp(`\\b(${languagesArray.join('|')})\\b`, 'i');
      const languageMatch = line.match(languageOnlyRegex);
      if (languageMatch) {
        languages.push(languageMatch[1]);
      }
    }
  }

  // Normalize case and filter valid languages
  const validLanguages = languages
    .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase())
    .filter(lang => languagesArray.includes(lang));

  return validLanguages.length > 0 ? Array.from(new Set(validLanguages)) : ["Not found"];
}



function extractDetails(text) {
  const parsedText = text.trim();
  const name = extractNameFromResume(parsedText);
  const email = extractEmailFromResume(parsedText);
  const jobTitle = extractJobTitle(parsedText);
  const phone = extractPhoneFromResume(parsedText);
  const dob = extractDOB(parsedText);
  const gender = extractGenderFromResume(parsedText);
  // const gender = parsedText.match(/Gender\s*:\s*(\w+)/)?.[1]?.trim() || "Not found";
  const maritalStatus = extractMaritalStatus(parsedText);
  const education = extractEducation(parsedText);
  const experience = extractExperience(parsedText);
  const technicalSkills = extractTechnicalSkills(parsedText);
  const companyDetails = extractCompanyDetails(parsedText);
  const certifications = extractCertifications(parsedText);
  const languages = extractLanguages(parsedText);
  return { name, email, jobTitle, phone, dob, gender, maritalStatus, education, experience, technicalSkills, companyDetails, certifications, languages, text:parsedText };
}

app.post("/api/upload", upload.single("resume"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const ext = path.extname(file.originalname);

  try {
    let parsedText = "";
    // console.log("Raw Parsed Text:", parsedText);

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      parsedText = data.text;
      // console.log("Parsed PDF Text:", parsedText);
    } else if (ext === ".docx") {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      parsedText = result.value;
      // console.log("Parsed Docs Text:", parsedText);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // console.log("Parsed Resume Text:", parsedText);

    const details = extractDetails(parsedText);

    res.json(details);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing file" });
  }
});
app.get("/ping", async (req, res) => {
  try {
    res.status(200).json({ info: "pong" });
  } catch (error) {
    console.error("Something went wrong:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
