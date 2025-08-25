import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface Props extends ComponentProps<"input"> {
  name: string;
  error?: ReactNode;
  label?: ReactNode;
  fieldsetClassname?: ClassValue;
}

export const Input = ({
  className,
  name,
  error,
  label,
  children,
  fieldsetClassname,
  ...rest
}: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <fieldset className={cn("flex flex-col", fieldsetClassname)}>
      {label && (
        <label
          htmlFor={name}
          className="ml-6 mb-2 text-sm text-app-primary-foreground"
        >
          {label}
        </label>
      )}
      <span className="relative">
        <input
          className={cn(
            "text-app-secondary-foreground-muted w-full text-sm bg-app-secondary px-6 py-4 rounded-2xl outline-0 border border-white/10 focus:border-white/25 transition-all placeholder:text-sm",
            className
          )}
          {...rest}
          {...register(name)}
        />
        {children}
      </span>
      <AnimatePresence>
        {error ||
          (errors[name]?.message && (
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
                {error || (errors[name]?.message as ReactNode)}
              </motion.p>
            </motion.div>
          ))}
      </AnimatePresence>
    </fieldset>
  );
};
