"use strict";
// PERSONALIZE: set this to your real contact email.
const CONTACT_EMAIL = "hello@example.com";
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");
const navLinks = [...navigation.querySelectorAll("a")];
function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) closeMenu();
});
window.matchMedia("(min-width: 640px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
// Scroll entrances use independent translate, preserving existing hover transforms.
// Content stays visible when JavaScript, observers, or motion are unavailable.
const scrollMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollTargets = [...new Set(document.querySelectorAll(
  ".reveal, .hero > :not(.hero-waves):not(.wave-toggle), .ps-header, .ps-card, .footer-inner"
))];

scrollTargets.forEach((element) => element.classList.add("scroll-reveal"));
document.querySelectorAll(".projects-grid, .ps-grid, .about-layout, .contact-layout").forEach((group) => {
  [...group.children].forEach((element, index) => {
    element.style.setProperty("--scroll-delay", `${(index % 2) * 90}ms`);
  });
});
document.querySelectorAll(".hero > .scroll-reveal").forEach((element, index) => {
  element.style.setProperty("--scroll-delay", `${Math.min(index * 45, 225)}ms`);
});

if ("IntersectionObserver" in window && !scrollMotionPreference.matches) {
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      scrollObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

  document.documentElement.classList.add("scroll-motion");
  scrollTargets.forEach((element) => scrollObserver.observe(element));

  // Keyboard navigation should never land on hidden content.
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest(".scroll-reveal");
    if (target) {
      target.classList.add("is-revealed");
      scrollObserver.unobserve(target);
    }
  });
  scrollMotionPreference.addEventListener("change", (event) => {
    if (event.matches) {
      document.documentElement.classList.remove("scroll-motion");
      scrollObserver.disconnect();
    }
  });
}
// Track a stable reading line below the sticky header, including short sections.
let scrollScheduled = false;
const sections = [...document.querySelectorAll("main section[id]")];
function updateActiveLink() {
  const readingLine = window.scrollY + Math.min(window.innerHeight * 0.3, 240);
  let active = sections[0].id;
  sections.forEach((section) => {
    if (section.offsetTop <= readingLine) active = section.id;
  });
  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 8
  )
    active = "contact";
  navLinks.forEach((link) => {
    const selected = link.hash === "#" + active;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollScheduled = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(updateActiveLink);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateActiveLink);
window.addEventListener("load", updateActiveLink);
updateActiveLink();
document.querySelector("#year").textContent = new Date().getFullYear();
// Static contact delivery: no message is stored or sent silently.
document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const email = String(data.get("email")).trim();
  const message = String(data.get("message")).trim();
  if (!name || !message) {
    document.querySelector("#form-status").textContent =
      "Please add your name and a message.";
    return;
  }
  const subject = encodeURIComponent("Portfolio inquiry from " + name);
  const body = encodeURIComponent(
    `${message}\n\nFrom: ${name}\nEmail: ${email}`,
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  document.querySelector("#form-status").textContent =
    "Your email draft is ready. Complete sending in your email app. If it did not open, email " +
    CONTACT_EMAIL +
    " directly.";
});

// Let visitors pause decorative wave motion; respect their system preference.
const waveHero = document.querySelector(".hero");
const waveToggle = document.querySelector(".wave-toggle");
const waveMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (waveHero && waveToggle) {
  let waveUserPaused = false;
  const updateWaves = () => {
    waveHero.classList.toggle("waves-paused", waveUserPaused || waveMotionPreference.matches);
    waveToggle.hidden = waveMotionPreference.matches;
    waveToggle.setAttribute("aria-pressed", String(waveUserPaused));
    waveToggle.setAttribute("aria-label", waveUserPaused ? "Play background animation" : "Pause background animation");
    waveToggle.querySelector("path").setAttribute("d", waveUserPaused ? "m9 6 9 6-9 6Z" : "M9 6v12M15 6v12");
  };
  waveToggle.addEventListener("click", () => {
    waveUserPaused = !waveUserPaused;
    updateWaves();
  });
  waveMotionPreference.addEventListener("change", updateWaves);
  updateWaves();
}

// Gallery image paths are edited directly in index.html, under ARTWORK GALLERY.
const artworkDialog = document.querySelector("#artwork-gallery");
if (artworkDialog) {
  // Keep the full-size link in sync: only edit the img src in the HTML.
  artworkDialog.querySelectorAll(".artwork-post-image").forEach((link) => {
    const image = link.querySelector("img");
    link.href = image.getAttribute("src");
  });

  document.querySelectorAll("[data-open-artwork]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      artworkDialog.showModal();
      document.documentElement.classList.add("artwork-gallery-open");
    });
  });
  artworkDialog.querySelector(".artwork-close").addEventListener("click", () => artworkDialog.close());
  // Native dialog supplies Escape handling, a focus trap, and focus restoration.
  artworkDialog.addEventListener("close", () => {
    document.documentElement.classList.remove("artwork-gallery-open");
  });
  artworkDialog.addEventListener("click", (event) => {
    if (event.target !== artworkDialog) return;
    const bounds = artworkDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      artworkDialog.close();
    }
  });
}
