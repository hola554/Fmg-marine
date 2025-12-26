import { cn } from "@/lib/utils"
import { Calendar, Clock, Ship } from "lucide-react"

interface ScheduleItem {
  id: string
  vessel: string
  operation: "arrival" | "departure"
  scheduledTime: string
  berth: string
  status: "on-time" | "delayed" | "early"
}

interface List03Props {
  schedule?: ScheduleItem[]
  className?: string
}

const SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    vessel: "MAERSK ESSEX",
    operation: "arrival",
    scheduledTime: "14:30",
    berth: "Berth 12",
    status: "on-time",
  },
  {
    id: "2",
    vessel: "EVER GIVEN",
    operation: "departure",
    scheduledTime: "15:45",
    berth: "Berth 8",
    status: "delayed",
  },
  {
    id: "3",
    vessel: "COSCO SHIPPING UNIVERSE",
    operation: "arrival",
    scheduledTime: "18:00",
    berth: "Berth 14",
    status: "on-time",
  },
  {
    id: "4",
    vessel: "MSC OSCAR",
    operation: "arrival",
    scheduledTime: "20:15",
    berth: "Berth 6",
    status: "early",
  },
]

const statusConfig = {
  "on-time": {
    label: "On Time",
    color: "text-primary bg-primary/10",
  },
  delayed: {
    label: "Delayed",
    color: "text-destructive bg-destructive/10",
  },
  early: {
    label: "Early",
    color: "text-green-500 bg-green-500/10",
  },
}

export default function List03({ schedule = SCHEDULE, className }: List03Props) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex gap-4 min-w-full p-1">
        {schedule.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex flex-col w-[280px] shrink-0",
              "bg-card rounded-lg border border-border",
              "hover:border-primary/50 transition-colors p-4 space-y-3",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Ship className="w-4 h-4 text-primary" />
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium capitalize",
                    item.operation === "arrival" ? "bg-accent/10 text-accent" : "bg-yellow-500/10 text-yellow-500",
                  )}
                >
                  {item.operation}
                </span>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusConfig[item.status].color)}>
                {statusConfig[item.status].label}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{item.vessel}</h3>
              <p className="text-xs text-primary font-medium">{item.berth}</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium text-foreground">{item.scheduledTime}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Today</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
