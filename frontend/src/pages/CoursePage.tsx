import { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, FileText, Trash2, CheckCircle, XCircle, Loader2,
  Send, BookOpen, Brain, ClipboardList, ChevronRight, Layers,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import UploadZone from '@/components/UploadZone'
import api from '@/services/api'

interface Course { id: number; name: string; description: string }
interface QuizSummary { id: number; title: string; createdAt: string }
interface DeckSummary { id: number; title: string; createdAt: string }
interface Document {
  id: number
  filename: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  pageCount: number
  uploadedAt: string
  processedAt: string | null
  summary: string | null
}
interface Citation { doc_name: string; page_num: number; chunk_index: number }
interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const hasReadyDocs = documents.some((d) => d.status === 'READY')

  const { data: pastDecks = [], refetch: refetchDecks } = useQuery<DeckSummary[]>({
    queryKey: ['decks', courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}/decks`)).data,
  })

  const deckMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/courses/${courseId}/decks/generate?numCards=10`)
      return res.data as { id: number }
    },
    onSuccess: (data) => {
      refetchDecks()
      navigate(`/courses/${courseId}/deck/${data.id}`)
    },
  })

  const { data: pastQuizzes = [], refetch: refetchQuizzes } = useQuery<QuizSummary[]>({
    queryKey: ['quizzes', courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}/quizzes`)).data,
  })

  const quizMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        `/courses/${courseId}/quizzes/generate?numQuestions=5&difficulty=medium`
      )
      return res.data as { id: number }
    },
    onSuccess: (data) => {
      refetchQuizzes()
      navigate(`/courses/${courseId}/quiz/${data.id}`)
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

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await api.post(`/courses/${courseId}/chat`, { question, topK: 5 })
      return res.data as { answer: string; citations: Citation[] }
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, citations: data.citations },
      ])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatMutation.isPending])

  function handleSend() {
    const q = input.trim()
    if (!q || chatMutation.isPending) return
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setInput('')
    chatMutation.mutate(q)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/courses')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="font-bold text-gray-900">{course?.name ?? '…'}</span>
          {course?.description && (
            <p className="text-xs text-gray-500">{course.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Left column: documents */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-4">
          <UploadZone
            onFiles={(files) => uploadMutation.mutate(files)}
            uploading={uploadMutation.isPending}
          />

          {uploadMutation.isError && (
            <p className="text-sm text-red-600 text-center">Upload failed. Please try again.</p>
          )}

          {documents.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Documents ({documents.length})
              </h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onDelete={() => deleteMutation.mutate(doc.id)}
                    onSummarized={(updated) =>
                      queryClient.setQueryData(['documents', courseId], (old: Document[]) =>
                        old.map((d) => (d.id === updated.id ? updated : d))
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && !uploadMutation.isPending && (
            <p className="text-center text-gray-400 text-xs py-4">
              No documents yet. Upload a PDF, PPTX, or DOCX to get started.
            </p>
          )}

          {hasReadyDocs && (
            <Button
              onClick={() => quizMutation.mutate()}
              disabled={quizMutation.isPending}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 h-10 text-sm font-medium"
            >
              {quizMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Generate Quiz</>
              )}
            </Button>
          )}

          {quizMutation.isError && (
            <p className="text-xs text-red-600 text-center">
              {(quizMutation.error as any)?.response?.data?.message ?? 'Quiz generation failed. Please try again.'}
            </p>
          )}

          {hasReadyDocs && (
            <Button
              onClick={() => deckMutation.mutate()}
              disabled={deckMutation.isPending}
              className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 h-10 text-sm font-medium"
            >
              {deckMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…</>
              ) : (
                <><Layers className="h-4 w-4 mr-2" /> Generate Flashcards</>
              )}
            </Button>
          )}

          {deckMutation.isError && (
            <p className="text-xs text-red-600 text-center">Flashcard generation failed. Please try again.</p>
          )}

          {pastDecks.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Flashcard Decks
              </h2>
              <div className="space-y-1.5">
                {pastDecks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/courses/${courseId}/deck/${d.id}`)}
                    className="w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2 hover:border-teal-200 hover:bg-teal-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{d.title}</p>
                      <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-teal-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {pastQuizzes.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" /> Past Quizzes
              </h2>
              <div className="space-y-1.5">
                {pastQuizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => navigate(`/courses/${courseId}/quiz/${q.id}`)}
                    className="w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{q.title}</p>
                      <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right column: chat */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Chat header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Ask about your documents</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2 py-16">
                <BookOpen className="h-10 w-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">No messages yet</p>
                <p className="text-xs">
                  {hasReadyDocs
                    ? 'Ask a question about your uploaded documents'
                    : 'Upload and wait for documents to finish processing'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {msg.citations.map((c, ci) => (
                        <span
                          key={ci}
                          className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5"
                          title={`${c.doc_name}, page ${c.page_num}`}
                        >
                          {c.doc_name.length > 20 ? c.doc_name.slice(0, 20) + '…' : c.doc_name} · p.{c.page_num}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasReadyDocs
                  ? 'Ask a question… (Enter to send, Shift+Enter for new line)'
                  : 'Upload documents first to start chatting'
              }
              disabled={!hasReadyDocs || chatMutation.isPending}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400 max-h-32 overflow-y-auto"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || !hasReadyDocs || chatMutation.isPending}
              className="h-10 w-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({
  doc,
  onDelete,
  onSummarized,
}: {
  doc: Document
  onDelete: () => void
  onSummarized: (updated: Document) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const summarizeMutation = useMutation({
    mutationFn: async () => (await api.post(`/documents/${doc.id}/summarize`)).data as Document,
    onSuccess: (updated) => {
      onSummarized(updated)
      setExpanded(true)
    },
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
      <div className="px-3 py-2.5 flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">{doc.filename}</p>
          {doc.pageCount > 0 && <p className="text-xs text-gray-400">{doc.pageCount} pages</p>}
        </div>
        <StatusBadge status={doc.status} />
        {doc.status === 'READY' && (
          <button
            onClick={() => doc.summary ? setExpanded((e) => !e) : summarizeMutation.mutate()}
            disabled={summarizeMutation.isPending}
            title={doc.summary ? 'Toggle summary' : 'Generate summary'}
            className="p-1 text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0"
          >
            {summarizeMutation.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : doc.summary
              ? (expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)
              : <Sparkles className="h-3.5 w-3.5" />}
          </button>
        )}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {doc.summary && expanded && (
        <div className="px-3 pb-3 border-t border-gray-50">
          <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-wrap">{doc.summary}</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Document['status'] }) {
  if (status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex-shrink-0">
        <CheckCircle className="h-3 w-3" /> Ready
      </span>
    )
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 flex-shrink-0">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 flex-shrink-0">
      <Loader2 className="h-3 w-3 animate-spin" /> Processing
    </span>
  )
}
