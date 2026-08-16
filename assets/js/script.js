const form = document.getElementById("enquiryForm");
const phone = "918286239777";
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-header nav");

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".cake-card button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector('[name="occasion"]').value = btn.dataset.occasion;
    document.getElementById("enquire").scrollIntoView({ behavior: "smooth" });
  });
});

const nameInput = form.querySelector('[name="name"]');
const flavourInput = form.querySelector('[name="flavour"]');
const weightInput = form.querySelector('[name="weight"]');
const dateInput = form.querySelector('[name="date"]');
const occasionInput = form.querySelector('[name="occasion"]');
const phoneInput = form.querySelector('[name="phone"]');
const lettersOnly = /^[A-Za-z][A-Za-z .'-]*$/;
const flavourPattern = /^[A-Za-z][A-Za-z &,'/-]*$/;
const allowedWeights = new Set([
  "0.5 kg", "1 kg", "1.5 kg", "2 kg", "2.5 kg", "3 kg", "3.5 kg", "4 kg", "4.5 kg", "5 kg",
  "5.5 kg", "6 kg", "6.5 kg", "7 kg", "7.5 kg", "8 kg", "8.5 kg", "9 kg", "9.5 kg", "10 kg"
]);

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bookingWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);
  return { min: toDateValue(today), max: toDateValue(maxDate) };
}

function setDateLimits() {
  const { min, max } = bookingWindow();
  dateInput.min = min;
  dateInput.max = max;
}

function setFieldError(input, message) {
  const error = input.parentElement.querySelector(".error-text");
  input.classList.toggle("invalid", Boolean(message));
  input.setCustomValidity(message || "");
  if (error) {
    error.textContent = message || "";
    error.classList.toggle("visible", Boolean(message));
  }
}

function insertSanitized(input, incoming, sanitize) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const cleaned = sanitize(incoming);
  if (!cleaned) return false;
  input.value = input.value.slice(0, start) + cleaned + input.value.slice(end);
  const cursor = start + cleaned.length;
  input.setSelectionRange(cursor, cursor);
  return true;
}

function restrictField(input, { charPattern, sanitize, hint }) {
  input.addEventListener("beforeinput", (e) => {
    if (!e.data || e.inputType !== "insertText") return;
    const invalid = [...e.data].some((ch) => !charPattern.test(ch));
    if (!invalid) return;
    e.preventDefault();
    const cleaned = sanitize(e.data);
    if (cleaned) insertSanitized(input, cleaned, sanitize);
    setFieldError(input, hint);
  });

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = sanitize(pasted);
    if (cleaned) insertSanitized(input, cleaned, sanitize);
    else setFieldError(input, hint);
    if (cleaned && sanitize(pasted) !== pasted) setFieldError(input, hint);
    else if (cleaned) setFieldError(input, "");
  });

  input.addEventListener("drop", (e) => {
    e.preventDefault();
    const dropped = sanitize(e.dataTransfer.getData("text"));
    if (dropped) insertSanitized(input, dropped, sanitize);
    else setFieldError(input, hint);
  });

  input.addEventListener("input", () => {
    const cleaned = sanitize(input.value);
    if (input.value !== cleaned) {
      const cursor = input.selectionStart - (input.value.length - cleaned.length);
      input.value = cleaned;
      input.setSelectionRange(Math.max(0, cursor), Math.max(0, cursor));
      setFieldError(input, hint);
      return;
    }
    if (cleaned) setFieldError(input, "");
  });
}

