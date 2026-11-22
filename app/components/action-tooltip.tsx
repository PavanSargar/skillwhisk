"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";

export function ActionTooltip({ children, label }: { children: ReactElement; label: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="style-tooltip action-tooltip" sideOffset={6} collisionPadding={12}>
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
