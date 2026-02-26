'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type Document = {
  id: string
  name: string
  path: string
  folder_path: string
  file_url?: string
  file_size?: number
  mime_type?: string
  is_folder?: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

interface DocumentsContextType {
  documents: Document[]
  loading: boolean
  uploadDocument: (file: File, folderPath: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  refreshDocuments: () => Promise<void>
  createFolder: (name: string, parentId: string | null) => Promise<void>
  renameFolder: (id: string, newName: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  renameDocument: (id: string, newName: string) => Promise<void>
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

export const useDocuments = () => {
  const context = useContext(DocumentsContext)
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider')
  }
  return context
}

interface DocumentsProviderProps {
  children: ReactNode
}

export const DocumentsProvider: React.FC<DocumentsProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        return
      }

      setDocuments(data || [])
    } catch (error) {
      console.error('Error refreshing documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File, folderPath: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw uploadError
      }

      // Get signed URL for the uploaded file
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year expiry

      if (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError)
        throw signedUrlError
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          path: filePath,
          folder_path: folderPath,
          file_url: signedUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id
        })

      if (dbError) {
        console.error('Error saving document metadata:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

const deleteDocument = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('path, is_folder')
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching document:', fetchError)
        throw fetchError
      }

      // Only delete from storage if it's a file, not a folder
      if (!document?.is_folder && document?.path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.path])

        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)

      if (dbError) {
        console.error('Error deleting document from database:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  const createFolder = async (name: string, parentId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Generate folder path based on parent
      let folderPath = ''
      if (parentId && parentId !== 'root') {
        // Get parent folder details
        const { data: parentFolder } = await supabase
          .from('documents')
          .select('folder_path')
          .eq('id', parentId)
          .single()
        
        if (parentFolder) {
          folderPath = `${parentFolder.folder_path}/${name}`
        }
      }

      // Save folder to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: name,
          folder_path: folderPath,
          is_folder: true,
          uploaded_by: user.id
        })

      if (dbError) {
        console.error('Error creating folder:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  const renameFolder = async (id: string, newName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update folder name in database
      const { error: dbError } = await supabase
        .from('documents')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', true)

      if (dbError) {
        console.error('Error renaming folder:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error renaming folder:', error)
      throw error
    }
  }

  const deleteFolder = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete folder from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', true)

      if (dbError) {
        console.error('Error deleting folder:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  const renameDocument = async (id: string, newName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update document name in database
      const { error: dbError } = await supabase
        .from('documents')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .eq('is_folder', false)

      if (dbError) {
        console.error('Error renaming document:', dbError)
        throw dbError
      }

      await refreshDocuments()
    } catch (error) {
      console.error('Error renaming document:', error)
      throw error
    }
  }

  useEffect(() => {
    refreshDocuments()
  }, [])

  return (
    <DocumentsContext.Provider value={{
      documents,
      loading,
      uploadDocument,
      deleteDocument,
      refreshDocuments,
      createFolder,
      renameFolder,
      deleteFolder,
      renameDocument
    }}>
      {children}
    </DocumentsContext.Provider>
  )
}