function sanitizeName(value) {
  return value.replace(/[^A-Za-z .'-]/g, "");
}

function sanitizeFlavour(value) {
  return value.replace(/[^A-Za-z &,'/-]/g, "");
}

function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

restrictField(nameInput, {
  charPattern: /[A-Za-z .'-]/,
  sanitize: sanitizeName,
  hint: "Name accepts letters only. Numbers and symbols cannot be entered."
});

restrictField(flavourInput, {
  charPattern: /[A-Za-z &,'/-]/,
  sanitize: sanitizeFlavour,
  hint: "Flavour accepts letters only. Numbers cannot be entered."
});

restrictField(phoneInput, {
  charPattern: /\d/,
  sanitize: sanitizePhone,
  hint: "Phone accepts 10 digits only."
});

function validateName(requireValue = true) {
  const value = nameInput.value.trim();
  if (!value) {
    setFieldError(nameInput, requireValue ? "Please enter your name." : "");
    return !requireValue;
  }
  if (!lettersOnly.test(value)) {
    setFieldError(nameInput, "Name can contain letters only — numbers are not allowed.");
    return false;
  }
  setFieldError(nameInput, "");
  return true;
}

function validateFlavour(requireValue = true) {
  const value = flavourInput.value.trim();
  if (!value) {
    setFieldError(flavourInput, requireValue ? "Please enter a cake flavour." : "");
    return !requireValue;
  }
  if (!flavourPattern.test(value)) {
    setFieldError(flavourInput, "Flavour can contain letters only — numbers are not allowed.");
    return false;
  }
  setFieldError(flavourInput, "");
  return true;
}

function validateWeight() {
  const value = weightInput.value;
  const numeric = Number.parseFloat(value);
  if (!value) {
    setFieldError(weightInput, "Please select a cake weight.");
    return false;
  }
  if (!allowedWeights.has(value) || !Number.isFinite(numeric) || numeric <= 0) {
    setFieldError(weightInput, "Weight must be greater than 0, in 0.5 kg steps (0.5, 1, 1.5).");
    return false;
  }
  setFieldError(weightInput, "");
  return true;
}

function applyDateValue(value) {
  setDateLimits();
  const { min, max } = bookingWindow();
  if (!value) return "";
  if (value < min || value > max) return "";
  return value;
}

function validateDate(requireValue = true) {
  setDateLimits();
  const value = dateInput.value;
  const { min, max } = bookingWindow();
  if (!value) {
    setFieldError(dateInput, requireValue ? "Please choose a required date." : "");
    return !requireValue;
  }
  if (value < min) {
    dateInput.value = "";
    setFieldError(dateInput, "Date cannot be earlier than today.");
    return false;
  }
  if (value > max) {
    dateInput.value = "";
    setFieldError(dateInput, "Bookings are only accepted up to 14 days in advance.");
    return false;
  }
  setFieldError(dateInput, "");
  return true;
}

function validateOccasion() {
  if (!occasionInput.value) {
    setFieldError(occasionInput, "Please select an occasion.");
    return false;
  }
  setFieldError(occasionInput, "");
  return true;
}

function validatePhone(requireValue = false) {
  const value = phoneInput.value.trim();
  if (!value) {
    setFieldError(phoneInput, requireValue ? "Please enter a phone number." : "");
    return true;
  }
  if (!/^\d{10}$/.test(value)) {
    setFieldError(phoneInput, "Enter a valid 10-digit mobile number.");
    return false;
  }
  setFieldError(phoneInput, "");
  return true;
}

function validateEnquiryForm() {
  const nameOk = validateName(true);
  const occasionOk = validateOccasion();
  const flavourOk = validateFlavour(true);
  const weightOk = validateWeight();
  const dateOk = validateDate(true);
  const phoneOk = validatePhone(false);
  return nameOk && occasionOk && flavourOk && weightOk && dateOk && phoneOk;
}

setDateLimits();
dateInput.addEventListener("focus", setDateLimits);
dateInput.addEventListener("keydown", (e) => {
  const allowedKeys = ["Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Delete", "Home", "End"];
  if (e.metaKey || e.ctrlKey) return;
  if (!allowedKeys.includes(e.key)) e.preventDefault();
});
dateInput.addEventListener("input", () => {
  const next = applyDateValue(dateInput.value);
  if (dateInput.value && !next) {
    dateInput.value = "";
    setFieldError(dateInput, "Please choose a date from today up to 14 days ahead.");
    return;
  }
  if (next) setFieldError(dateInput, "");
});
dateInput.addEventListener("change", () => validateDate(false));
weightInput.addEventListener("change", validateWeight);
occasionInput.addEventListener("change", validateOccasion);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateEnquiryForm()) {
    const firstInvalid = form.querySelector(".invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const data = new FormData(form);
  const text = [
    "Hello Cake Creation, I'd like to enquire about a cake.",
    "",
    `Name: ${data.get("name").trim()}`,
    `Occasion: ${data.get("occasion")}`,
    `Cake flavour: ${data.get("flavour").trim()}`,
    `Approx. weight: ${data.get("weight")}`,
    `Required date: ${data.get("date")}`,
    `Phone: ${data.get("phone") || "—"}`,
    `Requirements: ${data.get("message") || "—"}`
  ].join("\n");
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
});

const modal = document.getElementById("imageModal");
const modalImage = modal.querySelector(".modal-image");
const modalText = modal.querySelector("p");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    modalImage.src = item.dataset.src;
    modalImage.alt = item.dataset.label;
    modalText.textContent = item.dataset.label;
    modal.classList.add("open");
  });
});

modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.tagName === "BUTTON") {
    modal.classList.remove("open");
    modalImage.removeAttribute("src");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.remove("open");
});
