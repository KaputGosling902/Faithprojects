/* =========================================================
   COLBY CHOIR — form.js (Application Portal)

   ALL FORM FIELDS LIVE IN FIELD_DEFS BELOW.
   Add, remove, or reorder questions there and the form,
   validation, and submission all follow along.

   Submission: for now this emails kaputgosling902@gmail.com
   through formsubmit.co (no backend needed). See the TODO
   below for swapping in Formspree / Google Forms / Supabase.
   ========================================================= */

/* Where applications go, for now. */
const AUDITION_EMAIL = "kaputgosling902@gmail.com";
const ACTION_URL = "https://formsubmit.co/" + AUDITION_EMAIL;

/* ---------- FIELD CONFIG — edit here ---------- */
const FIELD_DEFS = [
  {
    id: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    placeholder: "First and last name",
    validate: (v) => v.trim().length >= 2 || "Please tell us your name."
  },
  {
    id: "age",
    label: "Age",
    type: "number",
    required: true,
    min: 5,
    max: 99,
    placeholder: "16",
    validate: (v) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 5 && n <= 99) ||
        "How old are you? A number between 5 and 99.";
    }
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ||
      "That email doesn't look right — mind checking it?"
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "(555) 555-0123",
    validate: (v) =>
      v.replace(/\D/g, "").length >= 7 ||
      "A phone number helps us reach you fast."
  },
  {
    id: "citySchool",
    label: "City / school",
    type: "text",
    required: true,
    placeholder: "Houston — Westbury High",
    validate: (v) =>
      v.trim().length >= 2 || "Where are you from? A city or school works."
  },
  {
    id: "part",
    label: "Voice part",
    type: "select",
    required: true,
    options: ["Tenor", "Baritone", "Bass", "Not sure"],
    validate: (v) => !!v || "Pick the part that fits — “Not sure” counts."
  },
  {
    id: "experience",
    label: "Singing experience",
    type: "textarea",
    required: true,
    placeholder: "Choir, band, church, karaoke legend… tell us what you've done.",
    validate: (v) =>
      v.trim().length >= 10 ||
      "A sentence or two is plenty — just give us something."
  },
  {
    id: "videoLink",
    label: "Audition video link (optional)",
    type: "url",
    required: false,
    placeholder: "https://…",
    hint: "YouTube, SoundCloud, Drive — anything with a link.",
    validate: (v) =>
      !v.trim() ||
      /^https?:\/\/\S+\.\S+/.test(v.trim()) ||
      "That doesn't look like a URL (it should start with http). It's optional, so leaving it blank is fine."
  },
  {
    id: "whyJoin",
    label: "Why do you want to join?",
    type: "textarea",
    required: true,
    placeholder: "A few honest sentences.",
    validate: (v) =>
      v.trim().length >= 20 || "Give us a few more words — what draws you in?"
  },
  /* Parent/guardian block — shown only when age is under 18 */
  {
    id: "parentName",
    label: "Parent / guardian name",
    type: "text",
    requiredIf: (s) => (s.age ? Number(s.age) : 99) < 18,
    placeholder: "Full name",
    validate: (v) => v.trim().length >= 2 || "We need a grown-up's name."
  },
  {
    id: "parentContact",
    label: "Parent / guardian phone or email",
    type: "text",
    requiredIf: (s) => (s.age ? Number(s.age) : 99) < 18,
    placeholder: "Phone or email",
    validate: (v) =>
      v.trim().length >= 5 || "A way to reach them — a phone number or email."
  }
];

/* ---------- Render the form from FIELD_DEFS ---------- */

