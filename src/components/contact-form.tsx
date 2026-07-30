"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as motion from "motion/react-client";

import { sendContactMessage } from "@/actions/contact";
import { contactMessageSchema, type ContactMessage } from "@/lib/contact-message-schema";
import { errorMessageKey } from "@/lib/contact/error-message-key";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD } from "@/lib/contact/submit-contact-message";
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from "./ui";
import { MotionCard } from "./motion-card";
import { Title } from "./title";

const EMPTY_MESSAGE: ContactMessage = { name: "", email: "", message: "" };

/**
 * The Visitor's contact form.
 *
 * Client validation uses the same schema as the Server Action, but only as a
 * courtesy — the action re-parses everything, because it is the trust boundary
 * and nothing the browser did counts as evidence.
 *
 * Per ADR-0001 the form is replaced by a persistent success state only after
 * the action confirms a send. Every failure path leaves the typed values
 * untouched, since nothing persists a Contact Message and the fields are the
 * Visitor's only copy.
 */
export const ContactForm = () => {
  const t = useTranslations("contact");
  const tErrors = useTranslations("contact.errors");
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Captured on mount rather than at submit, so the too-fast guard measures how
  // long the Visitor actually had the form in front of them. It resets with the
  // form, so a second message is timed from when its empty form appeared.
  const [renderedAt, setRenderedAt] = useState(() => new Date().toISOString());

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: EMPTY_MESSAGE,
    // The schema's transforms (trim, lowercase) run during validation, so the
    // values handed to the action are already normalised.
    mode: "onSubmit",
  });

  const onSubmit = (values: ContactMessage, event?: React.BaseSyntheticEvent) => {
    setSubmitError(false);

    // The honeypot is deliberately outside react-hook-form's control — the form
    // element itself is the only thing that needs to know a bot filled it in.
    const honeypot = event?.target instanceof HTMLFormElement
      ? new FormData(event.target).get(HONEYPOT_FIELD)
      : null;

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("message", values.message);
    formData.set(HONEYPOT_FIELD, typeof honeypot === "string" ? honeypot : "");
    formData.set(RENDERED_AT_FIELD, renderedAt);

    startTransition(async () => {
      const result = await sendContactMessage(formData);

      if (result.status === "success") {
        setIsSent(true);
        return;
      }

      if (result.status === "invalid") {
        // The server disagreed with the client's own parse. Surface it on the
        // fields rather than as a generic error, and keep every value.
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in EMPTY_MESSAGE && messages?.length) {
            setError(field as keyof ContactMessage, {
              message: tErrors("invalid"),
            });
          }
        }
        return;
      }

      setSubmitError(true);
    });
  };

  const sendAnother = () => {
    reset(EMPTY_MESSAGE);
    setRenderedAt(new Date().toISOString());
    setIsSent(false);
    setSubmitError(false);
  };

  /**
   * The message to show under a field.
   *
   * The Zod resolver stores the issue code as the error's `type` and Zod's
   * untranslated English as its `message`, so the code is what gets translated
   * here. Errors set from the action's response carry no code and are already
   * translated, so their message is used as-is.
   */
  const fieldError = (field: keyof ContactMessage): string | undefined => {
    const error = errors[field];

    if (!error) {
      return undefined;
    }

    if (typeof error.type !== "string") {
      return error.message;
    }

    return tErrors(errorMessageKey({ code: error.type, path: [field], message: "" }));
  };

  return (
    <section className="mb-16" id="contact">
      <Title>{t("title")}</Title>

      <p className="text-sm sm:text-base leading-relaxed text-foreground/75 mb-8">
        {t("description")}
      </p>

      <MotionCard>
        {isSent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-start gap-4 py-4"
            data-testid="contact-success"
          >
            <h4 className="text-lg font-semibold text-foreground">
              {t("successTitle")}
            </h4>
            <p className="text-sm text-foreground/75">{t("successMessage")}</p>
            <Button type="button" size="lg" onClick={sendAnother}>
              {t("sendAnother")}
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="contact-name">{t("nameLabel")}</FieldLabel>
                      <Input
                        {...field}
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        placeholder={t("namePlaceholder")}
                        aria-invalid={fieldState.invalid || undefined}
                        aria-describedby={
                          fieldState.invalid ? "contact-name-error" : undefined
                        }
                      />
                      <FieldError id="contact-name-error">
                        {fieldError("name")}
                      </FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="contact-email">{t("emailLabel")}</FieldLabel>
                      <Input
                        {...field}
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t("emailPlaceholder")}
                        aria-invalid={fieldState.invalid || undefined}
                        aria-describedby={
                          fieldState.invalid ? "contact-email-error" : undefined
                        }
                      />
                      <FieldError id="contact-email-error">
                        {fieldError("email")}
                      </FieldError>
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="message"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="contact-message">
                      {t("messageLabel")}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="contact-message"
                      rows={5}
                      placeholder={t("messagePlaceholder")}
                      className="resize-none"
                      aria-invalid={fieldState.invalid || undefined}
                      aria-describedby={
                        fieldState.invalid ? "contact-message-error" : undefined
                      }
                    />
                    <FieldError id="contact-message-error">
                      {fieldError("message")}
                    </FieldError>
                  </Field>
                )}
              />

              {/*
                The decoy. Hidden from Visitors and assistive technology alike,
                but a real focusable-free input a bot will happily fill in.
              */}
              <input
                type="text"
                name={HONEYPOT_FIELD}
                defaultValue=""
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="flex flex-col items-start gap-3 pt-2">
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? t("sending") : t("submitButton")}
                </Button>

                {submitError && (
                  <p role="alert" className="text-sm text-destructive">
                    {t("errorMessage")}
                  </p>
                )}
              </div>
            </FieldGroup>
          </form>
        )}
      </MotionCard>
    </section>
  );
};
