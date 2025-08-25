import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "outline-none w-fit flex items-center justify-center rounded-2xl text-base transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed [&_svg]:transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-app-primary-button hover:bg-app-primary-button-hover text-app-primary-foreground hover:text-app-primary-foreground-muted border border-white/10 hover:border-white/25",
        secundary:
          "bg-app-primary hover:bg-app-primary-hover text-app-primary-foreground hover:text-app-primary-foreground-muted border border-white/10 hover:border-white/25",
        link: "text-app-primary-foreground-muted hover:underline hover:text-app-primary-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        white:
          "bg-app-primary-foreground text-black hover:brightness-75 hover:bg-app-primary-foreground-hover hover:text-black [&_svg.fill]:fill-black",
      },
      size: {
        default: "text-sm gap-4 py-4 px-8 [&_svg]:size-6",
        icon: "py-4 px-4 [&_svg]:size-6",
        link: "gap-2 text-sm [&_svg]:size-4",
        sm: "py-2 px-4 text-xs gap-2 [&_svg]:size-4 rounded-lg",
        md: "py-3 px-6 text-sm gap-3 [&_svg]:size-5 rounded-xl",
        iconSm: "py-3 px-3 [&_svg]:size-4",
        iconXs: "rounded-xl py-2 px-2 [&_svg]:size-4",
      },
      color: {
        default: "",
        white:
          "bg-app-primary-foreground text-black hover:brightness-75 hover:bg-app-primary-foreground-hover hover:text-black [&_svg.fill]:fill-black",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

// type Props = ComponentProps<"button"> & {
//   children: ReactNode;
//   asChild?: boolean;
// };

// export const Button = ({ children, className, asChild, ...rest }: Props) => {
//   const Element = asChild ? Slot : "button";

//   return (
//     <Element
//       className={cn(
//         "",
//         className
//       )}
//       {...rest}
//     >
//       {children}
//     </Element>
//   );
// };
