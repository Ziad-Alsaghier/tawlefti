import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-[0px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-yellow-400",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-300 ease-in-out data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[0px] peer-data-[state=checked]:scale-110 peer-data-[state=checked]:shadow-[0_0_8px_rgba(255,200,0,0.7)]"
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
