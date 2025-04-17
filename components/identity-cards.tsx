"use client";

import { useState } from "react";
import { Mail, BadgeIcon as IdCard, Hash, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Identity {
  displayName: string;
  name: string;
  id: string;
  email: string;
  _type: string;
  type: string;
  _version: string;
}

interface IdentityCardsProps {
  identities: Identity[];
  onSubmit?: (identities: Identity[]) => void;
}

export function IdentityCards({ identities, onSubmit }: IdentityCardsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (identity: Identity) => {
    setSelectedIds((prev) => {
      // If already selected, remove it; otherwise, add it
      if (prev.includes(identity.id)) {
        return prev.filter((id) => id !== identity.id);
      } else {
        return [...prev, identity.id];
      }
    });
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const selectedIdentities = identities.filter((item) =>
        selectedIds.includes(item.id)
      );

      // Format the identities in markdown
      const markdownContent = `Request for below identities:\n\n${selectedIdentities
        .map(
          (identity) =>
            `- **${identity.displayName}** (${identity.name})\n  - Email: ${identity.email}\n  - ID: ${identity.id}`
        )
        .join("\n\n")}`;

      onSubmit(selectedIdentities);
    }
  };

  return (
    <div className="relative">
      {/* Selection counter and submit button */}
      {selectedIds.length > 0 && (
        <div className="absolute -top-10 right-0 flex items-center gap-2">
          <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedIds.length} selected
          </div>
          {onSubmit && (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
            >
              Submit
            </button>
          )}
        </div>
      )}

      {/* Scroll shadow indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Scrollable container */}
      <div className="flex overflow-x-auto pb-4 pt-2 px-2 -mx-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            isSelected={selectedIds.includes(identity.id)}
            onSelect={() => handleSelect(identity)}
          />
        ))}
      </div>
    </div>
  );
}

interface IdentityCardProps {
  identity: Identity;
  isSelected: boolean;
  onSelect: () => void;
}

function IdentityCard({ identity, isSelected, onSelect }: IdentityCardProps) {
  // Get initials from display name for the avatar
  const initials = identity.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      className={cn(
        "flex-shrink-0 w-72 mr-4 cursor-pointer transition-all overflow-hidden",
        "hover:shadow-md",
        isSelected ? "ring-2 ring-slate-900 shadow-md" : "ring-1 ring-slate-200"
      )}
      onClick={onSelect}
    >
      <CardHeader
        className={cn(
          "bg-slate-50 pb-2 relative",
          isSelected && "bg-slate-100"
        )}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <Avatar
            className={cn(
              "h-12 w-12 border-2",
              isSelected ? "border-slate-900" : "border-slate-200"
            )}
          >
            <AvatarFallback
              className={cn(
                "text-slate-700",
                isSelected ? "bg-slate-200" : "bg-slate-100"
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{identity.displayName}</h3>
            <Badge variant="outline" className="mt-1">
              <IdCard className="h-3 w-3 mr-1" />
              {identity.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="truncate">{identity.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500 truncate">
              {identity.id}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
