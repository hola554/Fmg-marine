'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type Job = {
  id?: string
  sn: number
  consignee: string
  blNumber: string
  containerSize: string
  terminal: string
  status: string
  eta: Date | undefined
  refundStatus: 'pending' | 'collected'
  files?: Array<{
    name: string
    url: string
    size: number
    type: string
    uploadedAt: string
  }>
  user_id?: string
  created_at?: string
  updated_at?: string
}



interface JobsContextType {
  jobs: Job[]
  loading: boolean
  updateStatus: (sn: number, status: string) => Promise<void>
  updateEta: (sn: number, eta: Date | undefined) => Promise<void>
  updateTerminal: (sn: number, terminal: string) => Promise<void>
  updateConsignee: (sn: number, consignee: string) => Promise<void>
  updateBlNumber: (sn: number, blNumber: string) => Promise<void>
  updateContainerSize: (sn: number, containerSize: string) => Promise<void>
  updateRefundStatus: (sn: number, refundStatus: 'pending' | 'collected') => Promise<void>
  addJob: (job: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteJob: (sn: number) => Promise<void>
  refreshJobs: () => Promise<void>
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export const useJobs = () => {
  const context = useContext(JobsContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}

interface JobsProviderProps {
  children: ReactNode
}

export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('sn', { ascending: true })

      if (error) {
        console.error('Error fetching jobs:', error)
        // Don't reset to demo data if there's an error - keep current state
        return
      }

      const formattedJobs = data?.map(job => ({
        ...job,
        blNumber: job.bl_number,
        containerSize: job.container_size,
        refundStatus: job.refund_status,
        eta: job.eta ? new Date(job.eta) : undefined,
        files: job.files || []
      })) || []

      setJobs(formattedJobs)
    } catch (error) {
      console.error('Error refreshing jobs:', error)
      // Don't reset state on error - keep current jobs
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshJobs()
  }, [])

  const updateStatus = async (sn: number, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating status:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const updateEta = async (sn: number, eta: Date | undefined) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ eta: eta?.toISOString() })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating ETA:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating ETA:', error)
    }
  }

  const updateTerminal = async (sn: number, terminal: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ terminal })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating terminal:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating terminal:', error)
    }
  }

  const updateConsignee = async (sn: number, consignee: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ consignee })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating consignee:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating consignee:', error)
    }
  }

  const updateBlNumber = async (sn: number, blNumber: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ bl_number: blNumber })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating BL number:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating BL number:', error)
    }
  }

  const updateContainerSize = async (sn: number, containerSize: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ container_size: containerSize })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating container size:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating container size:', error)
    }
  }

  const updateRefundStatus = async (sn: number, refundStatus: 'pending' | 'collected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .update({ refund_status: refundStatus })
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating refund status:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error updating refund status:', error)
    }
  }

  const addJob = async (jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .insert({
          sn: jobData.sn,
          consignee: jobData.consignee,
          bl_number: jobData.blNumber,
          container_size: jobData.containerSize,
          terminal: jobData.terminal,
          status: jobData.status,
          eta: jobData.eta?.toISOString(),
          refund_status: jobData.refundStatus,
          user_id: user.id
        })

      if (error) {
        console.error('Error adding job:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error adding job:', error)
    }
  }

  const deleteJob = async (sn: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('sn', sn)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting job:', error)
        return
      }

      await refreshJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  return (
    <JobsContext.Provider value={{
      jobs,
      loading,
      updateStatus,
      updateEta,
      updateTerminal,
      updateConsignee,
      updateBlNumber,
      updateContainerSize,
      updateRefundStatus,
      addJob,
      deleteJob,
      refreshJobs
    }}>
      {children}
    </JobsContext.Provider>
  )
}
