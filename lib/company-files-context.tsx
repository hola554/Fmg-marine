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

      // Create unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents') // Using same bucket as documents
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

      // Save company file metadata to database
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

      // Get company file details first
      const { data: companyFile, error: fetchError } = await supabase
        .from('company_files')
        .select('path')
        .eq('id', id)
        .eq('uploaded_by', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching company file:', fetchError)
        throw fetchError
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([companyFile.path])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
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

  useEffect(() => {
    refreshCompanyFiles()
  }, [])

  return (
    <CompanyFilesContext.Provider value={{
      companyFiles,
      loading,
      uploadCompanyFile,
      deleteCompanyFile,
      refreshCompanyFiles
    }}>
      {children}
    </CompanyFilesContext.Provider>
  )
}
