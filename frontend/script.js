// ============================================================
// Portfolio Frontend — script.js
// Connects to Express + MySQL backend at localhost:5000
// ============================================================

const API_BASE = "http://localhost:5000/api";

// ===== TOAST NOTIFICATION =====
const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastText = document.getElementById("toastText");
let toastTimer;

function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  toastIcon.textContent = type === "success" ? "✅" : "❌";
  toastText.textContent = message;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// ===== PRELOADER =====
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader").classList.add("hidden");
  }, 800);
});

// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById("cursorGlow");
document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top = e.clientY + "px";
});

// ===== 3D STARFIELD PARTICLES =====
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let width, height;
let stars = [];
const numStars = 400;
const speed = 0.5;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

class Star {
  constructor() {
    this.reset();
    this.z = Math.random() * width;
  }

  reset() {
    this.x = (Math.random() - 0.5) * width;
    this.y = (Math.random() - 0.5) * height;
    this.z = width;
    this.pz = this.z;
  }

  update() {
    this.z -= speed * 5;
    if (this.z < 1) this.reset();
  }

  draw() {
    let sx = (this.x / this.z) * width + width / 2;
    let sy = (this.y / this.z) * height + height / 2;
    let px = (this.x / this.pz) * width + width / 2;
    let py = (this.y / this.pz) * height + height / 2;
    this.pz = this.z;

    if (sx < 0 || sx > width || sy < 0 || sy > height) {
      this.reset();
      return;
    }

    let r = (width / this.z) * 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.lineWidth = r;
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.z / width})`;
    ctx.stroke();
  }
}

function initStars() {
  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < numStars; i++) stars.push(new Star());
  animateStars();
}

function animateStars() {
  ctx.fillStyle = "rgba(10, 10, 15, 0.4)";
  ctx.fillRect(0, 0, width, height);
  for (let star of stars) {
    star.update();
    star.draw();
  }
  requestAnimationFrame(animateStars);
}

initStars();

// ===== NAVBAR =====
let lastScroll = 0;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  const current = window.scrollY;
  if (current > lastScroll && current > 100) {
    navbar.classList.add("hide");
  } else {
    navbar.classList.remove("hide");
  }
  lastScroll = current;
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ===== SCROLL PROGRESS =====
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrollTop / docHeight) * 100 + "%";
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== SCROLL REVEAL =====
function revealOnScroll() {
  document.querySelectorAll(".reveal").forEach((el, i) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.85) {
      el.style.transitionDelay = (i % 4) * 0.1 + "s";
      el.classList.add("active");
      el.querySelectorAll(".skill-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.width + "%";
      });
    }
  });
}
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", () => setTimeout(revealOnScroll, 900));

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll(".stat-number[data-count]").forEach((counter) => {
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current) + "+";
        requestAnimationFrame(update);
      } else {
        counter.textContent = target + "+";
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          update();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(counter);
  });
}

// ===== LOAD LIVE STATS FROM API =====
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    if (data.success) {
      const s = data.data;
      const projectEl = document.getElementById("statProjects");
      const yearsEl = document.getElementById("statYears");
      const clientsEl = document.getElementById("statClients");
      if (projectEl) projectEl.dataset.count = s.projects;
      if (yearsEl) yearsEl.dataset.count = s.yearsExperience;
      if (clientsEl) clientsEl.dataset.count = s.happyClients;
    }
  } catch (_) {
    // silently fallback — counters already have default values
  } finally {
    animateCounters();
  }
}
loadStats();

// ===== TILT EFFECT =====
function applyTilt(selector) {
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 20;
      const rotateY = (rect.width / 2 - x) / 20;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
applyTilt(".skill-card");

// ===== HERO TITLE FADE =====
const heroTitle = document.querySelector(".hero h1");
if (heroTitle) {
  heroTitle.style.opacity = "0";
  window.addEventListener("load", () => {
    setTimeout(() => {
      heroTitle.style.transition = "opacity 1s ease";
      heroTitle.style.opacity = "1";
    }, 1000);
  });
}

// ===== PROJECTS — DYNAMIC FROM BACKEND API =====
const projectsGrid = document.getElementById("projectsGrid");

function renderProjects(projects) {
  projectsGrid.innerHTML = "";

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="projects-error">
        <span class="error-icon">📭</span>
        <p>No projects found yet.</p>
        <small>Projects will appear here once added to the database.</small>
      </div>`;
    return;
  }

  projects.forEach((project, i) => {
    const tagsArr = project.tags
      ? project.tags.split(",").map((t) => t.trim())
      : [];
    const tagsHTML = tagsArr
      .map((t) => `<span>${t}</span>`)
      .join("");

    const githubBtn =
      project.github_url
        ? `<a href="${project.github_url}" target="_blank" class="btn-action github">⌨️ GitHub</a>`
        : "";
    const liveBtn =
      project.live_url
        ? `<a href="${project.live_url}" target="_blank" class="btn-action live">🚀 Live Demo</a>`
        : "";

    const card = document.createElement("div");
    card.className = "project-card reveal";
    card.style.animationDelay = i * 0.1 + "s";
    card.innerHTML = `
      <div class="project-image" style="background:${
        project.gradient || "linear-gradient(135deg, #6c5ce7, #a29bfe)"
      };">
        ${project.emoji || "🚀"}
      </div>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tags">${tagsHTML}</div>
        ${
          githubBtn || liveBtn
            ? `<div class="project-actions">${githubBtn}${liveBtn}</div>`
            : ""
        }
      </div>`;

    projectsGrid.appendChild(card);
  });

  // Re-run tilt and reveal for new cards
  applyTilt(".project-card");
  revealOnScroll();
}

