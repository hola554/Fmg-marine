"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Folder, ChevronRight, FileText, Upload, X, Plus, FolderPlus, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useCompanyFiles } from "@/lib/company-files-context"

interface FolderItem {
  id: string
  name: string
  type: "folder" | "file"
  size?: string
  lastModified?: string
  children?: FolderItem[]
  fileUrl?: string
}

// Company files structure with categories as top-level folders
const companyFileStructure: FolderItem[] = [
  {
    id: "policies",
    name: "Policies",
    type: "folder",
    children: [],
  },
  {
    id: "procedures",
    name: "Procedures",
    type: "folder",
    children: [],
  },
  {
    id: "certificates",
    name: "Certificates",
    type: "folder",
    children: [],
  },
  {
    id: "licenses",
    name: "Licenses",
    type: "folder",
    children: [],
  },
  {
    id: "contracts",
    name: "Contracts",
    type: "folder",
    children: [],
  },
  {
    id: "reports",
    name: "Reports",
    type: "folder",
    children: [],
  },
  {
    id: "other",
    name: "Other",
    type: "folder",
    children: [],
  },
]

export function CompanyFiles() {
  const { companyFiles, uploadCompanyFile, deleteCompanyFile } = useCompanyFiles()
  const [currentPath, setCurrentPath] = useState<FolderItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<FolderItem[]>(companyFileStructure)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [files, setFiles] = useState<Record<string, FolderItem[]>>({})
  const [editingItem, setEditingItem] = useState<FolderItem | null>(null)
  const [editName, setEditName] = useState("")
  const [deletingItem, setDeletingItem] = useState<FolderItem | null>(null)

  const navigateToFolder = (folder: FolderItem) => {
    if (folder.type === "folder") {
      setCurrentPath([...currentPath, folder])
      setCurrentFolder(folder.children || [])
    }
  }

  const navigateBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1)
      setCurrentPath(newPath)
      if (newPath.length === 0) {
        setCurrentFolder(companyFileStructure)
      } else {
        setCurrentFolder(newPath[newPath.length - 1].children || [])
      }
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([])
      setCurrentFolder(companyFileStructure)
    } else {
      const newPath = currentPath.slice(0, index + 1)
      setCurrentPath(newPath)
      setCurrentFolder(newPath[newPath.length - 1].children || [])
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && currentPath.length > 0) {
      try {
        const category = currentPath[0].name.toLowerCase()
        await uploadCompanyFile(file, currentPath.map(folder => folder.name).join('/'), category)
        toast.success(`File "${file.name}" uploaded successfully to ${currentPath[currentPath.length - 1]?.name}`)
        setIsUploading(false)
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Failed to upload file. Please try again.')
      }
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : "root"
      const newFolder: FolderItem = {
        id: `${folderId}-folder-${Date.now()}`,
        name: newFolderName,
        type: "folder",
        children: [],
      }

      setFiles((prev) => ({
        ...prev,
        [folderId]: [...(prev[folderId] || []), newFolder],
      }))

      toast.success(`Folder "${newFolderName}" created successfully`)
      setIsCreatingFolder(false)
      setNewFolderName("")
    }
  }

  const handleEditItem = (item: FolderItem) => {
    setEditingItem(item)
    setEditName(item.name)
  }

  const handleSaveEdit = () => {
    if (editName.trim() && editingItem) {
      const folderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : "root"
      setFiles((prev) => ({
        ...prev,
        [folderId]: (prev[folderId] || []).map((item) =>
          item.id === editingItem.id ? { ...item, name: editName } : item
        ),
      }))
      toast.success(`"${editingItem.name}" renamed to "${editName}"`)
      setEditingItem(null)
      setEditName("")
    }
  }

  const handleDeleteItem = (item: FolderItem) => {
    setDeletingItem(item)
  }

  const confirmDelete = async () => {
    if (deletingItem) {
      try {
        await deleteCompanyFile(deletingItem.id)
        toast.success(`"${deletingItem.name}" deleted successfully`)
        setDeletingItem(null)
      } catch (error) {
        console.error('Delete failed:', error)
        toast.error('Failed to delete file. Please try again.')
      }
    }
  }

  // Combine current folder structure with uploaded files from database
  const currentFolderPath = currentPath.length > 0 ? currentPath.map(folder => folder.name).join('/') : ''
  const folderDocuments = companyFiles.filter(doc => {
    if (currentPath.length === 0) {
      // At root level, don't show files - only categories
      return false
    } else if (currentPath.length === 1) {
      // In a category folder, show files for that category
      return doc.category === currentPath[0].name.toLowerCase()
    } else {
      // In subfolders, show files that match the full path
      return doc.folder_path === currentFolderPath
    }
  })

  const displayItems = [
    ...currentFolder,
    ...(files[currentPath.length > 0 ? currentPath[currentPath.length - 1].id : "root"] || []),
    ...folderDocuments.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: "file" as const,
      size: doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : undefined,
      lastModified: new Date(doc.created_at).toLocaleDateString(),
      fileUrl: doc.file_url
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Company Files</h1>
          <p className="text-sm text-zinc-400">Manage company documents and files by category</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            onClick={() => setIsCreatingFolder(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          {/* Show upload button only when inside a folder */}
          {currentPath.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              onClick={() => setIsUploading(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Upload to {currentPath[currentPath.length - 1]?.name}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsUploading(false)} className="text-zinc-400">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-2 border-dashed border-zinc-800 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
              <Input type="file" className="hidden" id="file-upload" onChange={handleUpload} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400">Click to select file</p>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* New folder creation modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Folder</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreatingFolder(false)
                  setNewFolderName("")
                }}
                className="text-zinc-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingFolder(false)
                    setNewFolderName("")
                  }}
                  className="bg-zinc-800 border-zinc-700"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} className="bg-cyan-600 hover:bg-cyan-700">
                  Create
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit()
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null)
                  setEditName("")
                }}
                className="bg-zinc-800 border-zinc-700"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-cyan-600 hover:bg-cyan-700">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Item</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Breadcrumb navigation */}
      {currentPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigateToBreadcrumb(-1)} className="text-cyan-500 hover:underline">
            Company Files
          </button>
          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-zinc-600" />
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={
                  index === currentPath.length - 1
                    ? "text-zinc-400"
                    : "text-cyan-500 hover:underline"
                }
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Back button */}
      {currentPath.length > 0 && (
        <Button variant="outline" size="sm" onClick={navigateBack} className="bg-zinc-900 border-zinc-800">
          Back
        </Button>
      )}

      {/* Folder/file grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayItems.map((item) => (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <Card
                className="group cursor-pointer bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/50 transition-all"
                onClick={() => navigateToFolder(item)}
              >
                <div className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-cyan-500 group-hover:bg-cyan-500/10">
                    {item.type === "folder" ? <Folder className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200 group-hover:text-cyan-500 truncate w-full">
                    {item.name}
                  </h3>
                  {item.type === "file" && item.size && (
                    <p className="text-xs text-zinc-500">{item.size}</p>
                  )}
                  {item.type === "file" && item.fileUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 p-1 h-6 w-6 text-zinc-400 hover:text-cyan-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.fileUrl, '_blank')
                      }}
                      title="Download file"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-zinc-900 border-zinc-800">
              <ContextMenuItem onClick={() => handleEditItem(item)} className="text-zinc-200 hover:bg-zinc-800">
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDeleteItem(item)} className="text-red-500 hover:bg-red-500/10">
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {displayItems.length === 0 && (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
          <p className="text-zinc-500">This folder is empty</p>
          <p className="text-sm text-zinc-600 mt-1">Upload files or create new folders</p>
        </div>
      )}
    </div>
  )
}
