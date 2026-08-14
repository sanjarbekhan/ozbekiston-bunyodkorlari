"use client";

import { useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

function safeExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 8) return fromName;

  const byType: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return byType[file.type] || "bin";
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

    const submitWrap = submitButton?.closest(".t-form__submit") || submitButton?.parentElement;

    let attachmentInput = form.querySelector<HTMLInputElement>("[data-ozbye-attachment-input]");
    let attachmentMeta = form.querySelector<HTMLElement>("[data-ozbye-attachment-meta]");

    if (!attachmentInput) {
      const attachmentWrap = doc.createElement("div");
      attachmentWrap.setAttribute("data-ozbye-attachment", "1");
      attachmentWrap.style.margin = "24px 0 4px";
      attachmentWrap.innerHTML = `
        <label style="display:block;margin-bottom:8px;font-family:'PT Sans',Arial,sans-serif;font-size:18px;font-weight:600;color:#000">
          Fayl biriktirish <span style="font-size:14px;font-weight:400;color:#667085">(ixtiyoriy)</span>
        </label>
        <label style="display:flex;min-height:56px;align-items:center;justify-content:center;gap:10px;border:1px dashed #0043a4;border-radius:10px;background:#f7faff;padding:12px 16px;cursor:pointer;font-family:'PT Sans',Arial,sans-serif;font-size:15px;font-weight:700;color:#0043a4;text-align:center">
          <span>📎 Fayl tanlash</span>
          <input data-ozbye-attachment-input="1" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden" />
        </label>
        <div data-ozbye-attachment-meta="1" style="margin-top:8px;font-family:'PT Sans',Arial,sans-serif;font-size:13px;line-height:1.45;color:#667085">
          PDF, DOC, DOCX, JPG, PNG yoki WEBP · maksimal 10 MB
        </div>
      `;
      if (submitWrap) submitWrap.before(attachmentWrap);
      else form.appendChild(attachmentWrap);

      attachmentInput = attachmentWrap.querySelector<HTMLInputElement>("[data-ozbye-attachment-input]");
      attachmentMeta = attachmentWrap.querySelector<HTMLElement>("[data-ozbye-attachment-meta]");

      attachmentInput?.addEventListener("change", () => {
        const file = attachmentInput?.files?.[0];
        if (!attachmentMeta) return;
        if (!file) {
          attachmentMeta.textContent = "PDF, DOC, DOCX, JPG, PNG yoki WEBP · maksimal 10 MB";
          return;
        }
        const mb = (file.size / 1024 / 1024).toFixed(file.size >= 1024 * 1024 ? 1 : 2);
        attachmentMeta.textContent = `${file.name} · ${mb} MB`;
        attachmentMeta.style.color = "#0043a4";
        attachmentMeta.style.fontWeight = "700";
      });
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
      const attachment = attachmentInput?.files?.[0] || null;

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
      if (attachment && !ALLOWED_ATTACHMENT_TYPES.has(attachment.type)) {
        showError("Biriktiriladigan fayl PDF, DOC, DOCX, JPG, PNG yoki WEBP formatida bo‘lishi kerak.");
        return;
      }
      if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
        showError("Biriktiriladigan fayl hajmi 10 MB dan oshmasligi kerak.");
        return;
      }

      const button = form.querySelector("button.t-submit, button[type='button']") as HTMLButtonElement | null;
      const buttonText = button?.querySelector(".t-btnflex__text") as HTMLElement | null;
      const originalText = buttonText?.textContent || button?.textContent || "Yuborish";

      sending = true;
      if (button) button.disabled = true;
      if (buttonText) buttonText.textContent = attachment ? "Fayl yuklanmoqda..." : "Yuborilmoqda...";
      else if (button) button.textContent = attachment ? "Fayl yuklanmoqda..." : "Yuborilmoqda...";

      let attachmentPath = "";

      try {
        if (attachment) {
          const path = `applications/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${safeExtension(attachment)}`;
          const { error: uploadError } = await supabase.storage
            .from("application-files")
            .upload(path, attachment, {
              cacheControl: "3600",
              upsert: false,
              contentType: attachment.type,
            });

          if (uploadError) throw new Error("Faylni biriktirib bo‘lmadi: " + uploadError.message);
          attachmentPath = path;
          if (buttonText) buttonText.textContent = "Ariza yuborilmoqda...";
          else if (button) button.textContent = "Ariza yuborilmoqda...";
        }

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
            attachment_path: attachmentPath,
            attachment_name: attachment?.name || "",
            attachment_mime: attachment?.type || "",
            attachment_size: attachment?.size || 0,
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
        if (attachmentMeta) {
          attachmentMeta.textContent = "PDF, DOC, DOCX, JPG, PNG yoki WEBP · maksimal 10 MB";
          attachmentMeta.style.color = "#667085";
          attachmentMeta.style.fontWeight = "400";
        }
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
