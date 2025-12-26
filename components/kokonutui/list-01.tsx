import { cn } from "@/lib/utils"
import { Ship, Navigation, Anchor, MapPin } from "lucide-react"

interface VesselItem {
  id: string
  name: string
  type: string
  status: "docked" | "arriving" | "departing" | "at-sea"
  eta?: string
  berth?: string
  flag: string
}

interface List01Props {
  vessels?: VesselItem[]
  className?: string
}

const VESSELS: VesselItem[] = [
  {
    id: "1",
    name: "MSC GÜLSÜN",
    type: "Container Ship",
    status: "docked",
    berth: "Berth 14",
    flag: "Panama",
  },
  {
    id: "2",
    name: "MAERSK ESSEX",
    type: "Container Ship",
    status: "arriving",
    eta: "2h 15m",
    flag: "Denmark",
  },
  {
    id: "3",
    name: "CMA CGM MARCO POLO",
    type: "Container Ship",
    status: "docked",
    berth: "Berth 8",
    flag: "United Kingdom",
  },
  {
    id: "4",
    name: "EVER GIVEN",
    type: "Container Ship",
    status: "departing",
    eta: "45m",
    flag: "Panama",
  },
  {
    id: "5",
    name: "COSCO SHIPPING UNIVERSE",
    type: "Container Ship",
    status: "at-sea",
    eta: "18h 30m",
    flag: "Hong Kong",
  },
]

const statusConfig = {
  docked: {
    label: "Docked",
    color: "text-primary bg-primary/10 border-primary/20",
    icon: Anchor,
  },
  arriving: {
    label: "Arriving",
    color: "text-accent bg-accent/10 border-accent/20",
    icon: Navigation,
  },
  departing: {
    label: "Departing",
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    icon: MapPin,
  },
  "at-sea": {
    label: "At Sea",
    color: "text-muted-foreground bg-muted border-border",
    icon: Ship,
  },
}

export default function List01({ vessels = VESSELS, className }: List01Props) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {vessels.map((vessel) => {
        const StatusIcon = statusConfig[vessel.status].icon
        return (
          <div
            key={vessel.id}
            className={cn(
              "group flex items-start gap-3 p-3 rounded-lg border border-border",
              "bg-card hover:bg-accent/5 transition-colors",
            )}
          >
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Ship className="w-4 h-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{vessel.name}</h3>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1",
                    statusConfig[vessel.status].color,
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[vessel.status].label}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">{vessel.type}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vessel.flag}
                </span>
                {vessel.berth && <span className="text-primary font-medium">{vessel.berth}</span>}
                {vessel.eta && <span className="text-accent font-medium">ETA: {vessel.eta}</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
