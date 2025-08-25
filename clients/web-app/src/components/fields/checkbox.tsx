import type { ComponentProps, ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface Props<T extends FieldValues> extends ComponentProps<typeof Checkbox> {
  name: Path<T>;
  multiple?: boolean;
  fieldsetClassname?: ClassValue;
  label?: ReactNode;
}

export const CheckboxInput = <T extends FieldValues>({
  name,
  multiple,
  fieldsetClassname,
  label,
  ...rest
}: Props<T>) => {
  const { control } = useFormContext();

  return (
    <fieldset className={cn("flex items-center gap-2", fieldsetClassname)}>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, name, onBlur, onChange, value } }) => {
          return (
            <Checkbox
              id={name}
              ref={ref}
              name={name}
              onBlur={onBlur}
              checked={!!value}
              onCheckedChange={(checked) => {
                return onChange(checked);
              }}
              {...rest}
            />
          );
        }}
      />
      {label && <label htmlFor={name}>{label}</label>}
    </fieldset>
  );
};
