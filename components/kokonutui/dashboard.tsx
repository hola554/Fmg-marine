'use client'

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, FileText, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { useJobs } from "@/lib/jobs-context"

export default function Dashboard() {
  const { jobs, loading } = useJobs()

  const totalJobs = jobs.length
  const activeJobs = jobs.filter(job => job.status === 'pending').length
  const completedJobs = jobs.filter(job => job.status === 'done').length
  const pendingRefunds = jobs.filter(job => job.status === 'done' && job.refundStatus === 'pending').length
  const collectedRefunds = jobs.filter(job => job.status === 'done' && job.refundStatus === 'collected').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
          Live Data
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-500">Total Jobs</CardTitle>
            <Users className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">All registered jobs</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-500">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">Jobs in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-500">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-500">Pending Refunds</CardTitle>
            <span className="text-lg font-bold text-cyan-500">₦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingRefunds}</div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-cyan-500">Job Status Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Current status of all jobs and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Active Jobs</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">{activeJobs}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Completed Jobs</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">{completedJobs}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Pending Refunds</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">{pendingRefunds}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Collected Refunds</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">{collectedRefunds}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-cyan-500">System Information</CardTitle>
            <CardDescription>Vital system stats and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Total Terminals</span>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">6</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Container Types</span>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Active Consignees</span>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">{new Set(jobs.map(job => job.consignee)).size}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">System Status</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Operational</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
