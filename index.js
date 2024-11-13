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

  for (let line of lines) {
    // Convert the line to lowercase for case-insensitive matching
    const lowerLine = line.toLowerCase();

    for (let keyword of nameKeywords) {
      // Check if the line contains the keyword and does not contain any of the prevWords
      if (line.includes(keyword) && !prevWords.some(prev => lowerLine.includes(prev))) {
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
    "Specialist", "Coordinator", "Operator", "Support", "Executive", "HR", "Sales", 
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
    // Skip lines containing any of the skip keywords
    if (skipsKeywords.some(keyword => lines[i].toUpperCase().includes(keyword.toUpperCase()))) {
      continue;
    }
    
    // console.log( "lines: ",lines);
    const words = lines[i].trim().split(/\s+/);

    // Filter capitalized words
    const capitalizedWords = words.filter((word) =>
      /^[A-Z][a-zA-Z]+$/.test(word) || /^[A-Z]+$/.test(word)
      // /^[A-Z][a-zA-Z]+$/.test(word)
    );
    // console.log("capitalizedWords: ",capitalizedWords, "Words: ",words)
    if (
      capitalizedWords.length === 2 ||
      capitalizedWords.length === 3 ||
      capitalizedWords.length === 4
    ) {
      const potentialName = capitalizedWords.join(" ");

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
  const emailKeywords = [ "E-mail-", "E-mail:", "Email-", "Email:", "Email", "email", "E-mail", "Mail", "mail"];
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
  const ignorableWords = ["Experience", "Work Experience", "Skills", "Projects","PROFESSIONAL SUMMARY","Certification","Certifications"];

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

function extractTechnicalSkills(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  const keywords = [
    "Technical Skills",
    "Skills",
    "Core Skills",
    "Relevant Skills",
    "Tech Stack",
   
  ];

  const predefinedSkills = [
      // Programming Languages
      "C++", "Java", "JavaScript", "Python", "HTML", "HTML5", "CSS", "C",
      "TypeScript", "PHP", "Ruby", "Go", "Swift", "Kotlin", "Rust", "Scala",
      "VB.NET", "C#", "F#", "Perl", "R", "Matlab","Data Structures And Algorithms",
        // Frontend Development
    "React JS","React", "Angular", "Vue.js", "Svelte", "jQuery", "jQuery","Bootstrap",
    "TailwindCSS", "Material-UI", "Ant Design", "Sass", "Less",

    // Backend Development
    "Node.js", "Django", "Flask", "Express.js", "Ruby on Rails",
    "Spring", "Spring Boot", "Spring MVC", "Hibernate", "Laravel",
    "CodeIgniter", "Symfony", "ASP.NET Core", "Koa.js", "FastAPI",

    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Firebase", "SQLite","SQL",
    "Redis", "Cassandra", "Elasticsearch", "MariaDB", "DynamoDB", "CockroachDB",

    // Cloud and DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "Jenkins", "Ansible", "Puppet", "Chef", "CloudFormation", "Heroku",
    "Netlify", "Vercel", "CircleCI", "GitHub Actions",

    // Tools and Version Control
    "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Eclipse",
    "IntelliJ IDEA", "PyCharm", "Xcode", "NetBeans", "Postman", "Fiddler",
    "Wireshark", "JIRA", "Confluence", "Maven", "Gradle", "NPM", "Yarn",

    // Network Engineering
    "Cisco", "Juniper", "BGP", "OSPF", "IPSec", "VPN", "Firewall", "Load Balancer",
    "Network Security", "F5 BIG-IP", "NGINX", "HAProxy", "TCP/IP", "Ethernet", "DNS",
    "DHCP", "LAN", "WAN", "SD-WAN", "Packet Tracing", "Subnetting","SNMP","VLAN", "VTP", "HSRP", "VRRP", "STP",
    "MPLS", "MPLS L2 VPN", "MPLS L3 VPN","Routing", "Switching", "Configuration", "Protocols",
     "BGP", "OSPF", "EIGRP","Access lists","Extended IP access lists","Standard IP access lists", "BGP Configuration"," VPN Configuration","OSPF Configuration",
     "STP Configuration","NAT Configuration","Troubleshooting",

    // Security Specialist
    "SSL/TLS", "WAF", "DDoS Mitigation", "SOC Operations", "SIEM",
    "F5 BIG-IP LTM", "F5 ASM", "F5 APM", "Zero Trust", "IAM", "Penetration Testing",
    "Vulnerability Assessment", "IDS/IPS", "Threat Hunting", "Endpoint Security",
    "OWASP", "SANS", "CyberArk", "Fortinet", "Palo Alto Networks", "Splunk",

    // Solution Architect
    "Microservices", "Event-Driven Architecture", "Monolithic Architecture",
    "SOA", "API Gateway", "Load Balancing", "High Availability", "Disaster Recovery",
    "Scalability", "Elasticity", "CI/CD Pipelines", "Serverless",
    "Cost Optimization", "Cloud Migration", "System Design", "Business Continuity",

    // Other Relevant Technologies
    "GraphQL", "REST APIs", "WebSockets", "OAuth", "JWT", "AJAX",
    "WebRTC", "OpenShift", "Kong API Gateway", "Istio", "Apache Kafka",
    "RabbitMQ", "ActiveMQ", "Elastic Stack", "Prometheus", "Grafana",
    "Logstash", "Kibana", "New Relic", "Datadog", "PagerDuty"
  ];

  const predefinedSkillsLower = predefinedSkills.map(skill => skill.toLowerCase());

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

  if (!matches || matches.length === 0) {
    // console.log("No matches found in the text.");
    return { foundKeywords: [], extractedSkills: [] };
  }

  const foundKeywords = matches.map(match => match.keyword);
  // console.log("Found Keywords:", foundKeywords);

  const extractedSkills = matches
    .flatMap(match => {
      if (match && match.content) {
        return match.content.split(/[\n,]/); // Split skills by newline or comma
      }
      console.warn("Skipping invalid match:", match);
      return [];
    })
    .map(skill => skill.trim().toLowerCase())
    .filter(skill => predefinedSkillsLower.includes(skill));

  // Ensure unique skills (deduplicate the list)
  const uniqueSkills = Array.from(new Set(extractedSkills)).map(skill =>
    predefinedSkills.find(predefined => predefined.toLowerCase() === skill)
  );

  // console.log("Extracted Skills:", uniqueSkills);

  return { foundKeywords, extractedSkills: uniqueSkills };
}

function extractJobTitle(text) {
  const jobKeywords = ["Job Title", "Position", "Role", "Designation"];
  const jobRegex = new RegExp(
    `(?:${jobKeywords.join("|")})\\s*[-:–]?\\s*([\\w\\s]+)`,
    "i"
  );

  const jobMatch = text.match(jobRegex);
  return jobMatch ? jobMatch[1].trim() : "Not found";
}
function extractExperience(text) {
  const experienceRegex = /(Experience|Professional Experience|Work History)([\s\S]*?)(Education|Skills|Projects|Certifications|$)/i;
  const match = text.match(experienceRegex);
  
  if (match) {
    let experienceDetails = match[2].trim();  // Extract the experience content
    // Clean up the content:
    experienceDetails = experienceDetails.replace(/\s{2,}/g, " ");  // Replace multiple spaces with a single space
    experienceDetails = experienceDetails.replace(/;+/g, ";");  // Replace multiple semicolons with a single semicolon
    experienceDetails = experienceDetails.replace(/(\r?\n){2,}/g, "\n");  // Replace multiple line breaks with a single one
    experienceDetails = experienceDetails.replace(/^\n+/g, "").replace(/\n+$/g, "");  // Remove leading/trailing line breaks
    
    return experienceDetails;
  }
  
  return "No detailed experience information found";
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

function extractDetails(text) {
  const name = extractNameFromResume(text);
  const dob = extractDOB(text);
  const phone = extractPhoneFromResume(text);
  const email = extractEmailFromResume(text);
  const gender = text.match(/Gender\s*:\s*(\w+)/)?.[1]?.trim() || "Not found";
  const maritalStatus = extractMaritalStatus(text);
  const technicalSkills = extractTechnicalSkills(text);
 const education = extractEducation(text)
    const jobTitle = extractJobTitle(text);
  const experience = extractExperience(text);
  // console.log(experience,'eeeeeeeeeeeeeeeee')
  const companyDetails = extractCompanyDetails(text);
  const certifications = extractCertifications(text);
  return { name, dob, phone, gender, maritalStatus, email, education,technicalSkills, jobTitle,experience,companyDetails,certifications };
}

app.post("/api/upload", upload.single("resume"), async (req, res) => {
  const file = req.file;
  // console.log("Uploaded File:", req.file);

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
