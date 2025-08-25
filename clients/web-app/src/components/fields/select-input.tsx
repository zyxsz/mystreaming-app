import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, type ComponentProps, type ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props<T extends FieldValues> extends ComponentProps<"select"> {
  name: Path<T>;
  label?: ReactNode;
  placeholder?: string;
  items: { value: string; label: ReactNode }[];
}

export const SelectInput = <T extends FieldValues>({
  className,
  name,

  label,
  children,

  placeholder,
  items,
  ...rest
}: Props<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <fieldset className="flex flex-col">
      {label && (
        <label
          htmlFor={name}
          className="ml-6 mb-2 text-sm text-app-primary-foreground"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            //@ts-ignore
            value={field.value as unknown as string}
            {...rest}
          >
            <SelectTrigger hasValue={!!field.value}>
              <SelectValue className="text-sm" placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="py-1">
              {items.length > 0 ? (
                items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))
              ) : (
                <p className="py-2 text-sm text-center select-none">
                  No results found.
                </p>
              )}
            </SelectContent>
          </Select>
        )}
      />
      <AnimatePresence>
        {errors[name] && (
          <motion.div
            variants={{
              initial: { height: 0, marginTop: 0 },
              animate: {
                height: "auto",
                marginTop: "0.5rem",
                transition: { delayChildren: 0.1 },
              },
              exit: {
                height: 0,
                marginTop: 0,
                transition: { when: "afterChildren" },
              },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            className="ml-6"
          >
            <motion.p
              variants={{
                initial: { opacity: 0, x: -16 },
                animate: { opacity: 1, x: 0 },
                exit: { x: -16, opacity: 0 },
              }}
              className="text-xs text-red-500"
            >
              {errors[name].message?.toString()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </fieldset>
  );
};
