'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useJobs, Job } from '@/lib/jobs-context'
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
import { CalendarIcon, Upload, Plus, Trash2, FileText, ChevronDown, Eye, Download, Edit, Trash, Check, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

export default function JobsPage() {
  const {
    jobs,
    loading,
    updateStatus,
    updateEta,
    updateTerminal,
    updateConsignee,
    updateBlNumber,
    updateContainerSize,
    addJob,
    deleteJob,
    refreshJobs
  } = useJobs()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      job.sn.toString().includes(query) ||
      (job.consignee || '').toLowerCase().includes(query) ||
      (job.blNumber || '').toLowerCase().includes(query) ||
      (job.containerSize || '').toLowerCase().includes(query) ||
      (job.terminal || '').toLowerCase().includes(query) ||
      (job.status || '').toLowerCase().includes(query) ||
      (job.refundStatus || '').toLowerCase().includes(query) ||
      (job.eta && format(job.eta, "MMM dd yyyy").toLowerCase().includes(query)) ||
      (job.files && job.files.some(file => (file.name || '').toLowerCase().includes(query)))
    )
  })

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

            const { data: urlData, error: signedUrlError } = await supabase.storage
              .from('documents')
              .createSignedUrl(filePath, 60 * 60 * 24 * 7)

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
              storageName: fileName,
              url: urlData.signedUrl,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            })
          }

          if (uploadedFiles.length > 0) {
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

  const [terminals, setTerminals] = useState(["Apapa", "TICT", "Sifax terminal", "BESTAF terminal", "Fivestar", "Grilmaldi"])
  const [openTerminal, setOpenTerminal] = useState<Record<number, boolean>>({})
  const [terminalInput, setTerminalInput] = useState<Record<number, string>>({})

  const handleViewFile = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDownloadFile = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
  }

  const handleRenameFile = async (jobId: string, oldName: string, newName: string, jobSn: number) => {
    if (!newName.trim()) return
    const supabase = createClient()
    const job = jobs.find(j => j.id === jobId)
    if (!job || !job.files) return
    const fileToRename = job.files.find(f => f.name === oldName)
    if (!fileToRename) return

    const oldPath = `jobs/${jobSn}/${fileToRename.storageName}`
    const newStorageName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${newName.split('.').pop()}`
    const newPath = `jobs/${jobSn}/${newStorageName}`

    const { error: copyError } = await supabase.storage.from('documents').copy(oldPath, newPath)
    if (copyError) {
      toast({ title: "Rename Failed", description: "Failed to copy file", variant: "destructive" })
      return
    }
    const { error: deleteError } = await supabase.storage.from('documents').remove([oldPath])
    if (deleteError) {
      toast({ title: "Rename Failed", description: "Failed to delete old file", variant: "destructive" })
      return
    }
    const updatedFiles = job.files.map(f => f.name === oldName ? { ...f, name: newName, storageName: newStorageName } : f)
    const { error: updateError } = await supabase.from('jobs').update({ files: updatedFiles }).eq('id', jobId)
    if (updateError) {
      toast({ title: "Rename Failed", description: "Failed to update database", variant: "destructive" })
    } else {
      await refreshJobs()
      toast({ title: "Renamed", description: "File renamed successfully" })
    }
  }

  const handleDeleteFile = async (jobId: string, fileName: string, jobSn: number) => {
    const supabase = createClient()
    const job = jobs.find(j => j.id === jobId)
    if (!job || !job.files) return
    const fileToDelete = job.files.find(f => f.name === fileName)
    if (!fileToDelete) return

    const filePath = `jobs/${jobSn}/${fileToDelete.storageName}`
    const { error: deleteError } = await supabase.storage.from('documents').remove([filePath])
    if (deleteError) {
      toast({ title: "Delete Failed", description: "Failed to delete file", variant: "destructive" })
      return
    }
    const updatedFiles = job.files.filter(f => f.name !== fileName)
    const { error: updateError } = await supabase.from('jobs').update({ files: updatedFiles }).eq('id', jobId)
    if (updateError) {
      toast({ title: "Delete Failed", description: "Failed to update database", variant: "destructive" })
    } else {
      await refreshJobs()
      toast({ title: "Deleted", description: "File deleted successfully" })
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Jobs Management</h1>
            <p className="text-muted-foreground">Manage and track FMG Marine service jobs and vessel operations.</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] h-10 rounded-lg bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
            />
            <Button onClick={addNewJob} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Job
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-white">{filteredJobs.filter(job => job.status === 'pending' || job.status === 'eta').length}</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Completed Jobs</h3>
            <p className="text-3xl font-bold text-white">{filteredJobs.filter(job => job.status === 'done').length}</p>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 overflow-x-auto">
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
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.sn}</TableCell>
                    <TableCell>
                      <Input
                        value={job.consignee}
                        onChange={(e) => updateConsignee(job.sn, e.target.value)}
                        className="w-[140px] h-9 rounded-lg"
                        placeholder="Consignee name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={job.blNumber}
                        onChange={(e) => updateBlNumber(job.sn, e.target.value)}
                        className="w-[140px] h-9 rounded-lg"
                        placeholder="BL number"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={job.containerSize}
                        onChange={(e) => updateContainerSize(job.sn, e.target.value)}
                        className="w-[100px] h-9 rounded-lg"
                        placeholder="Size"
                      />
                    </TableCell>
                    <TableCell>
                      <Popover open={openTerminal[job.sn]} onOpenChange={(open) => setOpenTerminal(prev => ({ ...prev, [job.sn]: open }))}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTerminal[job.sn]}
                            className="w-[160px] h-9 justify-between rounded-lg"
                          >
                            <span className="truncate">{job.terminal || "Select terminal..."}</span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search terminal..."
                              value={terminalInput[job.sn] || ""}
                              onValueChange={(value) => setTerminalInput(prev => ({ ...prev, [job.sn]: value }))}
                            />
                            <CommandEmpty>No terminal found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {terminals.map((terminal) => (
                                  <CommandItem
                                    key={terminal}
                                    value={terminal}
                                    onSelect={(currentValue) => {
                                      updateTerminal(job.sn, currentValue)
                                      setOpenTerminal(prev => ({ ...prev, [job.sn]: false }))
                                      setTerminalInput(prev => ({ ...prev, [job.sn]: "" }))
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        job.terminal === terminal ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {terminal}
                                  </CommandItem>
                                ))}
                                {terminalInput[job.sn] && !terminals.includes(terminalInput[job.sn]) && (
                                  <CommandItem
                                    value={terminalInput[job.sn]}
                                    onSelect={(currentValue) => {
                                      setTerminals(prev => [...prev, currentValue])
                                      updateTerminal(job.sn, currentValue)
                                      setOpenTerminal(prev => ({ ...prev, [job.sn]: false }))
                                      setTerminalInput(prev => ({ ...prev, [job.sn]: "" }))
                                    }}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add "{terminalInput[job.sn]}"
                                  </CommandItem>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Select value={job.status} onValueChange={(value) => updateStatus(job.sn, value)}>
                          <SelectTrigger className={`w-[110px] h-8 rounded-lg font-medium text-xs ${
                            job.status === 'done' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
                            job.status === 'in progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 
                            job.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                            job.status === 'eta' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg" align="end">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="eta">ETA</SelectItem>
                          </SelectContent>
                        </Select>
                        {job.status === "eta" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[110px] h-7 justify-start text-left font-normal rounded-lg border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 px-2"
                              >
                                <CalendarIcon className="mr-1 h-3 w-3 text-purple-400 shrink-0" />
                                <span className="text-purple-400 text-xs truncate">
                                  {job.eta ? format(job.eta, "MMM dd") : "Date"}
                                </span>
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
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-[180px]">
                        {job.files && job.files.length > 0 ? (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-cyan-400">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{job.files.length}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileUpload(job.sn)}
                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-6 w-6 p-0"
                                title="Upload more"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex flex-col gap-1">
                              {job.files.map((file, index) => (
                                <Popover key={index}>
                                  <PopoverTrigger asChild>
                                    <div className="flex items-center gap-1.5 bg-zinc-800/50 rounded px-2 py-1 border border-zinc-700/50 hover:bg-zinc-800 cursor-pointer">
                                      <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                                      <span className="text-xs text-zinc-300 truncate flex-1" title={file.name}>
                                        {file.name}
                                      </span>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-2" align="start">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium break-all">{file.name}</p>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewFile(file.url)}
                                          className="flex-1 h-8 text-xs"
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownloadFile(file.url, file.name)}
                                          className="flex-1 h-8 text-xs"
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                      <div className="flex gap-1">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 h-8 text-xs"
                                            >
                                              <Edit className="w-3 h-3 mr-1" />
                                              Rename
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>Rename File</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <Input
                                                id={`newName-${job.id}-${index}`}
                                                defaultValue={file.name}
                                                placeholder="Enter new filename"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    const newName = (e.target as HTMLInputElement).value
                                                    handleRenameFile(job.id!, file.name, newName, job.sn)
                                                  }
                                                }}
                                              />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                              </DialogClose>
                                              <DialogClose asChild>
                                                <Button onClick={() => {
                                                  const input = document.getElementById(`newName-${job.id}-${index}`) as HTMLInputElement
                                                  const newName = input.value
                                                  handleRenameFile(job.id!, file.name, newName, job.sn)
                                                }}>
                                                  Rename
                                                </Button>
                                              </DialogClose>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 h-8 text-xs text-red-400 hover:text-red-300"
                                            >
                                              <Trash className="w-3 h-3 mr-1" />
                                              Delete
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete "{file.name}"? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteFile(job.id!, file.name, job.sn)} className="bg-red-600 hover:bg-red-700">
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileUpload(job.sn)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-dashed h-8 w-full text-xs"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete Job #{job.sn}? This will also delete all associated files. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteJob(job.sn)} className="bg-red-600 hover:bg-red-700">
                              Delete Job
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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