/* =========================================
   MERIDIAN CLINIC — main.js
   Shared utilities, analytics, API hooks
   ========================================= */

// ─── Config ───────────────────────────────
const CONFIG = {
  whatsappNumber: "977XXXXXXXXXX",   // ← change to real number
  apiBase: "",                        // ← change to real backend URL e.g. "https://api.meridianclinic.com"
  clinicName: "Meridian Clinic",
};

// ─── On DOM ready ─────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initMobileMenu();
  initSmoothScroll();
  initFAQ();
  initScrollReveal();
  injectWhatsAppButton();
  trackWebsiteVisit();
});

// ─── 1. Navigation: sticky + active link ──
function initNav() {
  const header = document.getElementById("site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  // Mark current page link active
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    if (link.href === window.location.href ||
        link.href === window.location.href.replace(/\/$/, "")) {
      link.classList.add("active");
    }
  });
}

// ─── 2. Mobile hamburger menu ─────────────
function initMobileMenu() {
  const btn = document.getElementById("menu-btn");
  const drawer = document.getElementById("mobile-menu");
  if (!btn || !drawer) return;

  btn.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    document.body.classList.toggle("overflow-hidden", open);
  });

  // Close on link click
  drawer.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      document.body.classList.remove("overflow-hidden");
    })
  );
}

// ─── 3. Smooth scroll ─────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ─── 4. FAQ accordion ─────────────────────
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-question");
    const body = item.querySelector(".faq-answer");
    if (!btn || !body) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close all
      document.querySelectorAll(".faq-item.open").forEach(o => {
        o.classList.remove("open");
        o.querySelector(".faq-answer").style.maxHeight = null;
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}

// ─── 5. Scroll-reveal animations ──────────
function initScrollReveal() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ─── 6. WhatsApp floating button ──────────
function injectWhatsAppButton() {
  const btn = document.createElement("a");
  btn.href = `https://wa.me/${CONFIG.whatsappNumber}`;
  btn.target = "_blank";
  btn.rel = "noopener noreferrer";
  btn.setAttribute("aria-label", "Chat on WhatsApp");
  btn.className = "whatsapp-fab";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
               -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
               -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
               -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
               .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
               -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
               -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
               -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
               .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
               .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
               .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.104 1.523 5.827L.057 23.882
               a.5.5 0 00.604.63l6.235-1.63A11.945 11.945 0 0012 24c6.627 0 12-5.373
               12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.214
               -3.7.969.987-3.61-.235-.373A9.818 9.818 0 1112 21.818z"/>
    </svg>
    <span class="whatsapp-tooltip">Chat with us</span>`;
  document.body.appendChild(btn);
}

// ─── Analytics: track page visit ──────────
async function trackWebsiteVisit() {
  const payload = {
    page: window.location.pathname || "/",
    timestamp: new Date().toISOString(),
    referrer: document.referrer || null,
  };
  try {
    await fetch(`${CONFIG.apiBase}/api/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (_) {
    // Silently fail — analytics must never break the UI
  }
}

// ─── Analytics: track appointment booking ─
async function trackAppointmentBooking({ patientName, service }) {
  const payload = {
    patientName,
    service,
    timestamp: new Date().toISOString(),
  };
  try {
    await fetch(`${CONFIG.apiBase}/api/analytics/appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silent */ }
}

// ─── Appointment form submission ──────────
async function submitAppointment(formData) {
  const btn = document.getElementById("appt-submit-btn");
  const feedbackEl = document.getElementById("appt-feedback");

  // Loading state
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Sending…`;
  }
  if (feedbackEl) feedbackEl.className = "appt-feedback hidden";

  try {
    const response = await fetch(`${CONFIG.apiBase}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error(`Server responded ${response.status}`);

    // Success
    if (feedbackEl) {
      feedbackEl.className = "appt-feedback success";
      feedbackEl.textContent =
        "Your appointment request has been received. We'll confirm within 2 hours.";
    }
    document.getElementById("appointment-form")?.reset();

    // Fire analytics
    await trackAppointmentBooking({
      patientName: formData.fullName,
      service: formData.service,
    });

  } catch (err) {
    if (feedbackEl) {
      feedbackEl.className = "appt-feedback error";
      feedbackEl.textContent =
        "Something went wrong. Please call us directly or try again.";
    }
    console.error("Appointment submission error:", err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Book Appointment";
    }
  }
}

// ─── Wire up appointment form ──────────────
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    await submitAppointment(data);
  });
});
