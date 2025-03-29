"use client";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Check, ChevronsUpDown, X } from "lucide-react";

import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Type definition for each option in the multi-select list.
export type MultiSelectOption = {
  value: string;
  label: string;
};

// Component props for the MultiSelect component.
export type MultiSelectProps = {
  options?: MultiSelectOption[];
  /** Controlled list of selected option values */
  value?: string[];
  /** Callback when the selection changes */
  onValueChange?: (newSelectedValues: string[]) => void;
  /** Placeholder text when no options are selected */
  placeholder?: string;
  variant?: BadgeProps["variant"];
  className?: string;
};

/**
 * MultiSelect component using a popover to display a searchable list of options.
 *
 * The component leverages Radix UI primitives and command components to build a
 * robust multi-select interface. When an option is clicked, it toggles its selected state.
 */
export function MultiSelect({
  options = [],
  value: controlledSelectedValues,
  onValueChange: onChange,
  placeholder,
  variant,
  className,
}: MultiSelectProps) {
  // useControllableState allows the component to be controlled or uncontrolled.
  // It is similar to playing in a band: you can follow a strict sheet (controlled) or improvise (uncontrolled).
  const [selectedValues = [], setSelectedValues] = useControllableState<
    string[]
  >({
    prop: controlledSelectedValues,
    defaultProp: [],
    onChange: (value) => {
      if (onChange) {
        onChange(value);
      }
    },
  });

  // State to control the open/closed state of the popover.
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  // State to hold the search/filter text.
  const [filterText, setFilterText] = React.useState<string>("");

  // Filter options based on the current search text (case-insensitive).
  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, options]);

  // Toggle selection for a given option.
  const toggleOptionSelection = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      setSelectedValues(
        selectedValues.filter((value) => value !== optionValue),
      );
    } else {
      setSelectedValues([...selectedValues, optionValue]);
    }
  };

  // Remove an option from the selection list.
  const removeSelectedOption = (optionValue: string) => {
    setSelectedValues(selectedValues.filter((value) => value !== optionValue));
  };

  // Get full option objects for the selected values.
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  return (
    <PopoverPrimitive.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div className="relative">
          <button
            className={cn(
              "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
              className,
            )}
            type="button"
          >
            <div className="flex flex-1 flex-wrap gap-2">
              {selectedOptions.length > 0 ? (
                // Display selected options as badges with an "X" icon to remove each.
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    className="h-full cursor-pointer"
                    variant={variant}
                    onClick={(event) => {
                      // Stop propagation to prevent closing the popover when removing an option.
                      event.stopPropagation();
                      removeSelectedOption(option.value);
                    }}
                  >
                    {option.label}
                    <X className="size-3" />
                  </Badge>
                ))
              ) : (
                // If no options are selected, display the placeholder.
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </button>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          )}
          style={
            {
              "--radix-select-content-transform-origin":
                "var(--radix-popper-transform-origin)",
              "--radix-select-content-available-width":
                "var(--radix-popper-available-width)",
              "--radix-select-content-available-height":
                "var(--radix-popper-available-height)",
              "--radix-select-trigger-width":
                "var(--radix-popper-anchor-width)",
              "--radix-select-trigger-height":
                "var(--radix-popper-anchor-height)",
            } as React.CSSProperties
          }
        >
          <Command
            className={cn(
              "max-h-96 w-full min-w-[var(--radix-select-trigger-width)] px-1",
            )}
          >
            {/* Search input to filter options */}
            <CommandInput
              placeholder="Filter"
              value={filterText}
              onValueChange={(newFilterText) => {
                setFilterText(newFilterText);
              }}
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      toggleOptionSelection(option.value);
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>{option.label}</span>
                      {/* Show check icon if the option is selected */}
                      {selectedValues.includes(option.value) && (
                        <Check className="size-4" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
