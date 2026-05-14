import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onFiles: (files: File[]) => void
  uploading: boolean
}

const ACCEPTED = '.pdf,.pptx,.docx'

export default function UploadZone({ onFiles, uploading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl px-8 py-12 text-center transition-colors cursor-pointer',
        dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
        uploading && 'opacity-50 pointer-events-none'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
      <p className="font-medium text-gray-700">
        {uploading ? 'Uploading…' : 'Drop files here or click to browse'}
      </p>
      <p className="text-sm text-gray-400 mt-1">PDF, PPTX, DOCX — up to 100 MB each</p>
    </div>
  )
}
