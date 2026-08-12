"use client";

import { useTranslations } from "next-intl";
import { Activity } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel, Input, Textarea } from "./ui";
import { errorMessageKey } from "@/lib/contact/error-message-key";

export const FormFieldInput = ({
  name,
  label,
  noError = false,
  placeholder,
  fieldType = "text",
  autoComplete = "off",
  textAreaRows = 5,
  hidden = false,
  id,
}: {
  name: string;
  label?: string;
  noError?: boolean;
  placeholder?: string;
  fieldType?: "text" | "email" | "textarea";
  autoComplete?: "name" | "email" | "off";
  textAreaRows?: number;
  hidden?: boolean;
  id?: string;
}) => {
  const tErrors = useTranslations("formErrors");
  const form = useFormContext();
  const isHidden = hidden ? "hidden" : "visible";

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const errorMessage = error
          ? tErrors(errorMessageKey(name, String(error.type)))
          : undefined;

        const fieldId = id || name;
        const errorId = `${fieldId}-error`;
        const showError = !noError && errorMessage;

        // Invalidity has to reach assistive technology, not just the eye: the
        // control announces it, and points at the message that explains it.
        const invalidProps = {
          "aria-invalid": showError ? true : undefined,
          "aria-describedby": showError ? errorId : undefined,
        };

        return (
          <Activity mode={isHidden}>
            <Field data-invalid={showError || undefined}>
              <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
              {fieldType === "textarea" ? (
                <Textarea
                  {...field}
                  {...invalidProps}
                  rows={textAreaRows}
                  className="resize-none"
                  id={fieldId}
                  aria-hidden={hidden}
                  placeholder={placeholder}
                />
              ) : (
                <Input
                  {...field}
                  {...invalidProps}
                  id={fieldId}
                  placeholder={placeholder}
                  type={fieldType}
                  autoComplete={autoComplete}
                  aria-hidden={hidden}
                  // A decoy must be unreachable by keyboard: a Visitor tabbing
                  // into it and typing would have their message silently
                  // discarded as bot traffic.
                  tabIndex={hidden ? -1 : undefined}
                />
              )}
              {showError && (
                <FieldError id={errorId}>{errorMessage}</FieldError>
              )}
            </Field>
          </Activity>
        );
      }}
    />
  );
};
