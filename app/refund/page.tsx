'use client'

import Layout from "@/components/kokonutui/layout"
import { useJobs } from '@/lib/jobs-context'
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

export default function RefundPage() {
  const { jobs, loading, updateRefundStatus } = useJobs()

  const doneJobs = jobs.filter(job => job.status === 'done')

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Refund Requests</h1>
        <p className="text-muted-foreground">
          Process and monitor container deposit refunds and terminal overpayments.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Pending Refunds</h3>
            <p className="text-3xl font-bold text-white">{doneJobs.filter(job => job.refundStatus === 'pending').length}</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-semibold text-cyan-500 mb-2">Collected Refunds</h3>
            <p className="text-3xl font-bold text-white">{doneJobs.filter(job => job.refundStatus === 'collected').length}</p>
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
                <TableHead className="text-cyan-500">Refund Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doneJobs.map((job) => (
                <TableRow key={job.sn}>
                  <TableCell>{job.sn}</TableCell>
                  <TableCell>{job.consignee}</TableCell>
                  <TableCell>{job.blNumber}</TableCell>
                  <TableCell>{job.containerSize}</TableCell>
                  <TableCell>
                    <Select value={job.refundStatus} onValueChange={(value: 'pending' | 'collected') => updateRefundStatus(job.sn, value)}>
                      <SelectTrigger className={`w-[120px] h-9 rounded-lg font-medium ${job.refundStatus === 'collected' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg" align="end">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="collected">Collected</SelectItem>
                      </SelectContent>
                    </Select>
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
