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
  const lines = text.split("\n");

  for (let line of lines) {
    for (let keyword of nameKeywords) {
      if (line.includes(keyword)) {
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
    const words = lines[i].trim().split(/\s+/);

    // Filter capitalized words
    const capitalizedWords = words.filter((word) =>
      /^[A-Z][a-zA-Z]+$/.test(word)
    );

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
// Function for extracting Date of Birth (DOB)
function extractDOB(text) {
  const dobRegex = /(?:D\.?O\.?B\.?\s*[-–—]?\s*)(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;

  const dobMatch = text.match(dobRegex);
  return dobMatch ? dobMatch[1].trim() : "Not found";
}

//Function for extracting Email -------
function extractEmailFromResume(text) {
  const emailKeywords = ["Email", "email", "E-mail", "Mail", "mail"];
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
//Function for Phone No. Extraction------
function extractPhoneFromResume(text) {
  const phoneKeywords = [
    "Phone",
    "Contact No",
    "Mobile",
    "Phone Number",
    "Tel",
  ];
  const phoneRegex = new RegExp(
    `(?:[\\u260E\\u2706\\u1F4DE]?\\s*(?:${phoneKeywords.join(
      "|"
    )})?\\s*[:]?\\s*(\\d{10}))`,
    "i"
  );
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[1]?.trim() : "Not found";

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
function extractTechnicalSkills(text) {
  const sections = {
    collective: ["Technical Skills", "Skills", "Core Skills", "Relevant Skills"],
    languages: ["Programming Languages", "Languages"],
    frameworks: ["Technologies", "Frameworks", "Libraries"],
    tools: ["Tools", "Developer Tools"],
  };

  const skills = { collective: [], languages: [], frameworks: [], tools: [] };
  const predefinedLanguages = ["C++", "Java", "JavaScript", "Python", "HTML", "CSS", "C"];
  const predefinedFrameworks = ["React", "Angular", "Node.js", "Django", "Flask"];
  const predefinedTools = ["Git", "VS Code", "Postman"];

  function extractSectionSkills(sectionKeywords, defaultSkills) {
    for (const keyword of sectionKeywords) {
      const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*([\\w\\s,]+)`, "i");
      const match = text.match(regex);
      if (match) {
        return match[1].split(/,\s*/).filter(skill => defaultSkills.includes(skill));
      }
    }
    return defaultSkills.filter(skill => text.includes(skill));
  }

  // Extract skills from each section
  skills.collective = extractSectionSkills(sections.collective, [...predefinedLanguages, ...predefinedFrameworks, ...predefinedTools]);
  skills.languages = extractSectionSkills(sections.languages, predefinedLanguages);
  skills.frameworks = extractSectionSkills(sections.frameworks, predefinedFrameworks);
  skills.tools = extractSectionSkills(sections.tools, predefinedTools);

  // Combine all skills into one array and remove duplicates
  skills.allSkills = Array.from(new Set([
    ...skills.collective,
    ...skills.languages,
    ...skills.frameworks,
    ...skills.tools,
  ]));

  return skills;
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
