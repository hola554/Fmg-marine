'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Job = {
  sn: number
  consignee: string
  blNumber: string
  containerSize: string
  terminal: string
  status: string
  eta: Date | undefined
  refundStatus: 'pending' | 'collected'
}

const initialJobs: Job[] = [
  { sn: 1, consignee: "ABC Corp", blNumber: "BL123456", containerSize: "20ft", terminal: "Apapa", status: "pending", eta: new Date(), refundStatus: 'pending' },
  { sn: 2, consignee: "XYZ Ltd", blNumber: "BL789012", containerSize: "40ft", terminal: "TICT", status: "done", eta: new Date(Date.now() + 86400000), refundStatus: 'pending' },
  { sn: 3, consignee: "DEF Inc", blNumber: "BL345678", containerSize: "20ft", terminal: "Sifax terminal", status: "pending", eta: undefined, refundStatus: 'pending' },
]

interface JobsContextType {
  jobs: Job[]
  updateStatus: (sn: number, status: string) => void
  updateEta: (sn: number, eta: Date | undefined) => void
  updateTerminal: (sn: number, terminal: string) => void
  updateConsignee: (sn: number, consignee: string) => void
  updateBlNumber: (sn: number, blNumber: string) => void
  updateContainerSize: (sn: number, containerSize: string) => void
  updateRefundStatus: (sn: number, refundStatus: 'pending' | 'collected') => void
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
  const [jobs, setJobs] = useState<Job[]>(initialJobs)

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

  const updateRefundStatus = (sn: number, refundStatus: 'pending' | 'collected') => {
    setJobs(jobs.map(job => job.sn === sn ? { ...job, refundStatus } : job))
  }

  return (
    <JobsContext.Provider value={{
      jobs,
      updateStatus,
      updateEta,
      updateTerminal,
      updateConsignee,
      updateBlNumber,
      updateContainerSize,
      updateRefundStatus
    }}>
      {children}
    </JobsContext.Provider>
  )
}
