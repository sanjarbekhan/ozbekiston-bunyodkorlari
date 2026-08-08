"use client";

import { useCallback, useRef } from "react";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function installApplicationHandler(doc: Document) {
  const form = doc.getElementById("form2119410573") as HTMLFormElement | null;
  if (!form || form.dataset.supabaseBridge === "1") return;

  form.dataset.supabaseBridge = "1";
  form.classList.remove("js-form-proccess", "js-form-proccessing");
  form.removeAttribute("data-formactiontype");
  form.removeAttribute("data-success-callback");
  form.removeAttribute("action");
  form.querySelectorAll("input[name='formservices[]'], .js-formaction-services").forEach((node) => node.remove());

  const showError = (message: string) => {
    const errorBox = form.querySelector(".js-errorbox-all") as HTMLElement | null;
    const errorItem = form.querySelector(".js-rule-error-all") as HTMLElement | null;
    if (errorItem) errorItem.textContent = message;
    if (errorBox) {
      errorBox.style.display = "block";
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const clearError = () => {
    const errorBox = form.querySelector(".js-errorbox-all") as HTMLElement | null;
    if (errorBox) errorBox.style.display = "none";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    clearError();

    const data = new FormData(form);
    const fullName = getText(data, "Name");
    const phone = getText(data, "Phone");
    const telegram = getText(data, "Telegram profili ochiq telefon raqam yoki Telegram username");
    const gender = getText(data, "Jinsingiz?");
    const ageGroup = getText(data, "yosh guruhi");
    const promoCode = getText(data, "PROMOKOD (Agar bo'lsa)");

    if (fullName.length < 2) {
      showError("Ism va familiyangizni kiriting.");
      return;
    }
    if (phone.length < 5) {
      showError("Telefon raqamingizni kiriting.");
      return;
    }

    const button = form.querySelector("button[type='submit']") as HTMLButtonElement | null;
    const buttonText = button?.querySelector(".t-btnflex__text") as HTMLElement | null;
    const originalText = buttonText?.textContent || "Yuborish";

    if (button) button.disabled = true;
    if (buttonText) buttonText.textContent = "Yuborilmoqda...";

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
      if (!response.ok) {
        throw new Error(result?.error || "Arizani yuborib bo‘lmadi.");
      }

      const inputs = form.querySelector(".t-form__inputsbox") as HTMLElement | null;
      const success = form.querySelector(".js-successbox") as HTMLElement | null;
      if (inputs) inputs.style.display = "none";
      if (success) {
        success.style.display = "block";
        success.innerHTML = "<div style='font-weight:700;margin-bottom:8px'>Rahmat!</div><div>Ma’lumotlaringizni qabul qilib oldik! Tez orada siz bilan bog‘lanamiz</div>";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Arizani yuborishda xatolik yuz berdi.");
    } finally {
      if (button) button.disabled = false;
      if (buttonText) buttonText.textContent = originalText;
    }
  }, true);
}

export default function LegacyApplicationFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sanitizedRef = useRef(false);

  const prepareFrame = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    if (!sanitizedRef.current) {
      sanitizedRef.current = true;

      // Let Tilda finish drawing the old page, then freeze that exact visual
      // state and remove every script. This removes Tilda Forms / captcha / bot
      // checks completely while keeping its HTML and CSS design intact.
      doc.querySelectorAll("script").forEach((node) => node.remove());
      doc.querySelectorAll("iframe[src*='captcha'], iframe[src*='recaptcha'], [class*='captcha'], [id*='captcha']").forEach((node) => node.remove());
      doc.querySelectorAll(".t-records").forEach((node) => node.classList.add("t-records_visible"));

      const form = doc.getElementById("form2119410573") as HTMLFormElement | null;
      if (form) {
        form.classList.remove("js-form-proccess", "js-form-proccessing");
        form.removeAttribute("data-formactiontype");
        form.removeAttribute("data-success-callback");
        form.removeAttribute("action");
        form.querySelectorAll("input[name='formservices[]'], .js-formaction-services").forEach((node) => node.remove());
      }

      const forceVisible = doc.createElement("style");
      forceVisible.textContent = `
        .t-records, .t-animate, .t396__elem { opacity: 1 !important; }
        .t-animate { transform: none !important; }
      `;
      doc.head.appendChild(forceVisible);

      const frozenHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      doc.open();
      doc.write(frozenHtml);
      doc.close();
      return;
    }

    installApplicationHandler(doc);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/tilda/ariza-qoldrish.html"
      title="Ariza qoldirish"
      onLoad={prepareFrame}
      className="block h-[100dvh] w-full border-0"
    />
  );
}
