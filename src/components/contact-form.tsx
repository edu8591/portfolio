"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Controller,
  useForm,
  type Control,
  type ControllerRenderProps,
} from "react-hook-form";
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

const CONTACT_FIELDS = ["name", "email", "message"] as const;

const EMPTY_MESSAGE: ContactMessage = { name: "", email: "", message: "" };

/**
 * The `type` given to a field the Server Action rejected. No Zod code matches
 * it, so it maps to the generic key — deliberately, since a flattened server
 * response carries no code precise enough to say more.
 */
const SERVER_REJECTED = "server-rejected";

function isContactField(field: string): field is keyof ContactMessage {
  return (CONTACT_FIELDS as readonly string[]).includes(field);
}

/**
 * Everything a control needs to be controlled, labelled, and wired for
 * accessibility. Spread onto whichever element the field renders.
 */
type ControlledFieldProps = ControllerRenderProps<ContactMessage> & {
  id: string;
  placeholder: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

/**
 * One labelled, validated control. The aria wiring lives here once rather than
 * once per field, so an accessibility fix is a single edit rather than three
 * that have to agree.
 *
 * Module-scoped, not nested in `ContactForm`: a component redefined on every
 * render remounts its subtree, which would drop the Visitor's focus and caret
 * on every keystroke.
 */
const ContactField = ({
  control,
  name,
  label,
  placeholder,
  error,
  children,
}: {
  control: Control<ContactMessage>;
  name: keyof ContactMessage;
  label: string;
  placeholder: string;
  error: string | undefined;
  children: (props: ControlledFieldProps) => React.ReactNode;
}) => {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {/*
            `field` carries the value and change handlers; the render prop
            supplies only what differs between a text input and a textarea.
          */}
          {children({
            ...field,
            id,
            placeholder,
            "aria-invalid": fieldState.invalid || undefined,
            "aria-describedby": fieldState.invalid ? errorId : undefined,
          })}
          <FieldError id={errorId}>{error}</FieldError>
        </Field>
      )}
    />
  );
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
        // The server disagreed with the client's own parse — normally
        // unreachable, since both run the same schema. It carries flattened
        // messages rather than issue codes, so there is nothing precise to
        // translate; the generic key is the honest answer. Surfaced on the
        // fields rather than as a form-level error, with every value kept.
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (isContactField(field) && messages?.length) {
            setError(field, { type: SERVER_REJECTED });
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
   * untranslated English as its `message`, so the code — never the message — is
   * what reaches the Visitor, translated. An unrecognised code maps to the
   * generic key, which is what a server rejection resolves to.
   */
  const fieldError = (field: keyof ContactMessage): string | undefined => {
    const error = errors[field];

    return error ? tErrors(errorMessageKey(field, String(error.type))) : undefined;
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
                <ContactField
                  control={control}
                  name="name"
                  label={t("nameLabel")}
                  placeholder={t("namePlaceholder")}
                  error={fieldError("name")}
                >
                  {(props) => <Input {...props} type="text" autoComplete="name" />}
                </ContactField>

                <ContactField
                  control={control}
                  name="email"
                  label={t("emailLabel")}
                  placeholder={t("emailPlaceholder")}
                  error={fieldError("email")}
                >
                  {(props) => <Input {...props} type="email" autoComplete="email" />}
                </ContactField>
              </div>

              <ContactField
                control={control}
                name="message"
                label={t("messageLabel")}
                placeholder={t("messagePlaceholder")}
                error={fieldError("message")}
              >
                {(props) => <Textarea {...props} rows={5} className="resize-none" />}
              </ContactField>

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
