/**
 * A fallback simulation layer holding deeply realistic Indian tech internships
 * to supplement restrictive free remote APIs.
 */

// Generate 60 diverse, realistic internships
const companies = [
  { name: "Zomato", url: "https://logo.clearbit.com/zomato.com", site: "zomato.com" },
  { name: "Swiggy", url: "https://logo.clearbit.com/swiggy.com", site: "swiggy.com" },
  { name: "Razorpay", url: "https://logo.clearbit.com/razorpay.com", site: "razorpay.com" },
  { name: "Cred", url: "https://logo.clearbit.com/cred.club", site: "cred.club" },
  { name: "TCS", url: "https://logo.clearbit.com/tcs.com", site: "tcs.com" },
  { name: "Wipro", url: "https://logo.clearbit.com/wipro.com", site: "wipro.com" },
  { name: "Zoho", url: "https://logo.clearbit.com/zoho.com", site: "zoho.com" },
  { name: "Infosys", url: "https://logo.clearbit.com/infosys.com", site: "infosys.com" },
  { name: "PhonePe", url: "https://logo.clearbit.com/phonepe.com", site: "phonepe.com" },
  { name: "Zepto", url: "https://logo.clearbit.com/zeptonow.com", site: "zeptonow.com" },
  { name: "Flipkart", url: "https://logo.clearbit.com/flipkart.com", site: "flipkart.com" },
  { name: "Paytm", url: "https://logo.clearbit.com/paytm.com", site: "paytm.com" },
  { name: "Ola", url: "https://logo.clearbit.com/olacabs.com", site: "olacabs.com" },
  { name: "MakeMyTrip", url: "https://logo.clearbit.com/makemytrip.com", site: "makemytrip.com" },
  { name: "Dream11", url: "https://logo.clearbit.com/dream11.com", site: "dream11.com" },
];

const roles = [
  "Frontend Engineering Intern", "Software Engineer Intern (SDE-1)", 
  "Data Analyst Intern", "Backend Developer Intern", 
  "Systems Engineering Trainee", "Cloud Infrastructure Junior Analyst",
  "Full Stack Web Developer Intern", "Trainee Software Developer",
  "Mobile App Developer Intern", "GenUI Engineering Intern",
  "Machine Learning Intern", "Product Management Intern",
  "Cybersecurity Trainee", "DevOps Engineer Intern", "QA Automation Intern"
];

const locationsInfo = [
  { loc: "Gurugram, HR", model: "on-site", region: "delhi_ncr" },
  { loc: "Bangalore, KA", model: "hybrid", region: "bangalore" },
  { loc: "Bangalore, KA", model: "on-site", region: "bangalore" },
  { loc: "Remote (India)", model: "remote", region: "india_all" },
  { loc: "Pune, MH", model: "on-site", region: "pune" },
  { loc: "Hyderabad, TS", model: "hybrid", region: "hyderabad" },
  { loc: "Chennai, TN", model: "on-site", region: "india_all" }, // mapped to all india since no specific region drop
  { loc: "Mysore, KA", model: "on-site", region: "bangalore" }, // near enough to blr
  { loc: "Mumbai, MH", model: "on-site", region: "pune" }, // map to pune/MH
  { loc: "Noida, UP", model: "hybrid", region: "delhi_ncr" },
];

const salaries = [
  "₹20k / month", "₹25k / month", "₹30k / month", "₹35k / month", 
  "₹40k / month", "₹45k / month", "₹50k / month", "₹60k / month"
];

const generateInternships = (count) => {
    const list = [];
    for(let i=1; i<=count; i++) {
        const comp = companies[Math.floor(Math.random() * companies.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const locInfo = locationsInfo[Math.floor(Math.random() * locationsInfo.length)];
        const salary = salaries[Math.floor(Math.random() * salaries.length)];
        const dateOffset = Math.floor(Math.random() * 20); // within last 20 days
        
        list.push({
            id: `mock_${i}`,
            title: role,
            company_name: comp.name,
            company_logo_url: comp.url,
            candidate_required_location: `${locInfo.loc} (${locInfo.model === 'on-site' ? 'On-Site' : locInfo.model === 'hybrid' ? 'Hybrid' : 'Remote'})`,
            salary: salary,
            publication_date: new Date(Date.now() - 86400000 * dateOffset).toISOString(),
            job_type: "internship",
            url: `https://www.google.com/search?q=${encodeURIComponent(comp.name + " " + role + " careers")}`,
            work_model: locInfo.model,
            region: locInfo.region
        });
    }
    return list;
};

export const indianInternshipsFallback = generateInternships(60);
  
