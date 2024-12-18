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

// Name Function array
const nameKeywords = [
  "Name",
  "Candidate Name",
  "Applicant Name",
  "Full Name",
];

// Name Function array // List of keywords to skip when looking for names at the top
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
  "Temporary", "Full-time", "Part-time", "Remote Worker", "Onsite", "Hybrid",

  // Extra Words

];
// Name Function array // keywordsMergedWithName removal 
const keywordsMergedWithName = ["Mobile", "Number", "DOB", "Email", "Date", "Gender"];

// Name Function array
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

// Name Function array // Common terms that should not be considered as names
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

// JobTitle Function array
const jobKeywords = [
  "Job Title", "Designation", "Job Position",
  "Employment Title", "Career Position", "Professional Role", "Career Title",
  "Position Title", "Job Role", "Job Description", "Position Name",
  "Position Held", "Position Of", "Official Title", "Current Position",
  "Work Title", "Work Position", "Professional Title"
];

// JobTitle Function array
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

// DOB Function array // Define date of birth keywords (case insensitive)
const dobKeywords = [
  "dob", "d o b", "d.o.b", "d.o.b.",
  "DOB", "D O B", "D.O.B", "D.O.B.",
  "Date of Birth", "DATE OF BIRTH", "date of birth"
];

// Email Function array
const emailKeywords = ["E-mail-", "E-mail:", "Email-", "Email:", "Email", "email", "E-mail", "Mail", "mail"];

// Gender Function array
const genderKeywords = [
  "gender", "Gender", "sex", "Sex", "SEX",
  "gndr", "Gndr", "GENDER",
  "Sex/Gender", "Gender/Sex",
  "gender:", "sex:", "sex -", "gender -",
  "gender identity", "Gender Identity"
];

// Phone Function array
const phoneKeywords = [
  "Phone",
  "Contact No",
  "Mobile",
  "Phone Number",
  "Tel",
];


// Marital Function array
const maritalStatusKeywords = ["Marital Status", "Marital"];


// Technical Skills Function array
const technicalSkillsKeywords = [
  "Technical Skills",
  "Skills",
  "Network Skills",
  "Core Skills",
  "Relevant Skills",
  "Tech Stack",
  "Technical Profile",
  "Software Skills (Technical and project management )",
];


// Technical Skills Function array
const predefinedSkills = [
  // Programming Languages
  "C++", "Java", "JavaScript", "Python", "HTML", "HTML 5", "CSS", "C", "J2SE", "J2EE",
  "TypeScript", "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala",
  "VB.NET", "C#", "F#", "Perl", "Matlab", "Data Structures And Algorithms", "Shell Scripting",
  // Frontend Development
  "React JS", "React", "React.js", "AngularJs", "Vue.js", "Svelte", "jQuery", "Bootstrap", "J-Query",
  "TailwindCSS", "Material-UI", "Ant Design", "Sass", "Less", "Ajax",
  // Backend Development
  "Node.js", "Django", "Flask", "Express.js", "Ruby on Rails", "Spring", "DHCP", "DNS Servers",
  "Spring Boot", "Spring MVC", "Hibernate", "Laravel", "CodeIgniter", "ASP.mvc",
  "Symfony", "Asp.net", "ASP.NET Core", "Koa.js", "FastAPI", "VB.net", "C#.net",
  // Databases
  "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Firebase", "SQLite", "SQL", "My-Sql",
  "Redis", "Cassandra", "Elasticsearch", "MariaDB", "DynamoDB", "CockroachDB", "Postgray",
  // Cloud and DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
  "Jenkins", "Ansible", "Puppet", "Chef", "CloudFormation", "Heroku",
  "Netlify", "Vercel", "CircleCI", "GitHub Actions",
  // Tools and Version Control
  "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Eclipse", "J-Boss",
  "IntelliJ IDEA", "PyCharm", "Xcode", "NetBeans", "Postman", "Fiddler",
  "Wireshark", "JIRA", "Confluence", "Maven", "Gradle", "NPM", "Yarn", "CMS",
  //Other Network Skills 
  "LAN", " WAN", "SNMP", "DNS", "VLAN", "VTP", "HSRP", "VRRP", "STP",
  "MPLS", "MPLS L2 VPN", "MPLS L3 VPN", "Routing Configuration ", "Switching Configuration", "Configuration", "Protocols",
  "BGP", "OSPF", "EIGRP", "BGP", "OSPF", "STP", "NAT",
  // Other Relevant Technologies
  "GraphQL", "REST APIs", "WebSockets", "OAuth", "JWT", "AJAX", "Linux RHEL 7.0/8.0", "CentOS", "YUM", "RPM",
  "WebRTC", "OpenShift", "Kong API Gateway", "Istio", "Apache Kafka", "LVM", "Splunk", "Dynatrace", "AppDynamics", "SVN",
  "RabbitMQ", "ActiveMQ", "Elastic Stack", "Prometheus dashboard", "Grafana", "FTP", "NFS", "SAMBA", "Jenkins", "Maven", "Docker",
  "Pivotal Cloud Foundry", "Apache Tomcat", "Hazel cast", "Cassandra", "JIRA", "Target deployment port (IBM Tool)",
  "Windows", "Linux", "Mac", "Agile", "Scrum", "IP Configuration", "FIREWALL", "SELINUX", "TCP wrappers", "Microservices",
  "SVN", "CVS", "BigBucket"
];


