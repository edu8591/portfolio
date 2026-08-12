"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as motion from "motion/react-client";

import { sendContactMessage } from "@/actions/contact";
import {
  contactMessageSchema,
  type ContactMessage,
} from "@/lib/contact-message-schema";
import { HONEYPOT_FIELD } from "@/constants/contact";
import { Button, FieldGroup } from "./ui";
import { MotionCard } from "./motion-card";
import { FormFieldInput } from "./FormFieldInput";
import { AnimatedTitle } from "./animated-title";

const VISIBLE_CONTACT_FIELDS = ["name", "email", "message"];

const createEmptyMessage = (): ContactMessage => ({
  name: "",
  email: "",
  message: "",
  renderedAt: new Date().toISOString(),
  website: undefined,
});

/**
 * The `type` given to a field the Server Action rejected. No Zod code matches
 * it, so it maps to the generic key — deliberately, since a flattened server
 * response carries no code precise enough to say more.
 */
const SERVER_REJECTED = "server-rejected";

function isVisibleContactField(field: string): field is keyof ContactMessage {
  return (VISIBLE_CONTACT_FIELDS as readonly string[]).includes(field);
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};
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
  const [isSent, setIsSent] = useState(false);

  const form = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: createEmptyMessage(),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  /**
   * The submit handler is `async` so react-hook-form's `isSubmitting` stays
   * true for as long as the action runs — that flag is what disables the
   * control, so nothing here may resolve before the send does.
   */
  const onSubmit = async (values: ContactMessage) => {
    const website =
      (document.getElementById(HONEYPOT_FIELD) as HTMLInputElement)?.value ??
      "";

    const result = await sendContactMessage({ ...values, website });

    if (result.status === "success") {
      setIsSent(true);
      return;
    }

    if (result.status === "invalid") {
      // The server disagreed with the client's own parse — normally
      // unreachable, since both run the same schema. It carries flattened
      // messages rather than issue codes, so there is nothing precise to
      // translate; the generic key is the honest answer. Surfaced on the
      // fields rather than as a form-level error, with every value kept.
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (isVisibleContactField(field) && messages?.length) {
          form.setError(field, { type: SERVER_REJECTED });
        }
      }
      return;
    }

    // A transport failure belongs to the form, not to any one field. `root`
    // errors clear themselves on the next submit, so there is no flag to reset.
    form.setError("root", { message: t("errorMessage") });
  };

  const sendAnother = () => {
    form.reset(createEmptyMessage());
    setIsSent(false);
  };

  return (
    <section className="mb-16" id="contact">
      <AnimatedTitle title={t("title")} />

      <motion.p
        variants={itemVariants}
        className="text-foreground/85 leading-relaxed text-base"
      >
        {t("description")}
      </motion.p>

      <MotionCard animateLayout={false}>
        {isSent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-start gap-4 py-4"
            data-testid="contact-success"
          >
            <h4 className="text-xl font-serif font-semibold text-foreground">
              {t("successTitle")}
            </h4>
            <p className="text-sm text-foreground/75">{t("successMessage")}</p>
            <Button type="button" size="lg" onClick={sendAnother}>
              {t("sendAnother")}
            </Button>
          </motion.div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormFieldInput
                    name="name"
                    label={t("nameLabel")}
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    id="contact-name"
                  />
                  <FormFieldInput
                    name="email"
                    label={t("emailLabel")}
                    placeholder={t("emailPlaceholder")}
                    fieldType="email"
                    autoComplete="email"
                    id="contact-email"
                  />
                </div>
                <FormFieldInput
                  name="message"
                  label={t("messageLabel")}
                  fieldType="textarea"
                  placeholder={t("messagePlaceholder")}
                  id="contact-message"
                />

                <FormFieldInput name="website" hidden noError />

                <div className="flex flex-col items-start gap-3 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? t("sending")
                      : t("submitButton")}
                  </Button>

                  {form.formState.errors.root && (
                    <p role="alert" className="text-sm text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  )}
                </div>
              </FieldGroup>
            </form>
          </FormProvider>
        )}
      </MotionCard>
    </section>
  );
};
