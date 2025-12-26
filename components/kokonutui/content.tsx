import { Ship, Container, Anchor, TrendingUp, Package, Activity } from "lucide-react"
import List01 from "./list-01"
import List02 from "./list-02"
import List03 from "./list-03"

export default function Content() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Vessels</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">47</h3>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% this month
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Ship className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Containers</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">2,847</h3>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8% this week
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Container className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Transit</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">1,523</h3>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Real-time tracking
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <Package className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Berths Occupied</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">18/24</h3>
              <p className="text-xs text-muted-foreground mt-1">75% capacity</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Anchor className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Ship className="w-5 h-5 text-primary" />
            Vessel Status
          </h2>
          <div className="flex-1">
            <List01 />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Container className="w-5 h-5 text-primary" />
            Container Activity
          </h2>
          <div className="flex-1">
            <List02 />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Anchor className="w-5 h-5 text-primary" />
          Terminal Schedule
        </h2>
        <List03 />
      </div>
    </div>
  )
}