// Languages Function array
const languagesArray = [
  "Hindi", "English", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
  "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili",
  "Santali", "Kashmiri", "Nepali", "Konkani", "Sanskrit", "Sindhi", "Dogri",
  "Manipuri", "Bodo", "Santhali", "Tulu", "Marwari", "Bhojpuri", "Awadhi",
  "Haryanvi", "Rajasthani", "Chhattisgarhi", "Mundari", "Khasi", "Mizo",
  "Garo", "Tripuri", "Ho", "Ladakhi", "Garhwali", "Kumaoni"
];

// Languages Function array
const languagesKeywords = [
  "Language Skills", "languages known", "language known", "language", "languages",
  "spoken languages", "fluent in", "languages spoken", "proficient in",
  "languages skills", "known languages", "spoken", "spoken proficiency",
  "fluent languages", "linguistic proficiency", "language proficiency",
  "linguistic skills", "spoken fluency", "language expertise"
];

// Languages Function array
const precedeArrayKeywords = [
  "programming", "programing", "skills", "coding", "technologies", "technical",
  "proficient", "expertise", "tools", "experience", "work experience", "capabilities",
  "technological", "expert", "knowledge", "competencies"
];

// Education Function array
const educationKeywords = [
  "Education",
  "Academic Background",
  "Academia",
  "Academic Background",
  "Scholastic Profile",
  "Academic Qualification",
  "Degrees",
  "Qualifications",
  "Academic Profile",
  "Education Qualification",
  "Educational Profile",
];

// Education Function array
const ignorableWordsForEducation = [
  "Learning New Technologies",
  "HOBBIES",
  "Extra Activities",
  "Work Experience",
  "Technical Expertise",
  "Additional Information",
  "Skills",
  "Projects",
  "PROFESSIONAL SUMMARY",
  "PROFESSIONAL EXPERIENCE",
  "PERSONAL DETAILS",
  "Certification",
  "Certifications",
  "Areas of Training"
];


// Experience Function array
const experienceKeywords = [
  "Experience", "Work Experience", "Professional Experience", "Work History",
  "Employment History", "Career Summary", "Relevant Experience", "Previous Experience",
  "Professional Background", "Job History", "Project Experience", "Employment Experience",
  "Professional History", "Career Highlights", "Experience Summary", "Work Background",
  "Professional Summary", "Roles and Responsibilities", "Positions Held", "Past Positions"
];

// Cetification Function array // Define certification keywords
const certificationKeywords = ["Certification", "Certifications", "Courses", "CERTIFICATE"];


// Extra  array currently not used
const personalDetailsKeywords = ["Personal Information", "Personal Details", "Personal Profile", "Personal Details"];


//Function for extracting name ---------
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
    // Check if the line contains 2 to 4 words
    if (words.length >= 2 && words.length <= 6) {
      const potentialName = words.join(" ");

      if (validateName(potentialName)) {
        // keywordsMergedWithName REMOVAL - this is for cases like - Jeet GuptaMobile Number: 9650863909Email Address: jeet.gupta2@gmail.com  
        const lowerCasedName = potentialName.toLowerCase();

        for (const keyword of keywordsMergedWithName) {
          if (lowerCasedName.includes(keyword.toLowerCase())) {
            return potentialName.split(new RegExp(keyword, "i"))[0];
          }
        }
        return potentialName;
      }
    }
  }

  return null;
}

function validateName(name) {

  // Check if the extracted name matches any invalid terms
  return !invalidNameTerms.some((term) => name.includes(term));
}

