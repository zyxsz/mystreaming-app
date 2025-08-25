import { cn } from "@/lib/utils";
import { BanIcon, CheckCheckIcon, XIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={"dark"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--app-secondary)",
          "--normal-text": "var(--app-secondary-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      icons={{
        success: <CheckCheckIcon />,
        error: <BanIcon />,
      }}
      toastOptions={{
        classNames: {
          icon: "!size-8 !flex !items-center !justify-content [&_svg]:!size-6 [&_>_div]:!size-6 [&_>_div]:!position-unset !mx-0",
          toast: cn(
            "font-sans items-start! border! border-white/10! bg-app-primary-button!"
          ),
          content: "!gap-0 !w-full",
          title: "!text-lg !font-black !text-app-primary-foreground",
          description:
            "!text-sm !font-regular !text-app-primary-foreground-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