function showProjectsError() {
  projectsGrid.innerHTML = `
    <div class="projects-error">
      <span class="error-icon">🔌</span>
      <p>Unable to connect to the backend server.</p>
      <small>Make sure the backend is running: <code>cd backend && npm run dev</code></small>
    </div>`;
}

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      renderProjects(data.data);
    } else {
      showProjectsError();
    }
  } catch (err) {
    console.warn("⚠️ Could not load projects from API:", err.message);
    showProjectsError();
  }
}

loadProjects();

// ===== CONTACT FORM — SUBMIT TO BACKEND =====
const contactForm = document.getElementById("contactForm");
const formSubmit = document.getElementById("formSubmit");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("formName").value.trim();
  const email = document.getElementById("formEmail").value.trim();
  const subject = document.getElementById("formSubject").value.trim();
  const message = document.getElementById("formMessage").value.trim();

  if (!name || !email || !message) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  formSubmit.textContent = "Sending...";
  formSubmit.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message, "success");
      formSubmit.textContent = "Message Sent! ✅";
      formSubmit.style.background = "linear-gradient(135deg, #00cec9, #00b894)";
      contactForm.reset();

      setTimeout(() => {
        formSubmit.textContent = "Send Message ✨";
        formSubmit.style.background = "";
        formSubmit.disabled = false;
      }, 3000);
    } else {
      showToast(data.message || "Something went wrong. Please try again.", "error");
      formSubmit.textContent = "Send Message ✨";
      formSubmit.disabled = false;
    }
  } catch (err) {
    console.error("Contact form error:", err);
    showToast("Cannot reach the server. Is the backend running?", "error");
    formSubmit.textContent = "Send Message ✨";
    formSubmit.disabled = false;
  }
});

// ===== ACTIVE NAV LINK HIGHLIGHT =====
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 100;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.style.color = "#f0f0f5";
      } else {
        link.style.color = "";
      }
    }
  });
});

// ===== CHATBOT LOGIC =====
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const suggestionChips = document.querySelectorAll(".suggestion-chip");

const botKnowledge = {
  greetings: {
    keywords: ["hello", "hi", "hey", "greetings", "morning", "evening", "who are you", "what are you"],
    response: "Hi there! 👋 I'm Dhanush's AI assistant. How can I help you explore his portfolio today?",
  },
  skills: {
    keywords: ["skill", "technologies", "stack", "framework", "language", "tools", "know", "can do", "tech", "react", "java", "node", "html", "css"],
    response: "Dhanush is highly skilled in modern web development! His core stack includes <strong>HTML5, CSS3, JavaScript (ES6+), React.js</strong>, and backend technologies like <strong>Node.js and Java</strong>. He also has a great eye for design and creating interactive UI/UX experiences.",
  },
  projects: {
    keywords: ["project", "work", "portfolio", "built", "created", "made", "developed", "app", "website", "system"],
    response: "Dhanush has built some amazing projects! Some highlights include a comprehensive <strong>Voting System</strong>, a robust <strong>Admin Dashboard</strong>, and beautifully animated <strong>React websites</strong>. Check out the Projects section above for more details and live demos.",
  },
  contact: {
    keywords: ["contact", "email", "hire", "reach", "message", "phone", "social", "linkedin", "github", "connect", "call"],
    response: "You can easily reach Dhanush via the Contact form at the bottom of this page, or connect with him on <a href='#' style='color:var(--accent);'>LinkedIn</a> and <a href='#' style='color:var(--accent);'>GitHub</a>. He's always open to discussing new opportunities or collaborations!",
  },
  experience: {
    keywords: ["experience", "job", "background", "history", "role", "work experience", "career"],
    response: "Dhanush has solid experience building dynamic, responsive, and secure web applications. He has worked on complex systems like election analytics dashboards and full-stack solutions with robust databases. He is constantly learning and applying new technologies.",
  },
  education: {
    keywords: ["education", "degree", "study", "college", "university", "school", "graduated", "student"],
    response: "Dhanush has a strong educational background in Computer Science and Software Development, which forms the foundation of his technical expertise.",
  },
  thanks: {
    keywords: ["thank", "thanks", "appreciate", "cool", "awesome", "nice", "great", "good", "ok", "okay"],
    response: "You're very welcome! Let me know if you have any other questions.",
  },
  default: {
    keywords: [],
    response: "That's an interesting question! While I'm just a simple assistant, Dhanush would love to answer that personally. Feel free to use the contact form below to reach out to him directly.",
  },
};

