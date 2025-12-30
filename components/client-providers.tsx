import React from 'react';
import { JobsProvider } from '@/lib/jobs-context';
import { DocumentsProvider } from '@/lib/documents-context';
import { CompanyFilesProvider } from '@/lib/company-files-context';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <JobsProvider>
      <DocumentsProvider>
        <CompanyFilesProvider>
          {children}
        </CompanyFilesProvider>
      </DocumentsProvider>
    </JobsProvider>
  );
}
