"use client"

import { Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div
      className={cn("flex gap-0.5 sm:gap-1", !readonly && "cursor-pointer")}
      onMouseLeave={() => !readonly && setHovered(0)}
      role={readonly ? "img" : "radiogroup"}
      aria-label={`Avaliacao: ${value} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered ? star <= hovered : star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={cn(
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5 sm:p-0",
              readonly && "cursor-default",
              !readonly && "active:scale-110"
            )}
            aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeMap[size],
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
