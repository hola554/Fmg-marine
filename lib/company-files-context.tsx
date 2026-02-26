'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type CompanyFile = {
  id: string
  name: string
  path: string
  folder_path: string
  file_url?: string
  file_size?: number
  mime_type?: string
  category?: string
  is_folder?: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

interface CompanyFilesContextType {
  companyFiles: CompanyFile[]
  loading: boolean
  uploadCompanyFile: (file: File, folderPath: string, category?: string) => Promise<void>
  deleteCompanyFile: (id: string) => Promise<void>
  refreshCompanyFiles: () => Promise<void>
  createFolder: (name: string, parentId: string | null, category?: string) => Promise<void>
  renameFolder: (id: string, newName: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

const CompanyFilesContext = createContext<CompanyFilesContextType | undefined>(undefined)

export const useCompanyFiles = () => {
  const context = useContext(CompanyFilesContext)
  if (!context) {
    throw new Error('useCompanyFiles must be used within a CompanyFilesProvider')
  }
  return context
}

interface CompanyFilesProviderProps {
  children: ReactNode
}

export const CompanyFilesProvider: React.FC<CompanyFilesProviderProps> = ({ children }) => {
  const [companyFiles, setCompanyFiles] = useState<CompanyFile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshCompanyFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('company_files')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching company files:', error)
        return
      }

      setCompanyFiles(data || [])
    } catch (error) {
      console.error('Error refreshing company files:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadCompanyFile = async (file: File, folderPath: string, category?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw uploadError
      }

      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365)

      if (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError)
        throw signedUrlError
      }

      const { error: dbError } = await supabase
        .from('company_files')
        .insert({
          name: file.name,
          path: filePath,
          folder_path: folderPath,
          file_url: signedUrl,
          file_size: file.size,
          mime_type: file.type,
          category: category,
          uploaded_by: user.id
        })

      if (dbError) {
        console.error('Error saving company file metadata:', dbError)
        throw dbError
      }

      await refreshCompanyFiles()
    } catch (error) {
      console.error('Error uploading company file:', error)
      throw error
    }
  }

  const deleteCompanyFile = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: companyFile, error: fetchError } = await supabase
        .from('company_files')
        .select('path, is_folder')
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching company file:', fetchError)
        throw fetchError
      }

      if (!companyFile?.is_folder && companyFile?.path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([companyFile.path])

        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }

      const { error: dbError } = await supabase
        .from('company_files')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)

      if (dbError) {
        console.error('Error deleting company file from database:', dbError)
        throw dbError
      }

      await refreshCompanyFiles()
    } catch (error) {
      console.error('Error deleting company file:', error)
      throw error
    }
  }

  const createFolder = async (name: string, parentId: string | null, category?: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Authentication error:', authError)
        throw new Error('Failed to authenticate user. Please log in again.')
      }

      if (!user) {
        throw new Error('You must be logged in to create a folder. Please log in and try again.')
      }

      if (!name || name.trim() === '') {
        throw new Error('Folder name cannot be empty.')
      }

      const trimmedName = name.trim()

      // Build the folder_path (where this folder lives) and path (unique identifier)
      let folderPath = ''

      if (parentId && parentId !== 'root') {
        const { data: parentFolder, error: parentError } = await supabase
          .from('company_files')
          .select('folder_path, name')
          .eq('id', parentId)
          .eq('is_folder', true)
          .single()

        if (parentError) {
          console.error('Error fetching parent folder:', parentError)
          // Fall back to root level
        } else if (parentFolder) {
          folderPath = parentFolder.folder_path
            ? `${parentFolder.folder_path}/${parentFolder.name}`
            : parentFolder.name
        }
      }

      // path acts as the unique storage-style path for this folder
      const path = folderPath ? `${folderPath}/${trimmedName}` : trimmedName

      const { error: dbError } = await supabase
        .from('company_files')
        .insert({
          name: trimmedName,
          path: path,           // <-- required NOT NULL column
          folder_path: folderPath,
          is_folder: true,
          category: category || null,
          uploaded_by: user.id,
        })

      if (dbError) {
        // Log every field so we always see the real reason
        console.error('Database error creating folder:', dbError.message, '| code:', dbError.code, '| details:', dbError.details, '| hint:', dbError.hint)
        throw new Error(dbError.message || 'Failed to create folder in database.')
      }

      await refreshCompanyFiles()
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating folder:', error.message)
        throw error
      }
      console.error('Unknown error creating folder:', error)
      throw new Error('An unexpected error occurred while creating the folder.')
    }
  }

  const renameFolder = async (id: string, newName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: folder, error: fetchError } = await supabase
        .from('company_files')
        .select('name, folder_path')
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', true)
        .single()

      if (fetchError) {
        console.error('Error fetching folder:', fetchError)
        throw fetchError
      }

      const oldName = folder.name
      const oldFolderPath = folder.folder_path || ''

      // Rebuild the path for the renamed folder
      const newPath = oldFolderPath ? `${oldFolderPath}/${newName}` : newName

      const { error: dbError } = await supabase
        .from('company_files')
        .update({ name: newName, path: newPath, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', true)

      if (dbError) {
        console.error('Error renaming folder:', dbError)
        throw dbError
      }

      // Update folder_path for all children
      const oldChildPrefix = oldFolderPath ? `${oldFolderPath}/${oldName}` : oldName
      const newChildPrefix = oldFolderPath ? `${oldFolderPath}/${newName}` : newName

      const { data: children, error: childFetchError } = await supabase
        .from('company_files')
        .select('id, folder_path, path')
        .eq('uploaded_by', user.id)
        .like('folder_path', `${oldChildPrefix}%`)

      if (!childFetchError && children && children.length > 0) {
        const updates = children.map((child) => ({
          id: child.id,
          folder_path: child.folder_path.replace(oldChildPrefix, newChildPrefix),
          path: child.path.replace(oldChildPrefix, newChildPrefix),
        }))

        for (const update of updates) {
          await supabase
            .from('company_files')
            .update({ folder_path: update.folder_path, path: update.path })
            .eq('id', update.id)
            .eq('uploaded_by', user.id)
        }
      }

      await refreshCompanyFiles()
    } catch (error) {
      console.error('Error renaming folder:', error)
      throw error
    }
  }

  const deleteFolder = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: dbError } = await supabase
        .from('company_files')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', true)

      if (dbError) {
        console.error('Error deleting folder:', dbError)
        throw dbError
      }

      await refreshCompanyFiles()
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  useEffect(() => {
    refreshCompanyFiles()
  }, [])

  return (
    <CompanyFilesContext.Provider value={{
      companyFiles,
      loading,
      uploadCompanyFile,
      deleteCompanyFile,
      refreshCompanyFiles,
      createFolder,
      renameFolder,
      deleteFolder
    }}>
      {children}
    </CompanyFilesContext.Provider>
  )
}