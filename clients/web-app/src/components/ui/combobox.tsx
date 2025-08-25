import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Fragment,
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

import { CheckIcon, ChevronsUpDownIcon, SearchX } from "lucide-react";
import { Spinner } from "./spinner";
import type { ClassValue } from "clsx";

export type ComboboxItem = { value: string; label: ReactNode };

interface Props<T extends FieldValues> extends ComponentProps<"button"> {
  name: Path<T>;
  control?: Control<T>;
  error?: ReactNode;
  label?: ReactNode;
  placeholder?: string;
  inputPlaceholder?: string;
  defaultItems?: ComboboxItem[];
  onSearch?: (value: string) => Promise<ComboboxItem[]>;
  portalRef?: HTMLDivElement;
  contentClassname?: ClassValue;
  timeout?: number;
  fieldsetClassname?: ClassValue;
}

let searchTimeout: NodeJS.Timeout;

export const ComboboxInput = <T extends FieldValues>({
  className,
  name,
  error,
  label,
  inputPlaceholder,

  placeholder,
  defaultItems,
  onSearch,
  portalRef,
  contentClassname,
  timeout,
  fieldsetClassname,
}: Props<T>) => {
  const { control } = useFormContext();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(defaultItems || []);
  const [isSearchPending, startSearchTransition] = useTransition();

  const handleSearch = (value: string) => {
    if (!onSearch) return;

    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      startSearchTransition(async () => {
        const results = await onSearch(value);

        console.log(results);

        setItems(results);
      });
    }, timeout || 500);
  };

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
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "bg-app-secondary text-sm w-full justify-between",
                  field.value
                    ? "text-app-secondary-foreground"
                    : "text-app-secondary-foreground-muted",
                  className
                )}
              >
                {field.value
                  ? items.find((i) => i.value === field.value)?.label ||
                    placeholder
                  : placeholder}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              portalRef={portalRef}
              className={cn("p-2 rounded-2xl", contentClassname)}
              align="start"
            >
              <input
                className="bg-primary rounded-md border border-white/10 text-xs w-full p-2 outline-none"
                placeholder={inputPlaceholder}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {isSearchPending ? (
                <div className="w-full min-h-24 flex items-center justify-center flex-col">
                  <Spinner />
                </div>
              ) : (
                <div className="mt-2 max-h-72 overflow-y-auto">
                  {items.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {items.map((item) => (
                        <button
                          onClick={(e) => {
                            e.preventDefault();

                            field.onChange(
                              field.value === item.value
                                ? undefined
                                : item.value
                            );

                            setOpen(false);
                          }}
                          className={cn(
                            "w-full bg-app-primary text-xs text-app-primary-foreground-muted  [&_svg:not([class*='text-'])]:text-app-primary-foreground-muted  [&_svg:not([class*='text-'])]:hover:text-app-primary-foreground relative flex items-center gap-2 rounded-md px-2 py-1.5 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer hover:text-app-primary-foreground justify-between",
                            field.value === item.value &&
                              "text-app-secondary-foreground"
                          )}
                          key={item.value}
                        >
                          {item.label}
                          <CheckIcon
                            className={cn(
                              "transition-opacity",
                              field.value === item.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full min-h-32 flex items-center justify-center flex-col">
                      <SearchX className="size-8 text-app-primary-foreground" />
                      <h6 className="mt-2 text-sm text-app-primary-foreground">
                        Oooopss
                      </h6>
                      <p className="text-sm text-app-primary-foreground-muted">
                        No results found.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>
          // <Select
          //   onValueChange={field.onChange}
          //   //@ts-ignore
          //   value={field.value as unknown as string}
          //   {...rest}
          // >
          //   <SelectTrigger hasValue={!!field.value}>
          //     <SelectValue placeholder={placeholder} />
          //   </SelectTrigger>
          //   <SelectContent>
          //     {items.length > 0 ? (
          //       items.map((item) => (
          //         <SelectItem key={item.value} value={item.value}>
          //           {item.label}
          //         </SelectItem>
          //       ))
          //     ) : (
          //       <p className='py-2 text-sm text-center select-none'>
          //         No results found.
          //       </p>
          //     )}
          //   </SelectContent>
          // </Select>
        )}
      />
      <AnimatePresence>
        {error && (
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
              {error}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </fieldset>
  );
};
