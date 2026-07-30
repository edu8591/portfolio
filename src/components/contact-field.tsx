"use client";

import {
  Controller,
  type Control,
  type ControllerRenderProps,
} from "react-hook-form";

import type { ContactMessage } from "@/lib/contact-message-schema";
import { Field, FieldError, FieldLabel } from "./ui";

/**
 * Everything a control needs to be controlled, labelled, and wired for
 * accessibility. Spread onto whichever element the field renders.
 */
export type ControlledFieldProps = ControllerRenderProps<ContactMessage> & {
  id: string;
  placeholder: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

export type ContactFieldProps = {
  control: Control<ContactMessage>;
  name: keyof ContactMessage;
  label: string;
  placeholder: string;
  error: string | undefined;
  children: (props: ControlledFieldProps) => React.ReactNode;
};

/**
 * One labelled, validated control of the contact form. The aria wiring lives
 * here once rather than once per field, so an accessibility fix is a single
 * edit rather than three that have to agree.
 *
 * A component, not a function called during `ContactForm`'s render: a component
 * redefined on every render remounts its subtree, which would drop the
 * Visitor's focus and caret on every keystroke.
 */
export const ContactField = ({
  control,
  name,
  label,
  placeholder,
  error,
  children,
}: ContactFieldProps) => {
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