(function buildForm() {
  const form = document.getElementById("audition-form");
  if (!form) return;

  function inputHTML(def, i) {
    const reqMark = def.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
    const hint = def.hint ? `<p class="field__hint">${def.hint}</p>` : "";

    let control;
    if (def.type === "select") {
      const opts =
        `<option value="" disabled selected>Choose one…</option>` +
        def.options.map((o) => `<option value="${o}">${o}</option>`).join("");
      control = `<select class="field__select" id="${def.id}" name="${def.id}" ${def.required ? "required" : ""} aria-describedby="${def.id}-error">${opts}</select>`;
    } else if (def.type === "textarea") {
      control = `<textarea class="field__textarea" id="${def.id}" name="${def.id}" rows="4" ${def.required ? "required" : ""} placeholder="${def.placeholder || ""}" aria-describedby="${def.id}-error"></textarea>`;
    } else {
      control = `<input class="field__input" id="${def.id}" name="${def.id}" type="${def.type}" ${def.required ? "required" : ""} placeholder="${def.placeholder || ""}" ${def.min != null ? `min="${def.min}"` : ""} ${def.max != null ? `max="${def.max}"` : ""} aria-describedby="${def.id}-error">`;
    }

    return `
      <div class="field${def.wide ? " field--wide" : ""}" data-field="${def.id}">
        <label class="field__label" for="${def.id}">${def.label}${reqMark}</label>
        ${control}
        ${hint}
        <p class="field__error" id="${def.id}-error" aria-live="polite"></p>
      </div>`;
  }

  const parentIds = FIELD_DEFS.filter((d) => d.requiredIf).map((d) => d.id);
  let html = "";
  let inParentBlock = false;

  FIELD_DEFS.forEach((def) => {
    const isParent = def.requiredIf ? true : false;
    if (isParent && !inParentBlock) {
      html += `<div class="parent-fields" id="parent-fields">
        <p class="parent-fields__banner">Under 18? Great — we just need a grown-up's details.</p>`;
      inParentBlock = true;
    }
    html += inputHTML(def, FIELD_DEFS.indexOf(def));
    if (inParentBlock && !isParent) {
      html += `</div>`;
      inParentBlock = false;
    }
  });
  if (inParentBlock) html += `</div>`;

  // Honeypot field for spam bots (hidden from humans)
  html += `<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">`;

  html += `
    <button class="btn btn--solid audition__submit" type="submit">Send application</button>`;

  form.innerHTML = html;

  /* ---------- Conditional parent/guardian fields ---------- */

  const parentWrap = document.getElementById("parent-fields");
  const ageInput = form.querySelector("#age");

  function syncParentFields() {
    if (!parentWrap) return;
    const n = Number(ageInput.value);
    const show = ageInput.value !== "" && Number.isInteger(n) && n < 18;
    parentWrap.classList.toggle("is-visible", show);
    parentWrap.querySelectorAll("input, select, textarea").forEach((el) => {
      el.disabled = !show; // disabled fields are skipped by validation + not submitted
    });
  }
  if (ageInput) ageInput.addEventListener("input", syncParentFields);
  syncParentFields();

  /* ---------- Validation ---------- */

  function fieldState() {
    const s = {};
    form.querySelectorAll("[name]:not([name^='_'])").forEach((el) => {
      if (!el.disabled) s[el.name] = el.value;
    });
    return s;
  }

  function validateAll() {
    const state = fieldState();
    const errors = [];

    FIELD_DEFS.forEach((def) => {
      const wrap = form.querySelector(`[data-field="${def.id}"]`);
      const errEl = wrap && wrap.querySelector(".field__error");
      const input = wrap && wrap.querySelector("input, select, textarea");
      if (!wrap || !input) return;

      const value = state[def.id] || "";
      let required = def.required === true;
      if (def.requiredIf) required = def.requiredIf(state);

      let ok = true;
      if (required && value.trim() === "") {
        ok = `This one's required — ${def.label.toLowerCase()} at least.`;
      } else if (value.trim() !== "" || required) {
        const res = def.validate(value);
        ok = res === true ? true : res;
      }

      if (ok === true) {
        wrap.classList.remove("has-error");
        input.removeAttribute("aria-invalid");
        if (errEl) errEl.textContent = "";
      } else {
        wrap.classList.add("has-error");
        input.setAttribute("aria-invalid", "true");
        if (errEl) errEl.textContent = ok; // ok holds the message here
        errors.push(input);
      }
    });

    return errors;
  }

  /* ---------- Submit ---------- */

  const successBox = document.getElementById("audition-success");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bad = validateAll();
    if (bad.length) {
      bad[0].focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = "Sending…";

    const data = fieldState();

    try {
      // TODO: connect form submission (Formspree / Google Forms / Supabase / etc.)
      // For now: POST to formsubmit.co, which emails AUDITION_EMAIL.
      // Note: the FIRST submission triggers a one-time activation email to
      // AUDITION_EMAIL — click the link in it to confirm deliveries.
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      fd.append("_subject", "Colby Choir — audition application");
      fd.append("_template", "table");
      fd.append("_captcha", "false");

      const res = await fetch(ACTION_URL, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      form.hidden = true;
      if (successBox) successBox.hidden = false;
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalLabel;
      // Fallback: open the user's mail client with everything pre-filled
      const body = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      const mailto =
        `mailto:${AUDITION_EMAIL}?subject=${encodeURIComponent(
          "Colby Choir — audition application"
        )}&body=${encodeURIComponent(body)}`;
      const note = document.createElement("p");
      note.className = "audition__send-note";
      note.setAttribute("role", "alert");
      note.innerHTML =
        `We couldn't reach the server from here. <a href="${mailto}">Send it by email instead</a> — everything is pre-filled.`;
      form.prepend(note);
      note.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
