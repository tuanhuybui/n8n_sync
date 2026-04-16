import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

const DropdownMenu = MenuPrimitive.Root

const DropdownMenuTrigger = MenuPrimitive.Trigger

const DropdownMenuPortal = MenuPrimitive.Portal

const DropdownMenuGroup = MenuPrimitive.Group

const DropdownMenuSub = MenuPrimitive.Root // Menu can be nested

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset">
>(({ className, sideOffset = 4, side = "bottom", align = "start", alignOffset = 0, ...props }, ref) => (
  <DropdownMenuPortal>
    <MenuPrimitive.Positioner 
      sideOffset={sideOffset} 
      side={side} 
      align={align} 
      alignOffset={alignOffset}
    >
      <MenuPrimitive.Popup
        ref={ref}
        data-slot="dropdown-menu-content"
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenuPrimitive.Positioner>
  </DropdownMenuPortal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  MenuPrimitive.Item.Props
>(({ className, ...props }, ref) => (
  <MenuPrimitive.Item
    ref={ref}
    data-slot="dropdown-menu-item"
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  MenuPrimitive.Separator.Props
>(({ className, ...props }, ref) => (
  <MenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
}
