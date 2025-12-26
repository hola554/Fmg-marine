import { cn } from "@/lib/utils"
import { Package, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"

interface ContainerActivity {
  id: string
  containerId: string
  action: "loaded" | "unloaded" | "inspected" | "cleared"
  timestamp: string
  vessel?: string
  quantity: number
}

interface List02Props {
  activities?: ContainerActivity[]
  className?: string
}

const ACTIVITIES: ContainerActivity[] = [
  {
    id: "1",
    containerId: "MSCU4567890",
    action: "loaded",
    timestamp: "12 min ago",
    vessel: "MSC GÜLSÜN",
    quantity: 45,
  },
  {
    id: "2",
    containerId: "MAEU7654321",
    action: "unloaded",
    timestamp: "28 min ago",
    vessel: "MAERSK ESSEX",
    quantity: 38,
  },
  {
    id: "3",
    containerId: "CMAU1234567",
    action: "inspected",
    timestamp: "1 hour ago",
    vessel: "CMA CGM MARCO POLO",
    quantity: 12,
  },
  {
    id: "4",
    containerId: "EGLV9876543",
    action: "cleared",
    timestamp: "2 hours ago",
    vessel: "EVER GIVEN",
    quantity: 67,
  },
  {
    id: "5",
    containerId: "COSU5432109",
    action: "loaded",
    timestamp: "3 hours ago",
    vessel: "COSCO SHIPPING",
    quantity: 29,
  },
]

const actionConfig = {
  loaded: {
    label: "Loaded",
    icon: TrendingUp,
    color: "text-primary",
  },
  unloaded: {
    label: "Unloaded",
    icon: TrendingDown,
    color: "text-accent",
  },
  inspected: {
    label: "Inspected",
    icon: Package,
    color: "text-yellow-500",
  },
  cleared: {
    label: "Cleared",
    icon: ArrowRight,
    color: "text-green-500",
  },
}

export default function List02({ activities = ACTIVITIES, className }: List02Props) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {activities.map((activity) => {
        const ActionIcon = actionConfig[activity.action].icon
        return (
          <div
            key={activity.id}
            className={cn(
              "group flex items-center gap-3 p-3 rounded-lg border border-border",
              "bg-card hover:bg-accent/5 transition-colors",
            )}
          >
            <div className={cn("p-2 rounded-lg", `bg-${actionConfig[activity.action].color.split("-")[1]}/10`)}>
              <ActionIcon className={cn("w-4 h-4", actionConfig[activity.action].color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground font-mono">{activity.containerId}</h3>
                <span className="text-xs text-muted-foreground shrink-0">{activity.timestamp}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs font-medium", actionConfig[activity.action].color)}>
                  {actionConfig[activity.action].label}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground truncate">{activity.vessel}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-medium text-foreground">{activity.quantity} units</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
