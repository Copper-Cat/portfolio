(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.querySelector(".nav__menu");
  const navLinks = document.querySelectorAll(".nav__link");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const projectsEmpty = document.getElementById("projects-empty");
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");

  /* ── Sticky header ───────────────────────────────────────── */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    updateActiveNavLink();
  }

  /* ── Active nav link on scroll ───────────────────────────── */
  function updateActiveNavLink() {
    const sectionIds = ["about", "projects", "contact"];
    const headerOffset = 120;
    const scrollPos = window.scrollY + headerOffset;
    const nearPageBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

    let current = sectionIds[0];

    if (nearPageBottom) {
      current = sectionIds[sectionIds.length - 1];
    } else {
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && scrollPos >= section.offsetTop) {
          current = sectionIds[i];
          break;
        }
      }
    }

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + current);
    });
  }

  /* ── Mobile nav toggle ───────────────────────────────────── */
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ── Project filter (multi-select) ───────────────────────── */
  const activeFilters = new Set();

  function syncFilterButtons() {
    const showAll = activeFilters.size === 0;

    filterBtns.forEach(function (btn) {
      const filter = btn.dataset.filter;
      const isActive = filter === "all" ? showAll : activeFilters.has(filter);

      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyProjectFilters() {
    const showAll = activeFilters.size === 0;
    let visibleCount = 0;

    projectCards.forEach(function (card) {
      const categories = (card.dataset.category || "")
        .split(/\s+/)
        .filter(Boolean);
      const show =
        showAll ||
        Array.from(activeFilters).every(function (filter) {
          return categories.includes(filter);
        });

      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount++;
    });

    if (projectsEmpty) {
      projectsEmpty.hidden = visibleCount > 0;
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = btn.dataset.filter;

      if (filter === "all") {
        activeFilters.clear();
      } else if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
      } else {
        activeFilters.add(filter);
      }

      syncFilterButtons();
      applyProjectFilters();
    });
  });

  syncFilterButtons();

  /* ── Contact form validation & submit ────────────────────── */
  if (contactForm) {
    const fields = [
      { id: "name", validate: function (v) { return v.trim().length >= 2; }, message: "Please enter your name." },
      { id: "email", validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, message: "Please enter a valid email." },
      { id: "subject", validate: function (v) { return v.trim().length >= 2; }, message: "Please enter a subject." },
      { id: "message", validate: function (v) { return v.trim().length >= 10; }, message: "Message must be at least 10 characters." }
    ];
    const submitBtn = document.getElementById("contact-submit");
    const submitError = document.getElementById("form-submit-error");

    function getAccessKey() {
      return (window.CONTACT_FORM_CONFIG && window.CONTACT_FORM_CONFIG.accessKey) || "";
    }

    function setSubmitting(isSubmitting) {
      if (submitBtn) {
        submitBtn.disabled = isSubmitting;
        submitBtn.textContent = isSubmitting ? "Sending..." : "Send message";
      }
    }

    function showSubmitError(message) {
      if (!submitError) return;
      submitError.textContent = message;
      submitError.hidden = false;
    }

    function hideSubmitError() {
      if (!submitError) return;
      submitError.textContent = "";
      submitError.hidden = true;
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideSubmitError();
      if (formSuccess) formSuccess.hidden = true;

      let isValid = true;

      fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        const errorEl = document.getElementById(field.id + "-error");
        const value = input.value;

        if (!field.validate(value)) {
          input.classList.add("is-invalid");
          errorEl.textContent = field.message;
          isValid = false;
        } else {
          input.classList.remove("is-invalid");
          errorEl.textContent = "";
        }
      });

      if (!isValid) return;

      const accessKey = getAccessKey();
      if (!accessKey) {
        showSubmitError("Email is not configured yet. Add your Web3Forms access key to js/contact-config.js.");
        return;
      }

      setSubmitting(true);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          subject: document.getElementById("subject").value.trim(),
          message: document.getElementById("message").value.trim(),
          replyto: document.getElementById("email").value.trim(),
          botcheck: false
        })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.success) {
            contactForm.reset();
            if (formSuccess) {
              formSuccess.hidden = false;
              setTimeout(function () {
                formSuccess.hidden = true;
              }, 5000);
            }
            return;
          }

          showSubmitError(result.data.message || "Something went wrong. Please try again later.");
        })
        .catch(function () {
          showSubmitError("Could not send your message. Check your connection and try again.");
        })
        .finally(function () {
          setSubmitting(false);
        });
    });

    fields.forEach(function (field) {
      const input = document.getElementById(field.id);
      input.addEventListener("input", function () {
        input.classList.remove("is-invalid");
        document.getElementById(field.id + "-error").textContent = "";
      });
    });
  }

  /* ── Scroll to anchor on load (e.g. back from project page) ─ */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
