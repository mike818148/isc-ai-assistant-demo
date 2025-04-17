import { CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatusCardProps {
  status: "success" | "error"
  message: string
  className?: string
}

export default function StatusCard({ status, message, className }: StatusCardProps) {
  return (
    <Card className={cn("overflow-hidden", status === "success" ? "border-green-500" : "border-red-500", className)}>
      <div className={cn("h-2", status === "success" ? "bg-green-500" : "bg-red-500")} />
      <CardContent className="p-4 pt-4">
        <div className="flex items-start gap-3">
          {status === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h3 className={cn("font-medium text-sm mb-1", status === "success" ? "text-green-700" : "text-red-700")}>
              {status === "success" ? "Success" : "Error"}
            </h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
