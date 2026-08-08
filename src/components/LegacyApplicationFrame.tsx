"use client";

import { useCallback, useRef } from "react";

function findFieldGroup(form: HTMLFormElement, fieldName: string) {
  return Array.from(form.querySelectorAll<HTMLElement>(".t-input-group")).find(
    (group) => group.getAttribute("data-field-name") === fieldName,
  ) || null;
}

function getFieldValue(form: HTMLFormElement, fieldName: string) {
  const group = findFieldGroup(form, fieldName);

  if (group) {
    const checked = group.querySelector<HTMLInputElement>(
      'input[type="radio"]:checked, input[type="checkbox"]:checked',
    );
    if (checked) return checked.value.trim();

    const controls = Array.from(
      group.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select',
      ),
    );

    const nonEmpty = controls.find((control) => !control.disabled && control.value.trim().length > 0);
    if (nonEmpty) return nonEmpty.value.trim();
  }

  const named = form.elements.namedItem(fieldName);
  if (named instanceof RadioNodeList) {
    return typeof named.value === "string" ? named.value.trim() : "";
  }
  if (
    named instanceof HTMLInputElement ||
    named instanceof HTMLTextAreaElement ||
    named instanceof HTMLSelectElement
  ) {
    return named.value.trim();
  }

  return "";
}

export default function LegacyApplicationFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const wireForm = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const frameWindow = iframe?.contentWindow;
    if (!doc || !frameWindow) return;

    const legacyForm = doc.getElementById("form2119410573") as HTMLFormElement | null;
    if (!legacyForm || legacyForm.dataset.supabaseBridge === "1") return;

    const form = legacyForm.cloneNode(true) as HTMLFormElement;
    form.id = "form2119410573";
    form.name = "form2119410573";
    form.dataset.supabaseBridge = "1";
    form.noValidate = true;
    form.classList.remove("js-form-proccess", "js-form-proccessing");
    form.removeAttribute("data-formactiontype");
    form.removeAttribute("data-success-callback");
    form.removeAttribute("action");
    form.removeAttribute("method");
    form.querySelectorAll("input[name='formservices[]'], .js-formaction-services").forEach((node) => node.remove());

    legacyForm.replaceWith(form);

    const submitButton = form.querySelector("button[type='submit'], button.t-submit, .t-submit") as HTMLButtonElement | null;
    if (submitButton) {
      submitButton.type = "button";
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-disabled");
      submitButton.style.pointerEvents = "auto";
      submitButton.style.cursor = "pointer";
    }

    const removeCaptcha = () => {
      doc.querySelectorAll(
        "iframe[src*='captcha'], iframe[src*='recaptcha'], iframe[src*='hcaptcha'], [class*='captcha'], [id*='captcha']",
      ).forEach((node) => node.remove());
    };
    removeCaptcha();

    const observer = new MutationObserver(removeCaptcha);
    if (doc.body) observer.observe(doc.body, { childList: true, subtree: true });

    let customError = form.querySelector<HTMLElement>("[data-ozbye-error]");
    if (!customError) {
      customError = doc.createElement("div");
      customError.setAttribute("data-ozbye-error", "1");
      customError.style.display = "none";
      customError.style.margin = "16px 0";
      customError.style.padding = "12px 16px";
      customError.style.borderRadius = "8px";
      customError.style.background = "#fff1f0";
      customError.style.border = "1px solid #ffccc7";
      customError.style.color = "#b42318";
      customError.style.fontSize = "14px";
      customError.style.lineHeight = "1.45";
      customError.style.fontFamily = "Arial, sans-serif";
      const submitWrap = submitButton?.closest(".t-form__submit") || submitButton?.parentElement;
      if (submitWrap) submitWrap.before(customError);
      else form.appendChild(customError);
    }

    const showError = (message: string) => {
      const oldErrorBox = form.querySelector(".js-errorbox-all") as HTMLElement | null;
      if (oldErrorBox) oldErrorBox.style.display = "none";
      if (customError) {
        customError.textContent = message;
        customError.style.display = "block";
        customError.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        frameWindow.alert(message);
      }
    };

    const clearError = () => {
      const oldErrorBox = form.querySelector(".js-errorbox-all") as HTMLElement | null;
      if (oldErrorBox) oldErrorBox.style.display = "none";
      if (customError) customError.style.display = "none";
    };

    let sending = false;

    const submitToOzbye = async () => {
      if (sending) return;
      clearError();
      removeCaptcha();

      const fullName = getFieldValue(form, "Name");
      const phone = getFieldValue(form, "Phone");
      const telegram = getFieldValue(form, "Telegram profili ochiq telefon raqam yoki Telegram username");
      const gender = getFieldValue(form, "Jinsingiz?");
      const ageGroup = getFieldValue(form, "yosh guruhi");
      const promoCode = getFieldValue(form, "PROMOKOD (Agar bo'lsa)");

      if (fullName.length < 2) {
        showError("Ism va familiyangizni kiriting.");
        return;
      }
      if (phone.replace(/\D/g, "").length < 7) {
        showError("Telefon raqamingizni to‘liq kiriting.");
        return;
      }
      if (!gender) {
        showError("Jinsingizni belgilang.");
        return;
      }
      if (!ageGroup) {
        showError("Yosh guruhingizni belgilang.");
        return;
      }

      const button = form.querySelector("button.t-submit, button[type='button']") as HTMLButtonElement | null;
      const buttonText = button?.querySelector(".t-btnflex__text") as HTMLElement | null;
      const originalText = buttonText?.textContent || button?.textContent || "Yuborish";

      sending = true;
      if (button) button.disabled = true;
      if (buttonText) buttonText.textContent = "Yuborilmoqda...";
      else if (button) button.textContent = "Yuborilmoqda...";

      try {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            phone,
            telegram,
            gender,
            age_group: ageGroup,
            promo_code: promoCode,
            website: "",
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result?.error || "Arizani yuborib bo‘lmadi.");

        const inputs = form.querySelector(".t-form__inputsbox") as HTMLElement | null;
        const success = form.querySelector(".js-successbox") as HTMLElement | null;
        if (inputs) inputs.style.display = "none";
        if (customError) customError.style.display = "none";
        if (success) {
          success.style.display = "block";
          success.innerHTML = "<div style='font-weight:700;margin-bottom:8px'>Rahmat!</div><div>Ma’lumotlaringizni qabul qilib oldik! Tez orada siz bilan bog‘lanamiz</div>";
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          frameWindow.alert("Rahmat! Ma’lumotlaringiz qabul qilindi.");
        }
        form.reset();
      } catch (error) {
        showError(error instanceof Error ? error.message : "Arizani yuborishda xatolik yuz berdi.");
      } finally {
        sending = false;
        if (button) button.disabled = false;
        if (buttonText) buttonText.textContent = originalText;
        else if (button) button.textContent = originalText;
      }
    };

    frameWindow.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      const clickedButton = target && typeof target.closest === "function"
        ? target.closest("button.t-submit, button[type='button']")
        : null;
      if (!clickedButton || !form.contains(clickedButton)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void submitToOzbye();
    }, true);

    if (submitButton) {
      submitButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void submitToOzbye();
      };
    }

    frameWindow.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const target = event.target as Element | null;
      if (target?.tagName?.toLowerCase() === "textarea") return;
      if (!target || !form.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      void submitToOzbye();
    }, true);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void submitToOzbye();
    }, true);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/tilda/ariza-qoldrish.html"
      title="Ariza qoldirish"
      onLoad={wireForm}
      className="block h-[100dvh] w-full border-0"
    />
  );
}
