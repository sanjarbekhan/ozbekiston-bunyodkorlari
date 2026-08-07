"use client";

import { useCallback, useRef } from "react";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export default function LegacyApplicationFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const wireForm = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    const legacyForm = doc.getElementById("form2119410573") as HTMLFormElement | null;
    if (!legacyForm || legacyForm.dataset.supabaseBridge === "1") return;

    // Clone the form so every listener previously attached by Tilda to the
    // form or its children is discarded, while the original HTML/CSS stays identical.
    const form = legacyForm.cloneNode(true) as HTMLFormElement;
    form.dataset.supabaseBridge = "1";
    form.id = "ozbyeApplicationForm";
    form.name = "ozbyeApplicationForm";
    form.classList.remove("js-form-proccess", "js-form-proccessing");
    form.removeAttribute("data-formactiontype");
    form.removeAttribute("data-success-callback");
    form.removeAttribute("action");
    form.querySelectorAll("input[name='formservices[]'], .js-formaction-services").forEach((node) => node.remove());
    legacyForm.replaceWith(form);

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

    const submitToOzbye = async () => {
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
        if (!response.ok) throw new Error(result?.error || "Arizani yuborib bo‘lmadi.");

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
    };

    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        void submitToOzbye();
      },
      true,
    );

    // Extra protection against delegated Tilda click handlers.
    const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement | null;
    submitButton?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        void submitToOzbye();
      },
      true,
    );
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
