"use client";

import { useState, useRef } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Define the access item type
type AccessItemType = "ROLE" | "ACCESS_PROFILE" | "ENTITLEMENT";

// Define the access item interface
interface AccessItem {
  id: string;
  name: string;
  _type: string;
  type: AccessItemType;
  _version?: string;
  description?: string;
}

// Function to get type display name
const getTypeDisplayName = (type: AccessItemType) => {
  switch (type) {
    case "ROLE":
      return "Role";
    case "ACCESS_PROFILE":
      return "Access Profile";
    case "ENTITLEMENT":
      return "Entitlement";
    default:
      return type;
  }
};

// Function to get type color
const getTypeColor = (type: AccessItemType) => {
  switch (type) {
    case "ROLE":
      return "bg-emerald-100 text-emerald-800";
    case "ACCESS_PROFILE":
      return "bg-blue-100 text-blue-800";
    case "ENTITLEMENT":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Update the AccessCard component to remove the avatar and version, and move the type tag to the top
const AccessCard = ({
  item,
  isSelected,
  onSelect,
}: {
  item: AccessItem;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <Card
      className={cn(
        "w-[300px] flex-shrink-0 cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant="outline"
            className={cn("text-xs", getTypeColor(item.type))}
          >
            {getTypeDisplayName(item.type)}
          </Badge>
          {isSelected && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-base line-clamp-2">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {item.id.substring(0, 8)}...
          </p>
          {item.description && (
            <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Update the SelectedItemsDetails component to remove version information
const SelectedItemsDetails = ({
  selectedItems,
  onClearSelection,
}: {
  selectedItems: AccessItem[];
  onClearSelection: () => void;
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="mt-8 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Selected Items ({selectedItems.length})
        </h2>
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
      <div className="space-y-4">
        {selectedItems.map((item) => (
          <div key={item.id} className="p-3 bg-slate-50 rounded-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {item.id}
                </p>
              </div>
              <Badge className={cn("text-xs", getTypeColor(item.type))}>
                {getTypeDisplayName(item.type)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Access Item Carousel Component
export default function AccessItemCarousel({
  accessItems,
  onSubmit,
}: {
  accessItems: AccessItem[];
  onSubmit?: (selectedItemIds: string[]) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<AccessItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle selection of an item
  const handleSelect = (item: AccessItem) => {
    if (selectedItems.some((selectedItem) => selectedItem.id === item.id)) {
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem.id !== item.id)
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === accessItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...accessItems]);
    }
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  // Handle scroll left
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Access Items</h2>
        {accessItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedItems.length === accessItems.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} of {accessItems.length} selected
            </span>
          </div>
        )}
      </div>

      {accessItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No access items available
        </div>
      ) : (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-sm hover:bg-white"
            onClick={handleScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <ScrollArea className="w-full">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 pb-4 pt-1 px-12"
            >
              {accessItems.map((item) => (
                <AccessCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.some(
                    (selectedItem) => selectedItem.id === item.id
                  )}
                  onSelect={() => handleSelect(item)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-sm hover:bg-white"
            onClick={handleScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-4 space-y-4">
          <SelectedItemsDetails
            selectedItems={selectedItems}
            onClearSelection={handleClearSelection}
          />
          {onSubmit && (
            <div className="flex justify-end">
              <Button
                onClick={() => onSubmit(selectedItems.map((item) => item.id))}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
