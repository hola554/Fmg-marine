'use client'

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useJobs } from '@/lib/jobs-context'
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
import { CalendarIcon, Upload, X, Plus, Trash2, FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function JobsPage() {
  const { jobs, loading, updateStatus, updateEta, updateTerminal, updateConsignee, updateBlNumber, updateContainerSize, addJob, deleteJob, refreshJobs } = useJobs()
  const { toast } = useToast()

  // Create debounced versions of update functions with shorter delay
  const debouncedUpdateConsignee = useCallback(
    debounce(async (sn: number, value: string) => await updateConsignee(sn, value), 100),
    [updateConsignee]
  )
  const debouncedUpdateBlNumber = useCallback(
    debounce(async (sn: number, value: string) => await updateBlNumber(sn, value), 100),
    [updateBlNumber]
  )
  const debouncedUpdateContainerSize = useCallback(
    debounce(async (sn: number, value: string) => await updateContainerSize(sn, value), 100),
    [updateContainerSize]
  )

  const handleFileUpload = async (sn: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const supabase = createClient()
        const uploadedFiles = []

        try {
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `jobs/${sn}/${fileName}`

            // Upload file to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, file)

            if (uploadError) {
              console.error('Upload error:', uploadError)
              toast({
                title: "Upload Failed",
                description: `Failed to upload ${file.name}`,
                variant: "destructive",
              })
              continue
            }

            // Get signed URL (since bucket is private)
            const { data: urlData, error: signedUrlError } = await supabase.storage
              .from('documents')
              .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry

            if (signedUrlError || !urlData?.signedUrl) {
              console.error('Failed to get signed URL for:', filePath, signedUrlError)
              toast({
                title: "Upload Error",
                description: `Failed to generate access URL for ${file.name}`,
                variant: "destructive",
              })
              continue
            }

            uploadedFiles.push({
              name: file.name,
              url: urlData.signedUrl,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            })
          }

          if (uploadedFiles.length > 0) {
            // Update job with new files
            const job = jobs.find(j => j.sn === sn)
            if (!job) {
              toast({
                title: "Error",
                description: "Job not found",
                variant: "destructive",
              })
              return
            }
            const existingFiles = job.files || []
            const updatedFiles = [...existingFiles, ...uploadedFiles]

            // Update the job in database using the job ID (more reliable than sn)
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ files: updatedFiles })
              .eq('id', job.id)

            if (updateError) {
              console.error('Database update error:', updateError)
              toast({
                title: "Database Error",
                description: "Files uploaded but failed to save to database",
                variant: "destructive",
              })
            } else {
              toast({
                title: "Upload Successful",
                description: `${uploadedFiles.length} file(s) uploaded successfully`,
              })
              // Refresh jobs data
              await refreshJobs()
            }
          }
        } catch (error) {
          console.error('Upload error:', error)
          toast({
            title: "Upload Failed",
            description: "An error occurred during upload",
            variant: "destructive",
          })
        }
      }
    }
    input.click()
  }

  const addNewJob = async () => {
    const newSn = jobs.length > 0 ? Math.max(...jobs.map(job => job.sn)) + 1 : 1
    await addJob({
      sn: newSn,
      consignee: "",
      blNumber: "",
      containerSize: "",
      terminal: "Apapa",
      status: "pending",
      eta: undefined,
      refundStatus: 'pending'
    })
    toast({
      title: "New Job Added",
      description: `Job #${newSn} has been created. Please fill in the job details.`,
    })
  }

  const handleDeleteJob = async (sn: number) => {
    await deleteJob(sn)
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
            <p className="text-3xl font-bold text-white">{jobs.filter(job => job.status === 'pending' || job.status === 'eta').length}</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Completed Jobs</h3>
            <p className="text-3xl font-bold text-white">{jobs.filter(job => job.status === 'done').length}</p>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">Loading jobs...</p>
            </div>
          ) : (
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
                      onChange={(e) => debouncedUpdateConsignee(job.sn, e.target.value)}
                      className="w-[120px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={job.blNumber}
                      onChange={(e) => debouncedUpdateBlNumber(job.sn, e.target.value)}
                      className="w-[120px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={job.containerSize}
                      onChange={(e) => debouncedUpdateContainerSize(job.sn, e.target.value)}
                      className="w-[80px] h-9 rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={job.terminal} onValueChange={async (value) => await updateTerminal(job.sn, value)}>
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
                            onSelect={async (date) => await updateEta(job.sn, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Select value={job.status} onValueChange={async (value) => await updateStatus(job.sn, value)}>
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
                    <div className="flex items-center gap-2">
                      {job.files && job.files.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-cyan-400" />
                          <span className="text-zinc-300 text-sm">{job.files.length} file(s)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileUpload(job.sn)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1 h-6 w-6"
                            title="Upload more files"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-sm">No files</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileUpload(job.sn)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1 h-6 w-6"
                            title="Upload files"
                          >
                            <Upload className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.sn)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </div>
      </div>
    </Layout>
  )
}
