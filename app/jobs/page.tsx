'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import Layout from "@/components/kokonutui/layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Upload, X, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

type Job = {
  sn: number
  consignee: string
  blNumber: string
  containerSize: string
  terminal: string
  status: string
  eta: Date | undefined
  refundStatus: 'pending' | 'collected'
  files: string[]
}

const initialJobs: Job[] = [
  { sn: 1, consignee: "ABC Corp", blNumber: "BL123456", containerSize: "20ft", terminal: "Apapa", status: "pending", eta: new Date(), refundStatus: 'pending', files: [] },
  { sn: 2, consignee: "XYZ Ltd", blNumber: "BL789012", containerSize: "40ft", terminal: "TICT", status: "done", eta: new Date(Date.now() + 86400000), refundStatus: 'pending', files: [] },
  { sn: 3, consignee: "DEF Inc", blNumber: "BL345678", containerSize: "20ft", terminal: "Sifax terminal", status: "pending", eta: undefined, refundStatus: 'pending', files: [] },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const { toast } = useToast()

  const updateStatus = (sn: number, status: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, status } : job))
  }

  const updateEta = (sn: number, eta: Date | undefined) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, eta } : job))
  }

  const updateTerminal = (sn: number, terminal: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, terminal } : job))
  }

  const updateConsignee = (sn: number, consignee: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, consignee } : job))
  }

  const updateBlNumber = (sn: number, blNumber: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, blNumber } : job))
  }

  const updateContainerSize = (sn: number, containerSize: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, containerSize } : job))
  }

  const addFile = (sn: number, fileName: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, files: [...job.files, fileName] } : job))
  }

  const removeFile = (sn: number, fileName: string) => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, files: job.files.filter(f => f !== fileName) } : job))
  }

  const addNewJob = () => {
    const newSn = Math.max(...jobs.map(job => job.sn)) + 1
    const newJob: Job = {
      sn: newSn,
      consignee: "",
      blNumber: "",
      containerSize: "",
      terminal: "Apapa",
      status: "pending",
      eta: undefined,
      refundStatus: 'pending',
      files: []
    }
    setJobs([...jobs, newJob])
    toast({
      title: "New Job Added",
      description: `Job #${newSn} has been created. Please fill in the job details.`,
    })
  }

  const deleteJob = (sn: number) => {
    setJobs(jobs.filter(job => job.sn !== sn))
    toast({
      title: "Job Deleted",
      description: `Job #${sn} has been removed.`,
      variant: "destructive",
    })
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Jobs Management</h1>
            <p className="text-muted-foreground">Manage and track FMG Marine service jobs and vessel operations.</p>
          </div>
          <Button onClick={addNewJob} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Job
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-white">{jobs.filter(job => job.status === 'pending').length}</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Completed Jobs</h3>
            <p className="text-3xl font-bold text-white">{jobs.filter(job => job.status === 'done').length}</p>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-cyan-500">S/N</TableHead>
                <TableHead className="text-cyan-500">Consignee</TableHead>
                <TableHead className="text-cyan-500">BL Number</TableHead>
                <TableHead className="text-cyan-500">Container Size</TableHead>
                <TableHead className="text-cyan-500">Terminal</TableHead>
                <TableHead className="text-cyan-500">Status</TableHead>
                <TableHead className="text-cyan-500">Files</TableHead>
                <TableHead className="text-cyan-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.sn}>
                  <TableCell>{job.sn}</TableCell>
                  <TableCell>
                    <Input
                      value={job.consignee}
                      onChange={(e) => updateConsignee(job.sn, e.target.value)}
                      className="w-[120px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={job.blNumber}
                      onChange={(e) => updateBlNumber(job.sn, e.target.value)}
                      className="w-[120px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={job.containerSize}
                      onChange={(e) => updateContainerSize(job.sn, e.target.value)}
                      className="w-[80px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={job.terminal} onValueChange={(value) => updateTerminal(job.sn, value)}>
                      <SelectTrigger className="w-[140px] h-9 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="Apapa">Apapa</SelectItem>
                        <SelectItem value="TICT">TICT</SelectItem>
                        <SelectItem value="Sifax terminal">Sifax terminal</SelectItem>
                        <SelectItem value="BESTAF terminal">BESTAF terminal</SelectItem>
                        <SelectItem value="Fivestar">Fivestar</SelectItem>
                        <SelectItem value="Grilmaldi">Grilmaldi</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {job.status === "eta" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[130px] h-9 justify-start text-left font-normal rounded-lg text-xs px-2"
                          >
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {job.eta ? format(job.eta, "MMM dd, yyyy") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-lg" align="end">
                          <Calendar
                            mode="single"
                            selected={job.eta}
                            onSelect={(date) => updateEta(job.sn, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Select value={job.status} onValueChange={(value) => updateStatus(job.sn, value)}>
                        <SelectTrigger className={`w-[100px] h-9 rounded-lg font-medium ${job.status === 'done' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg" align="end">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="eta">ETA</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {job.files.length === 0 && (
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => addFile(job.sn, file.name));
                              e.target.value = '';
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button variant="outline" size="sm" className="w-full h-8 rounded-lg">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {job.files.map((file, index) => (
                          <div key={index} className="flex items-center bg-zinc-700 rounded px-2 py-1 text-xs">
                            <span className="truncate max-w-[120px]">{file}</span>
                            <button
                              onClick={() => removeFile(job.sn, file)}
                              className="ml-1 text-zinc-400 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {job.files.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Clear all files for this job
                            setJobs(jobs.map(j => j.sn === job.sn ? { ...j, files: [] } : j))
                          }}
                          className="w-full h-6 text-xs text-zinc-400 hover:text-zinc-200"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteJob(job.sn)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}
