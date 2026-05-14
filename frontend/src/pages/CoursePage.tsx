import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UploadZone from '@/components/UploadZone'
import api from '@/services/api'

interface Course { id: number; name: string; description: string }
interface Document {
  id: number
  filename: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  pageCount: number
  uploadedAt: string
  processedAt: string | null
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: course } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}`)).data,
  })

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['documents', courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}/documents`)).data,
    refetchInterval: (query) => {
      const docs = query.state.data as Document[] | undefined
      return docs?.some((d) => d.status === 'PROCESSING') ? 3000 : false
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        await api.post(`/courses/${courseId}/documents`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', courseId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => api.delete(`/documents/${docId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', courseId] }),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/courses')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <span className="text-xl font-bold text-gray-900">{course?.name ?? '…'}</span>
          {course?.description && (
            <p className="text-sm text-gray-500">{course.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <UploadZone
          onFiles={(files) => uploadMutation.mutate(files)}
          uploading={uploadMutation.isPending}
        />

        {uploadMutation.isError && (
          <p className="text-sm text-red-600 text-center">Upload failed. Please try again.</p>
        )}

        {documents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Documents ({documents.length})
            </h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 group"
                >
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                    <p className="text-xs text-gray-400">
                      {doc.pageCount > 0 ? `${doc.pageCount} pages · ` : ''}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length === 0 && !uploadMutation.isPending && (
          <p className="text-center text-gray-400 text-sm py-4">
            No documents yet. Upload a PDF, PPTX, or DOCX to get started.
          </p>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: Document['status'] }) {
  if (status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
        <CheckCircle className="h-3 w-3" /> Ready
      </span>
    )
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
      <Loader2 className="h-3 w-3 animate-spin" /> Processing
    </span>
  )
}
