import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Logo } from "./ui/logo";
import { Button } from "./ui/button";
import { Profile } from "./ui/profile";

export const Navbar = () => {
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    if (!window) return;

    function check() {
      const value = window.scrollY;

      console.log(value);

      if (value > 1) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    }

    window.addEventListener("scroll", check);

    return () => {
      window?.removeEventListener("scroll", check);
    };
  }, []);

  return (
    <motion.nav
      variants={{
        fixed: {
          y: ["-100%", 0],
          // transition: {
          //   bounce: 0.2,
          // },
        },
      }}
      initial="initial"
      animate={isFixed ? "fixed" : ""}
      className={cn(
        "absolute top-0 left-0 right-0 z-300 shadow-none flex items-center justify-center",
        isFixed && "fixed top-4"
      )}
      style={{ transition: "background 200ms linear" }}
    >
      <motion.div
        initial={{ maxWidth: 1600 }}
        animate={isFixed ? { maxWidth: 1024 } : { maxWidth: 1600 }}
        className={cn(
          "relative w-full h-full min-h-16 mx-auto flex items-center justify-center"
        )}
      >
        <div
          className={cn(
            "relative w-full p-8 py-4 flex gap-8 justify-between z-301",
            isFixed && "py-4"
          )}
        >
          <div className="w-full flex items-center gap-8">
            <Link to="/">
              <Logo />
            </Link>

            {/* <div
              className='h-8 bg-white/15 rounded-full'
              style={{ width: 2 }}
            /> */}

            <ul className="flex items-center gap-4">
              <li>
                <Button
                  variant="link"
                  size="sm"
                  className="text-sm text-app-primary-foreground-muted hover:text-app-primary-foreground text-nowrap"
                  asChild
                >
                  <Link to="/movies">Movies</Link>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  size="sm"
                  className="text-sm text-app-primary-foreground-muted hover:text-app-primary-foreground text-nowrap"
                  asChild
                >
                  <Link to="/movies">Shows</Link>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  size="sm"
                  className="text-sm text-app-primary-foreground-muted hover:text-app-primary-foreground text-nowrap"
                  asChild
                >
                  <Link to="/recommended">Recommended</Link>
                </Button>
              </li>
            </ul>
          </div>

          <div className="w-full flex items-center justify-end gap-8">
            <Profile />
          </div>
        </div>

        {isFixed ? (
          <div className="absolute inset-0 bg-app-primary/65 -z-1 backdrop-blur-lg rounded-2xl border border-white/10" />
        ) : (
          <motion.div
            key="bg-01"
            animate={{ opacity: [0, 1] }}
            className="fixed top-0 left-0 right-0 min-h-16 rounded-bl-2xl rounded-br-2xl"
            style={{
              zIndex: 29,

              background:
                "linear-gradient(180deg,rgba(25, 25, 30, 0.9) 10%, rgba(25, 25, 30, 0.57) 50%, rgba(25, 25, 30, 0) 100%)",
            }}
          />
        )}
      </motion.div>
    </motion.nav>
  );
};