let isChatbotOpen = false;

function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem("chatbotHistory")) || [];
  if (history.length > 0) {
    history.forEach((msg) => {
      if (msg.type === "user") renderUserMessage(msg.text);
      else renderBotMessage(msg.text);
    });
  }
}

function saveToHistory(type, text) {
  const history = JSON.parse(localStorage.getItem("chatbotHistory")) || [];
  history.push({ type, text });
  if (history.length > 50) history.shift();
  localStorage.setItem("chatbotHistory", JSON.stringify(history));
}

function toggleChatbot() {
  isChatbotOpen = !isChatbotOpen;
  chatbotWindow.classList.toggle("open", isChatbotOpen);
  chatbotToggle.classList.toggle("active", isChatbotOpen);
  if (isChatbotOpen) {
    if (chatbotMessages.children.length === 0) {
      loadChatHistory();
      if (chatbotMessages.children.length === 0) {
        const welcomeMsg = "Hi! I'm Dhanush's virtual assistant. Ask me anything about his skills, projects, or experience!";
        renderBotMessage(welcomeMsg);
        saveToHistory("bot", welcomeMsg);
      }
    }
    setTimeout(() => {
      chatbotInput.focus();
      scrollToBottom();
    }, 300);
  }
}

chatbotToggle.addEventListener("click", toggleChatbot);
chatbotClose.addEventListener("click", toggleChatbot);

chatbotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = chatbotInput.value.trim();
  if (!message) return;
  renderUserMessage(message);
  saveToHistory("user", message);
  chatbotInput.value = "";
  processUserMessage(message);
});

suggestionChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.getAttribute("data-query");
    renderUserMessage(query);
    saveToHistory("user", query);
    processUserMessage(query);
  });
});

function renderUserMessage(text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message user";
  msgDiv.textContent = text;
  chatbotMessages.appendChild(msgDiv);
  scrollToBottom();
}

function renderBotMessage(text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message bot";
  msgDiv.innerHTML = text;
  chatbotMessages.appendChild(msgDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  chatbotMessages.appendChild(typingDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

const GEMINI_API_KEY = "AIzaSyDXbZb5j4PP6aRLNe-iMdmZXMlj7SPFoI8";

async function fetchGeminiResponse(userMessage) {
  if (!GEMINI_API_KEY) return null;

  const prompt = `You are the AI assistant on Dhanush's portfolio website.
Context about Dhanush:
- Skills: HTML5, CSS3, JavaScript (ES6+), React.js, Node.js, Java.
- Projects: Election Analytics Dashboard (React, Node, MySQL), E-Commerce Platform, Student Management System.
- Experience: Building dynamic, responsive, secure web apps, full-stack solutions.
- Education: Computer Science and Software Development (2021-2025).
- Contact: dhanushbtechit239@gmail.com | Tamil Nadu, India | +91 94452 16191

The user says: "${userMessage}"
Respond concisely, politely, and professionally as the assistant. Keep it under 3 sentences. If asked something outside this context, politely say you don't know but they can contact Dhanush directly.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processUserMessage(message) {
  showTypingIndicator();
  const aiResponse = await fetchGeminiResponse(message);

  if (aiResponse) {
    removeTypingIndicator();
    const formatted = aiResponse
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*/g, "")
      .replace(/\n/g, "<br>");
    renderBotMessage(formatted);
    saveToHistory("bot", formatted);
    return;
  }

  const lowerMsg = message.toLowerCase();
  let matchedCategory = "default";
  let bestMatchCount = 0;

  for (const [category, data] of Object.entries(botKnowledge)) {
    if (category === "default") continue;
    let matchCount = 0;
    data.keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(lowerMsg) || lowerMsg.includes(keyword)) matchCount++;
    });
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      matchedCategory = category;
    }
  }

  setTimeout(() => {
    removeTypingIndicator();
    const responseText = botKnowledge[matchedCategory].response;
    renderBotMessage(responseText);
    saveToHistory("bot", responseText);
  }, 600 + Math.random() * 600);
}
