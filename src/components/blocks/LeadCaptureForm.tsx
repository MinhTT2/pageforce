"use client";

import { Check, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { resolveSiteHref } from "@/lib/site-hrefs";
import type { LeadFormBlock } from "@/types/blocks";

type LeadCaptureFormProps = {
  blockId: string;
  props: LeadFormBlock["props"];
  // Absent in the builder (canvas and preview mode); only public /s routes supply
  // it, which is what arms real submission.
  pageId?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const inputClass =
  "pf-border h-11 rounded-(--pf-radius) border bg-transparent px-3 text-sm outline-none focus:border-(--pf-primary)";

export function LeadCaptureForm({ blockId, props, pageId }: LeadCaptureFormProps) {
  const [state, setState] = useState<SubmitState>("idle");

  const isCapture = props.deliveryMode === "capture";
  const isLive = Boolean(pageId);
  const legacyAction =
    props.deliveryMode === "mailto"
      ? resolveSiteHref(`mailto:${props.mailto || ""}`)
      : resolveSiteHref(props.actionUrl || "#");

  async function handleCaptureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLive || state === "submitting") {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("submitting");

    try {
      const response = await fetch(`/api/pages/${pageId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId,
          website: String(formData.get("website") ?? ""),
          data: {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            message: String(formData.get("message") ?? ""),
          },
        }),
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="grid content-center justify-items-start gap-3" role="status">
        <span className="pf-btn-primary inline-flex size-11 items-center justify-center rounded-(--pf-radius)">
          <Check className="size-5" />
        </span>
        <p className="pf-heading text-lg font-semibold">Thanks — message received.</p>
        <p className="pf-muted text-sm leading-6">We will get back to you shortly.</p>
      </div>
    );
  }

  const legacyFormProps = isLive
    ? { action: legacyAction, method: "post" as const }
    : { onSubmit: (event: FormEvent<HTMLFormElement>) => event.preventDefault() };

  return (
    <form
      {...(isCapture ? { onSubmit: handleCaptureSubmit } : legacyFormProps)}
      className="grid gap-4"
    >
      <label className="grid gap-2 text-sm font-medium">
        Name
        <input name="name" type="text" className={inputClass} placeholder="Your name" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea
          name="message"
          className="pf-border min-h-28 rounded-(--pf-radius) border bg-transparent px-3 py-2 text-sm outline-none focus:border-(--pf-primary)"
          placeholder="What are you building?"
        />
      </label>
      <input
        type="text"
        name="website"
        defaultValue=""
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="pf-btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-(--pf-radius) px-5 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : props.submitLabel}
        <Send className="size-4" />
      </button>
      {state === "error" ? (
        <p className="pf-muted text-sm" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
      {isCapture && !isLive ? (
        <p className="pf-muted text-xs">Form submits on your public page.</p>
      ) : null}
    </form>
  );
}
