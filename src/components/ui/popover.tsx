import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

import { motion, AnimatePresence } from "motion/react"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverPortal = PopoverPrimitive.Portal

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverPrimitive.Popup.Props & Pick<PopoverPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset">
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPortal>
    <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
      <PopoverPrimitive.Popup
        ref={ref}
        asChild
        data-slot="popover-content"
        className="z-50 outline-none"
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "w-72 overflow-hidden rounded-2xl bg-surface p-4 text-text shadow-md",
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Popup>
    </PopoverPrimitive.Positioner>
  </PopoverPortal>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal }
