import * as React from "react";
import { forwardRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

type ButtonWithLoaderProps = ButtonProps & {
  isPending: boolean;
  renderLoader?: React.ReactNode;
};

function ButtonWithLoaderContent({
  isHidden,
  children,
}: {
  isHidden: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden={isHidden}
      className={cn("col-start-1 row-start-1", isHidden && "invisible")}
    >
      {children}
    </span>
  );
}

const ButtonWithLoader = forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonWithLoaderProps
>(({ isPending, renderLoader, children, className, ...buttonProps }, ref) => {
  const isIdle = !isPending || !renderLoader;

  return (
    <Button ref={ref} className={cn("inline-grid", className)} {...buttonProps}>
      <ButtonWithLoaderContent isHidden={!isIdle}>
        {children}
      </ButtonWithLoaderContent>
      <ButtonWithLoaderContent isHidden={isIdle}>
        {renderLoader}
      </ButtonWithLoaderContent>
    </Button>
  );
});

ButtonWithLoader.displayName = "ButtonWithLoader";

export { ButtonWithLoader };
