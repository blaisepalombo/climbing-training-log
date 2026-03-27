export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function formatDateForInput(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
}

export function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

export function cleanText(value = "") {
  return value.trim();
}

export function showMessage(element, message, isError = false) {
  if (!element) return;

  element.textContent = message;
  element.classList.remove("error", "success");

  if (!message) {
    return;
  }

  element.classList.add(isError ? "error" : "success");
}