// Function for extracting Date of Birth (DOB) -------
function extractDOB(text) {

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

//Function for Phone No. Extraction------
function extractPhoneFromResume(text) {

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

  const statusRegex = new RegExp(
    `(?:${maritalStatusKeywords.join("|")})\\s*[-–—:]?\\s*(Single|Married|Divorced|Widowed|Unmarried)`,
    "i"
  );
  const statusMatch = text.match(statusRegex);
  return statusMatch ? statusMatch[1].trim() : "Not found";
}

// // Function for extracting Education details
// function extractEducation(text) {
//   const educationKeywords = ["Education", "Academic Background", "Degrees", "Qualifications"];
//   const ignorableWords = ["Experience", "Work Experience", "Skills", "Projects", "PROFESSIONAL SUMMARY", "Certification", "Certifications"];

//   // Create regex patterns from keywords and ignorable words
//   const keywordsPattern = educationKeywords.join("|");
//   const ignorableWordsPattern = ignorableWords.join("|");

//   // Regex to extract the Education section (exclude the keyword from the output)
//   const educationRegex = new RegExp(
//     `(?:${keywordsPattern})[\\s\\S]*?(?=\\n(?:${ignorableWordsPattern}|$))`,
//     "i"
//   );

//   const match = text.match(educationRegex);

//   if (match) {
//     let educationDetails = match[0].trim(); // Extract the full match
//     // Remove the keyword explicitly
//     educationDetails = educationDetails.replace(new RegExp(`^(${keywordsPattern})`, "i"), "").trim();
//     educationDetails = educationDetails.replace(/\s{2,}/g, " "); // Normalize excessive whitespace
//     educationDetails = educationDetails.replace(/;+/g, ";"); // Normalize semicolons
//     return educationDetails;
//   }

//   return "No detailed education information found";
// }

// Function for extracting Education details
// function extractEducation(text) {
//   console.log("text::",text);
//   const educationKeywords = ["Education", "EDUCATION", "Academic Background", "Degrees", "Qualifications"];
//   const ignorableWords = ["Experience", "Work Experience", "Skills", "Projects", "PROFESSIONAL SUMMARY", "Certification", "Certifications"];

//   // Create regex patterns from keywords and ignorable words
//   const keywordsPattern = educationKeywords.join("|");
//   const ignorableWordsPattern = ignorableWords.join("|");

//   // Regex to extract the Education section (exclude the keyword from the output)
//   const educationRegex = new RegExp(
//     `(?:${keywordsPattern})[\\s\\S]*?(?=\\n(?:${ignorableWordsPattern}|$))`,
//     "i"
//   );

//   const match = text.match(educationRegex);
//   console.log("match::::",match);
//   if (match) {
//     let educationDetails = match[0].trim(); // Extract the full match
//     // Remove the keyword explicitly
//     educationDetails = educationDetails.replace(new RegExp(`^(${keywordsPattern})`, "i"), "").trim();
//     educationDetails = educationDetails.replace(/\s{2,}/g, " "); // Normalize excessive whitespace
//     educationDetails = educationDetails.replace(/;+/g, ";"); // Normalize semicolons
//     return educationDetails;
//   }

//   return "No detailed education information found";
// }


// // Function for extracting Education details
// function fetchEducationFromParagraph(educationTrimmedText) {


//   // const regexDegree = /(the\s+)?([A-Za-z0-9\s\.,-\\+\\(\\)]+(?:)[A-Za-z\s\-\,\.\[\]\(\)\%]*)(from)/i;
//   const regexDegree = /(the\s+)?(.*?)(?=from)/i;


//   const regexCollege = /(?<=from\s)(.*?)((?=\d{4})|((\s*\w{5,})\s*[)]?\s*(?=[.!?]))|((\s*\w{5,})\s*[)]?\s*(?=[,]))|(?=($))|(?=[\n])|(?=\s*with))/i;
//   // const regexCollege = /(?<=from\s)(.*?)(\s*[(]?\s*((\s*(?=\d{4}))|((\s*\w{5,})\s*[)]?\s*(?=[.!?]))|((\s*\w{5,})\s*[)]?\s*(?=[,])))|(?=($)))/i; 


//   const regexYear = /((\s*\d{4}\s*[-]?\s*\d{4}\s*)|(\s*[(]?\s*\d{4}\s*[-]?\s*\d{4}\s*[)]?\s*)|(\s*\d{4}\s*))(?=\s*|[\n.!?,])/i;


//   const regexMark = /((?<![+\(\[])((100)|(\d{1,2}))(?![+\)\]]))([.][0-9]{1,})?\s*[%](?=\s*|[\n.!?,])/i;

//   let Degree = "";
//   let College = "";
//   let Year = "";
//   let Mark = "";
//   let Index = -1, IndexD = 0, IndexC = 0, IndexY = 0, IndexM = 0, IndexA = [];
//   let details = [];
//   let words = [];
//   var IgnoreWordDegree = ["i", "am", , "have", "had", "doing", "did", "done", "does", "completed", "complete", "completes", "currently"
//     , "passed", "pass", "passes"]
//   var IgnoreWordCollege = ["in", "on", "year", "with"];
//   let num = 0;
//   var _item = "";
//   while (educationTrimmedText.length > 0) {
//     num = num + 1;
//     Degree = ""; College = ""; Year = ""; Mark = "";
//     // console.log(num);  console.log(educationTrimmedText);
//     const matchDegree = educationTrimmedText.match(regexDegree);
//     if (matchDegree) {
//       // Capture the group containing the university name
//       words = matchDegree[0].trim().split(' ');
//       if (matchDegree.index + matchDegree[0].length >= Index) { Index = matchDegree.index + matchDegree[0].length; }
//       IndexD = matchDegree.index + matchDegree[0].length;
//       //  console.log('Degree '+Index);
//       Degree = words.map(function (item, index, array) {


//         _item = item.trim().toLowerCase();
//         if (!IgnoreWordDegree.includes(_item) && index < words.length) {
//           if (((Number.isNaN(Number(_item)) && !_item.includes('%'))
//             || (_item === "10") || (_item === "12"))) {

//             return item;


//           }

//         }

//       });

//       Degree = Degree.filter(item => item !== undefined).join(" ");

//     }

//     const matchCollege = educationTrimmedText.match(regexCollege);
//     //console.log(matchCollege);
//     if (matchCollege) {
//       // Capture the group containing the university name
//       if (matchCollege.index + matchCollege[0].length >= Index) { Index = matchCollege.index + matchCollege[0].length; }
//       IndexC = matchCollege.index + matchCollege[0].length;
//       // console.log('College '+Index);
//       words = matchCollege[0].trim().split(' ');
//       College = words.map(function (item, index, array) {

//         _item = item.trim().toLowerCase().replace("(", "").replace(")", "").replace("-", "").replace(":", "").replace("%", "");
//         if (!IgnoreWordCollege.includes(_item.trim().toLowerCase()) && index < words.length) {
//           if (Number.isNaN(Number(_item)) && !_item.includes('%')) {

//             return item;
//           }


//         }

//       });

//       College = College.filter(item => item !== undefined).join(" ");






//     }
//     const matchYear = educationTrimmedText.match(regexYear);
//     // console.log('Year1 '+matchYear);
//     if (matchYear) {
//       // Capture the group containing the university name

//       const delimiters = ["(", ")", "-", "\\s"];
//       const regex = new RegExp(`[${delimiters.join('')}]`);

//       words = matchYear[0].trim().split(regex);

//       words = words.filter(item => item !== '');
//       //console.log('Year0 '+matchYear.index +' - ' +Index);
//       if (matchYear.index + matchYear[0].length >= Index) {
//         Index = matchYear.index + matchYear[0].length;
//         //  console.log('Year1 '+Index);
//       }
//       IndexY = matchYear.index + matchYear[0].length;
//       //  console.log('Year '+Index);
//       Year = words.map(function (item, index, array) {

//         if ((!isNaN(Number(item)))) {

//           return item;


//         }

//       });

//       if (Year.length > 1) {
//         Year = Year[Year.length - 1];

//       } else { Year = Year[0]; }

//     }
//     const matchMark = educationTrimmedText.match(regexMark);

//     if (matchMark) {
//       Mark = matchMark[0].trim();  // Capture the group containing the university name

//       if (matchMark.index + matchMark[0].length >= Index) { Index = matchMark.index + matchMark[0].length; }
//       IndexM = matchMark.index + matchMark[0].length;
//       //  console.log('Mark '+Index);
//     }
//     if (Degree != '' || College != '' || Year != '' || Mark != '') {

//       if (IndexY > IndexC && IndexY - IndexC > 30) {
//         if (IndexM >= IndexY) {
//           Mark = "";
//           Year = "";
//           Index = IndexC;

//         }
//         if (IndexM > IndexC && IndexY > IndexM) {
//           Year = "";
//           Index = IndexM;
//           if (IndexM - IndexC > 25) {
//             Index = IndexC;
//             Mark = "";
//           }
//         }

//       }
//       if (IndexM > IndexC && IndexM - IndexC > 25) {

//         if (IndexY >= IndexM) {
//           Mark = "";
//           Year = "";
//           Index = IndexC;
//         }
//         if (IndexY > IndexC && IndexY < IndexM) {
//           Mark = "";
//           Index = IndexY;
//           if (IndexY - IndexC > 30) {
//             Year = "";
//             Index = IndexC;
//           }

//         }

//       }


//       let detail = {};
//       detail.degree = Degree;
//       detail.college = College;
//       detail.year = Year;
//       detail.mark = Mark;
//       details.push(detail);


//     }



//     if (Index > 0) { // console.log(' num '+num +' index '+Index);
//       educationTrimmedText = educationTrimmedText.substring(Index, educationTrimmedText.length)
//       Index = -1, IndexD = 0, IndexC = 0, IndexY = 0, IndexM = 0;


//     }
//     if (Degree == '' && College == '' && Year == '' && Mark == '') { educationTrimmedText = ""; }

//   }

//   return details;

// };


  // starts year
// starts year

  // starts year
  function get_Year(educationTrimmedText,MaxNotFromIndex)
  {
   
  const regexYear = /((\s*\d{4}\s*[-–]?\s*\d{4}\s*)|(\s*[(]?\s*\d{4}\s*[-–]?\s*\d{4}\s*[)]?\s*)|(\s*\d{2,}\s*[-–]\s*\d{2,}\s*)|(\s*[(]?\s*\d{2,}\s*[-–]\s*\d{2,}\s*[)]?\s*)|([A-Za-z]{3,}\s*['`]?\d{2}\s*[-]?\s* [A-Za-z]{3,}\s*['`]?\d{2})|(\s*\d{4}\s*))(?=\s*|[\n.!?,])/i;
  const matchYear = educationTrimmedText.substring(0,MaxNotFromIndex).match(regexYear);
   var year="",sentence=educationTrimmedText;
   
   if (matchYear) {
    
  const delimiters = ["(",")","–", "-","\\s"];
  const regex = new RegExp(`[${delimiters.join('')}]`);
  words = matchYear[0].trim().split(/[\(\)\s\-\–\'\`]/);

      words = words.filter(item => item!=='');
     
     
       const replacement="#".repeat(matchYear[0].length);;
const startIdx=matchYear.index;
const endIdx=matchYear.index+matchYear[0].length;
// Extract the substring that is in the specified range
const before = educationTrimmedText.slice(0, startIdx);
const middle =replacement;
const after = educationTrimmedText.slice(endIdx);
sentence=before + middle + after;
    const Year=  words.filter(item => item !== '').map(function(item,index,array){
     
      if ((!isNaN(Number(item))))
          {
         
              return item;
              
          
          }
       
         });
     
     if(Year.length>1)
    { 
      year=Year[Year.length-1];
     
    }else{ year=Year[0];}
    
   }   return {"educationTrimmedText":sentence,"year":year};
  }
  // ends year
 // starts mark
  function get_Mark(educationTrimmedText,MaxNotFromIndex){
  
  var regexMark =/\b((100)|[4-9]|[1-9][0-9])([.][0-9]{1,})?\s*[%]?\b/i;
   var matchMark = educationTrimmedText.substring(0,MaxNotFromIndex).match(regexMark);
   var mark="",sentence=educationTrimmedText;
   if (matchMark) { 
     Mark= matchMark[0].trim();  // Capture the group containing the university name
       
        const replacement="@".repeat(matchMark[0].length);
        const startIdx=matchMark.index;
        const endIdx=matchMark.index+matchMark[0].length;
        // Extract the substring that is in the specified range
        const before = educationTrimmedText.slice(0, startIdx);
        const middle =replacement;
        const after = educationTrimmedText.slice(endIdx);
        sentence=before + middle + after;
        mark= Mark;
   }   return {"educationTrimmedText":sentence,"mark":mark};
   }      
   // end mark

function maskDegree(educationTrimmedText,index,item){
   
  const replacement="*".repeat(item.length);
        const startIdx=index-item.length;
        const endIdx=startIdx+item.length;
        // Extract the substring that is in the specified range
        const before = educationTrimmedText.slice(0, startIdx);
        const middle =replacement;// 
        const after = educationTrimmedText.slice(endIdx)
       
        return before + middle + after;
  
}

function fetchEducationFromParagraph(educationTrimmedText){
   	const regexDegreeIfNotFromEndLine         =  /(the\s+)?(.*?)($)/i; 
   const regexCollegeName=  /^[a-zA-Z0-9.,\-\)\(&\]\[\]]{1,}$/i;
  
  let num1=1;var getYear="";var getMark="";var IndexForYearMark=0;
   let Degree="";
   let College="";
   let Year="";
   let Mark="";
   let Index=-1;
   let details=[],CheckDuplicate=[];
   let words=[];
   var IgnoreWordDegree=["i","am","do","have","had","doing","did","done","does","completed","complete","completes","currently","out" ,"passed","No","Attempts","Attempt","mark","marks","pass","passes","Passing","Month","&","Remarks","Remark","(",")","-",":","–" ,"SNO","Class","Sem","Semester","Semesters","Year","Percentage","%",
   "position","division","distinction","first","second","third","1st","2nd","3rd","from","qualification","qualifications"];
   var   IgnoreWordCollege=["in","on","year","with","st","nd","rd","division","first","second","third","from","qualification","qualifications","name","place","jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec","january","february","march","april","may","june","july","august","september","october","november","december"];

  var ListOfDegrees=["10","X","Xth","10th","(10+2)","10+2","12","12th","XII","XIIth","high","higher","senior","secondary","school","tenth","ten","twelve","twelvfth","twelveth","twelvth","intermediate","inter","BTech","BE","b","tech","Bachelor", "of" ,"Information","Technology","Engineering","BCA","Computer","Application","Applications","Diploma","in", "DCA","m","tech","MTech","MS","Master","Science","MBA", "Business","Administration","BBA","MCA","PhD","BSc","IT","Animation","Multimedia","Certification","Networking","CCNA","Data","and","Machine","Learning","Certifications","Cybersecurity","Cyber","security","Project", "Management","PMP","full","time","correspondence","Electronics", "Communication", "Engineer","Administrator","Finance","Marketing","ECE"];
  let DegreeNameContains = ["in", "of" ,"school"];
  let CollegeNameContains = ["in", "of" ,"and","inter"];
  
   var Ischeck=true;
var DegreeName=[];var CollegeName=[];var CollegeNameDetails=[];
var WhatTypeData="U";//unknown
 
  let num=0;
  var _item="";
  
   if(educationTrimmedText.length>0)
   {
      
      educationTrimmedText=educationTrimmedText.trim().replace(//g, '').replace(/\t/g, ' ').replace(/\s*\/\s*/g, '/');//.replace(/\n/g, ' ');
   num1+1;
    Degree="";College="";Year="";Mark="";  DegreeName=[]; CollegeName=[];
           WhatTypeData="N";//contains no "from" word
          educationTrimmedText=educationTrimmedText.trim().replace(/\n/g, ' ');
    
         matchDegree= educationTrimmedText.match(regexDegreeIfNotFromEndLine); 
	  
         
   if (matchDegree) {
   
       words = matchDegree[0].trim().split(' ');
     Index=matchDegree.index+matchDegree[0].length; 
     if(WhatTypeData=="N")//contains "nofrom" word
           {
               CheckDuplicate=[];
              
     //Degree=  words.filter(item => item !== '').map(function(item,index,array){
        Degree=  words.map(function(item,index,array){
         
         if(index==0){
         IndexForYearMark=IndexForYearMark+item.length;}else{
             IndexForYearMark=IndexForYearMark+item.length+1;
         }
       
        _item=item.trim().toLowerCase().replace(/\%/g,"").replace(/\./g,"").replace(/\,/g,"").replace(/\:/g,"").replace(/\-/g,"");
            
         if(!IgnoreWordDegree.map(item => item.toLowerCase()).includes(_item)  && index<words.length)
         {
         if((_item==="10") || (_item==="12"))
         { 
				 if(!DegreeName.map(item => item.toLowerCase()).includes(item) && DegreeName.length==0)
				 {
				
					 
							   
							    
									DegreeName.push(item);
					educationTrimmedText=		maskDegree(educationTrimmedText,IndexForYearMark,item);		
									if(!CheckDuplicate.includes('D'))
	{
	 CheckDuplicate.push('D');
	}
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='D'   && DegreeName.length>0 )
		{   detail={};
		var itemd=DegreeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; 
			DegreeName=[];DegreeName.push(itemd);
			CheckDuplicate=[];
			CheckDuplicate.push('D');
		}	
							   
				 }
         } 
         //Nan starts
          if(Number.isNaN(Number(_item)) && !_item.includes('%')
          && !_item.includes('/')) 
          {  
              if(ListOfDegrees.map(item => item.toLowerCase()).includes(_item) 
                            )
			  {  
			    Ischeck=true;// check whether collegeorDegree
	 
		   if(    CollegeName && CollegeName.length > 0){ 
			      if(( CollegeNameContains.includes(CollegeName[CollegeName.length-1].trim().toLowerCase() ) 
            || (CheckDuplicate[CheckDuplicate.length-1]=="C" && CollegeNameContains.includes(_item.trim().toLowerCase() ) )
          ) && _item.match(regexCollegeName)!=null
          && !IgnoreWordCollege.map(item => item.toLowerCase()).includes(_item.trim().toLowerCase())
        )
			    {   
			        Ischeck=false;
			     
			     	CollegeName.push(item);
						if(!CheckDuplicate.includes('C'))
	{
	 CheckDuplicate.push('C');
	} 
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='C'   && DegreeName.length>0 )
		{
		   
		    detail={};var itemc=CollegeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[];CollegeName.push(itemc); 
			DegreeName=[];
			CheckDuplicate=[];
			CheckDuplicate.push('C');
		}   
			        
			        
			    }}
			 	 /*logic */
			  if(Ischeck)
			  {
			  
			  
			  
              
                  if(!DegreeName.map(item => item.toLowerCase()).includes(item))
				  {
                    if (DegreeNameContains.includes(_item) ) 
							  {
									// check whether collegeorDegree
 
		   if(  DegreeName && DegreeName.length > 0)
		   { 
			 
			    if( DegreeNameContains.includes(DegreeName[DegreeName.length-1].trim().toLowerCase() ) 
				|| (CheckDuplicate[CheckDuplicate.length-1]=="D" && DegreeNameContains.includes(_item.trim().toLowerCase() ) ))
			    {    
			      
			       	DegreeName.push(item);
			       	educationTrimmedText=		maskDegree(educationTrimmedText,IndexForYearMark,item);
						if(!CheckDuplicate.includes('D'))
						{
						 CheckDuplicate.push('D');
						} 
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='D'   && DegreeName.length>0 )
		{
		   detail={};var itemd=DegreeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[];
			DegreeName=[];DegreeName.push(itemd); 
			CheckDuplicate=[];
			CheckDuplicate.push('D');
		}   
		   }
				}
			 	 /*logic */
									  if(_item=="school")
									  { 
										  if (DegreeName.map(item=> item.trim().toLowerCase()).includes("high")   && DegreeName.length>0)
										  {
				DegreeName.push(item);
				educationTrimmedText=		maskDegree(educationTrimmedText,IndexForYearMark,item);
				if(!CheckDuplicate.includes('D'))
	{
	 CheckDuplicate.push('D');
	}
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='D'  && DegreeName.length>0 )
		{ detail={};var itemd=DegreeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; 
			DegreeName=[];DegreeName.push(itemd);

			CheckDuplicate=[];
			CheckDuplicate.push('D');
		}								   
						 			  
										  }
										  else
										  {
											   if(CollegeName.length>0 
                          && !IgnoreWordCollege.map(item => item.toLowerCase()).includes(item.trim().toLowerCase())
                           && item.match(regexCollegeName)!=null
										   )
											{
				CollegeName.push(item);
						if(!CheckDuplicate.includes('C'))
	{
	 CheckDuplicate.push('C');
	} 
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='C'   && DegreeName.length>0 )
		{ detail={};var itemc=CollegeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[];CollegeName.push(itemc); 
			DegreeName=[];
			CheckDuplicate=[];
			CheckDuplicate.push('C');
		}
		
			 	 
											  }
										  }
									  }
									  
							   }
							   else
							   {
					 
			DegreeName.push(item);
			educationTrimmedText=		maskDegree(educationTrimmedText,IndexForYearMark,item);
			if 	(!CheckDuplicate.includes('D'))
	{
	 CheckDuplicate.push('D');
	}
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='D'  && DegreeName.length>0 )
		{  
		    
		    detail={};var itemd=DegreeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; 
			DegreeName=[];DegreeName.push(itemd);
			CheckDuplicate=[];
			CheckDuplicate.push('D');
		}	
			
									
				 
							   }
                  }
             } 
              }
               else{  
              const regexParenthesis = /\([a-z.\s]+\)?|\(?[a-z.\s]+\)|\([a-z.\s]+\)/g;
              const wordsWithParenthesis = _item.match(regexParenthesis);
              if(wordsWithParenthesis)
              { 
                const  wordsParenthesis = _item.trim().split(/[\(\)]/);
                var Isexists=false;
         wordsParenthesis.map(function(itemP,index,array){
            
            
              if(ListOfDegrees.map(item => item.toLowerCase()).includes(itemP)  ){
                  Isexists=true;
        
             
              }
                  });
                  if(Isexists){
                       if(!DegreeName.map(item => item.toLowerCase()).includes(item) )
					   {
					     
          DegreeName.push(item); 
          educationTrimmedText=		maskDegree(educationTrimmedText,IndexForYearMark,item);
	if(!CheckDuplicate.includes('D'))
	{
	 CheckDuplicate.push('D');
	}
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='D'  && DegreeName.length>0 )
		{ detail={};var itemd=DegreeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; 
			DegreeName=[];DegreeName.push(itemd);
			CheckDuplicate=[];
			CheckDuplicate.push('D');
		}
		
                       }
                  }else{
                        if(!CollegeName.map(item => item.toLowerCase()).includes(item.toLowerCase())
                       &&
                      Number.isNaN(Number(item.replace(/\(/g,'').replace(/\)/g,''))) && !item.includes('%')
           && !item.includes('/')
                   && !IgnoreWordCollege.map(item => item.toLowerCase()).includes(item.trim().toLowerCase())      
                       && item.match(regexCollegeName)!=null){
         CollegeName.push(item);
         if(!CheckDuplicate.includes('C'))
	{
	 CheckDuplicate.push('C');
	} 
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='C'   && DegreeName.length>0 )
		{ detail={};var itemc=CollegeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; CollegeName.push(itemc);
			DegreeName=[];
			CheckDuplicate=[];
			CheckDuplicate.push('C');
		}                  
                     
                   
                       }
                  }
                  }
                  
              else{   
                  if(!CollegeName.map(item => item.toLowerCase()).includes(item.toLowerCase())
                  &&
                      Number.isNaN(Number(
                     item.replace(/\(/g,'').replace(/\)/g,''))) && !item.includes('%')
           && !item.includes('/')
           
            && !IgnoreWordCollege.map(item => item.toLowerCase()).includes(item.trim().toLowerCase()) 
             && item.match(regexCollegeName)!=null){
                      
  CollegeName.push(item);
  	if(!CheckDuplicate.includes('C'))
	{
	 CheckDuplicate.push('C');
	} 
 	if(CheckDuplicate.length==2 && CheckDuplicate[1]!='C'   && DegreeName.length>0 )
		{ detail={};var itemc=CollegeName.pop();
		detail.num=num1; num1=num1+1;
		    detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
			detail.college=CollegeName.filter(item => item !== undefined).join(" ");
		 
      getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText; 
			details.push(detail);
			CollegeName=[]; CollegeName.push(itemc);
			DegreeName=[];
			CheckDuplicate=[];
			CheckDuplicate.push('C');
		}	                    
                
           
               	 	
              }
              }
             
             
              
          }//Nan ends
         
          }
         
         }//if end
       
         }); 
     
 //endd
  if(DegreeName.length>0){
  let detail={};
  
   detail.num=num1; num1=num1+1;
   detail.degree=DegreeName.filter(item => item !== undefined).join(" ");
   detail.college=CollegeName.filter(item => item !== undefined).join(" ");
   
  getYear=get_Year(educationTrimmedText,IndexForYearMark);
      detail.year=getYear.year;educationTrimmedText=getYear.educationTrimmedText;
      getMark=get_Mark(educationTrimmedText,IndexForYearMark);
      detail.mark=getMark.mark;educationTrimmedText=getMark.educationTrimmedText
    // detail.year=get_Year(educationTrimmedText,IndexForYearMark).year;
   // detail.mark=get_Mark(educationTrimmedText,IndexForYearMark).mark;
    details.push(detail);
  }
       }
   }
       return details;
     }
    
 };
 
 

   

let educationTrimmedText = "";
function extractEducation(text) {

  // Split the parsed text into lines
  const lines = text.split('\n');

  // Flag to track if we are inside the education section
  let inEducationSection = false;
  let educationSection = [];

  for (let line of lines) {
    const trimmedLine = line.trim();

    // Check if the line starts an education section
    if (!inEducationSection && educationKeywords.some(keyword => trimmedLine.toLowerCase().includes(keyword.toLowerCase()))) {
      inEducationSection = true;
      continue; // Skip the line containing the keyword
    }

    // Check if the line starts an ignorable section
    if (inEducationSection && ignorableWordsForEducation.some(keyword => trimmedLine.toLowerCase().includes(keyword.toLowerCase()))) {
      break; // Exit the education section
    }

    // Add the line to the education section if inside it
    if (inEducationSection) {
      educationSection.push(trimmedLine);
      // const cleanedline = trimmedLine.replace(/[]/g, "").trim();
      // educationSection.push(cleanedline);
    }
  }
  if (educationSection.length > 0) {
    // Join and return the education section as a single string

    educationTrimmedText = educationSection.join('\n').trim();
    //  console.log("educationTrimmedText:::::\n",educationTrimmedText);
    const finalEducation = fetchEducationFromParagraph(educationTrimmedText);
    return finalEducation;
  }
  return "No detailed education information found";
}

// helper Function for extractTechnicalSkills
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escapes special regex characters
}

//Function for Technical Skills Extraction ------------
function extractTechnicalSkills(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  // Escape special characters in predefined skills
  const escapedSkills = predefinedSkills.map(escapeRegExp);

  const keywordRegex = new RegExp(
    `(${technicalSkillsKeywords.join("|")})\\s*[:\\-]?\\s*([\\w\\W]+?)(?=\\n\\n|$)`,
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

//Function for Job Title Extraction ------------
function extractJobTitle(text) {

  // Create regex for job keywords
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


//Function for Experience Extraction ------------
function extractExperience(text) {

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

//Function for Company Details Extraction ------------
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

// //Function for Certifications Extraction ------------
// function extractCertifications(text) {
//   const certificationKeywords = ["Certification", "Certifications", "Courses", "CERTIFICATE"];
//   const ignorableWords = ["Education", "Skills", "Projects", "Work Experience", "Experience"];

//   const certificationKeywordsPattern = certificationKeywords.join("|");
//   const ignorableWordsPattern = ignorableWords.join("|");

//   // Regex to extract the Certifications section
//   const certificationRegex = new RegExp(
//     `(?:${certificationKeywordsPattern})[\\s\\S]*?(?=\\n(?:${ignorableWordsPattern}|$))`,
//     "i"
//   );

//   const certificationMatch = text.match(certificationRegex);

//   if (certificationMatch) {
//     // Use the full matched string (certificationMatch[0]) and remove the header
//     const certifications = certificationMatch[0]
//       .replace(new RegExp(`^(${certificationKeywordsPattern})`, "i"), "") // Remove the header
//       .split(/,\s*/) // Split by commas
//       .map((cert) => cert.trim()); // Trim each certification

//     return certifications.length ? certifications : ["Not found"];
//   }

//   return ["Not found"];
// }

//Function for Certifications Extraction ------------
// function extractCertifications(text) {

//   // Normalize text to improve matching
//   const normalizedText = text.replace(/\s+/g, ' ').trim();

//   // Build a regex to match sections starting with certification keywords
//   const certificationRegex = new RegExp(
//     `(?:${certificationKeywords.join('|')}):?\\s*([\\s\\S]+?)(?:\\n\\s*\\n|(?:Education|HOBBIES|Projects|Work Experience|Technical Expertise|PROFESSIONAL SUMMARY|PROFESSIONAL EXPERIENCE|PERSONAL DETAILS|Skills|Achievements|Personal|Areas of Training|Summary)[^\\n]*)`,
//     'i'
//   );

//   const match = normalizedText.match(certificationRegex);

//   if (match && match[1]) {
//     // Extract the certifications text
//     const certificationsText = match[1].trim();

//     // Split the certifications text into lines
//     const certificationsArray = certificationsText
//       .split(/\n|[-]/) // Split by newlines or bullets
//       .map(line => line.trim()) // Trim each line
//       .filter(line => line.length > 0); // Filter out empty lines

//     return certificationsArray;
//   }
//   return ["Not found"];
// }

function extractCertifications(text) {
  // Normalize text to unify spaces and handle irregular breaks
  const normalizedText = text.replace(/\s+/g, " ").trim();

  // Define certification keywords
  const certificationKeywords = ["Certification", "Certifications", "Cert."];

  // Build a regex to match sections starting with certification keywords
  const certificationRegex = new RegExp(
    `(?:${certificationKeywords.join(
      "|"
    )}):?\\s*([\\s\\S]+?)(?:\\n\\s*\\n|(?:Education|Skills|Achievements|Personal|Areas of Training|Summary)[^\\n]*)`,
    "i"
  );

  const match = normalizedText.match(certificationRegex);

  if (match && match[1]) {
    // Extract the certifications text
    const certificationsText = match[1].trim();

    // Split into lines or items, ensuring logical breaks are respected
    const certificationsArray = certificationsText
      .split(/\n|[]/) // Split on newlines or bullet characters
      .map((line) => line.trim()) // Trim each line
      .filter((line) => line.length > 0); // Filter out empty lines

    return certificationsArray;
  }

  return ["Not found"];
}

// //Function for Languages Extraction ------------ just in case it this one not the other one
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


//   // Filter the extracted languages against the languagesArray
//   const validLanguages = languages
//     .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()) // Normalize case
//     .filter(lang => languagesArray.includes(lang));

//   return validLanguages.length > 0 ? validLanguages : ["Not found"];

// }

//Function for Languages Extraction ------------
function extractLanguages(text) {

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
  // const parsedText = text.trim();
  const parsedText = text.replace(/[]/g, "").trim();
  
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
  return { name, email, jobTitle, phone, dob, gender, maritalStatus, education, experience, technicalSkills, companyDetails, certifications, languages, text: parsedText, educationTrimmedText };
}

app.post("/api/upload", upload.single("resume"), async (req, res) => {
  educationTrimmedText = "";
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const ext = path.extname(file.originalname);

  try {
    let parsedText = "";

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      parsedText = data.text;
    } else if (ext === ".docx") {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      parsedText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

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
