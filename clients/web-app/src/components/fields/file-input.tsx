import type { ComponentProps } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface Props<T extends FieldValues> extends ComponentProps<"input"> {
  name: Path<T>;
  control: Control<T>;
  multiple?: boolean;
}

export const FileInput = <T extends FieldValues>({
  name,
  control,
  multiple,
  ...rest
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, name, onBlur, onChange } }) => {
        return (
          <input
            type="file"
            ref={ref}
            name={name}
            onBlur={onBlur}
            multiple={multiple}
            {...rest}
            onChange={(e) => {
              if (multiple) {
                onChange(e.target.files ? Array.from(e.target.files) : null);
              } else {
                const file = e.target.files?.[0];
                onChange(file ? file : null);
              }
            }}
          />
        );
      }}
    />
  );
};
