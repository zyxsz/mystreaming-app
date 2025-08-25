"use client";

import {
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AlertDialog as UIAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Spinner } from "./spinner";

interface Props {
  asChild?: boolean;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  cancelButton?: ReactNode;
  actionButton?: ReactNode;

  onAction?: <T>() => Promise<T | void>;

  dialogOpen?: boolean;
  setDialogOpen?: (value: boolean) => void;
  portal?: HTMLDivElement;
  actionButtonType?: HTMLButtonElement["type"];
}

export const AlertDialog = ({
  children,
  asChild,
  title,
  description,
  cancelButton,
  actionButton,
  onAction,
  dialogOpen,
  setDialogOpen,
  actionButtonType,
  portal,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionPending, startActionTransition] = useTransition();

  const handleConfirm = async (e: MouseEvent<HTMLButtonElement>) => {
    if (onAction) {
      e.preventDefault();

      startActionTransition(async () => {
        await onAction();

        setIsOpen(false);
      });
    }
  };

  return (
    <UIAlertDialog
      open={dialogOpen ?? isOpen}
      onOpenChange={setDialogOpen ?? setIsOpen}
    >
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent portalContainer={portal}>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelButton && (
            <AlertDialogCancel>{cancelButton}</AlertDialogCancel>
          )}
          {actionButton && (
            <AlertDialogAction
              onClick={(e) => handleConfirm(e)}
              disabled={isActionPending}
              type={actionButtonType || "button"}
            >
              {actionButton}
              {isActionPending && <Spinner />}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </UIAlertDialog>
  );
};
