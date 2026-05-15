import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import NeuralBackground from '@/components/NeuralBackground'
import api from '@/services/api'

interface QuizQuestion {
  id: number
  position: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
}

interface Quiz {
  id: number
  courseId: number
  title: string
  createdAt: string
  questions: QuizQuestion[]
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const
type Option = typeof OPTIONS[number]

function optionLabel(q: QuizQuestion, opt: Option) {
  return ({ A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD })[opt]
}

export default function QuizPage() {
  const { id: courseId, quizId } = useParams<{ id: string; quizId: string }>()
  const navigate = useNavigate()

  const [answers, setAnswers] = useState<Record<number, Option>>({})
  const [submitted, setSubmitted] = useState(false)

  const { data: quiz, isLoading, isError } = useQuery<Quiz>({
    queryKey: ['quiz', quizId],
    queryFn: async () => (await api.get(`/quizzes/${quizId}`)).data,
  })

  function handleSelect(qIdx: number, opt: Option) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qIdx]: opt }))
  }

  function handleSubmit() {
    if (!quiz) return
    const answered = Object.keys(answers).length
    if (answered < quiz.questions.length) {
      const unanswered = quiz.questions.length - answered
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return
    }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRetry() {
    setAnswers({})
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center">
        <NeuralBackground />
        <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (isError || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center">
        <NeuralBackground />
        <p className="relative z-10 text-red-600">Failed to load quiz.</p>
      </div>
    )
  }

  const score = submitted
    ? quiz.questions.filter((q, i) => answers[i] === q.correctOption).length
    : 0
  const total = quiz.questions.length
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10">
      <Navbar />
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-xs text-gray-500">{total} questions</p>
        </div>
        {submitted && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
        )}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Score banner */}
        {submitted && (
          <div className={`rounded-2xl p-5 flex items-center gap-4 ${pct >= 70 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <Trophy className={`h-8 w-8 flex-shrink-0 ${pct >= 70 ? 'text-green-500' : 'text-amber-500'}`} />
            <div>
              <p className={`text-xl font-bold ${pct >= 70 ? 'text-green-700' : 'text-amber-700'}`}>
                {score} / {total} correct ({pct}%)
              </p>
              <p className={`text-sm ${pct >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                {pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good job!' : 'Keep studying — review the explanations below.'}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        {quiz.questions.map((q, i) => {
          const selected = answers[i]
          const isCorrect = submitted && selected === q.correctOption
          const isWrong = submitted && selected && selected !== q.correctOption

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 space-y-3 ${
                submitted
                  ? isCorrect
                    ? 'border-green-200'
                    : isWrong
                    ? 'border-red-200'
                    : 'border-gray-100'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.questionText}</p>
              </div>

              <div className="space-y-2 pl-9">
                {OPTIONS.map((opt) => {
                  const label = optionLabel(q, opt)
                  const isSelected = selected === opt
                  const isAnswer = q.correctOption === opt

                  let cls = 'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors text-sm '
                  if (!submitted) {
                    cls += isSelected
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  } else {
                    if (isAnswer) {
                      cls += 'bg-green-50 border-green-400 text-green-900'
                    } else if (isSelected && !isAnswer) {
                      cls += 'bg-red-50 border-red-300 text-red-900'
                    } else {
                      cls += 'border-gray-100 text-gray-500 cursor-default'
                    }
                  }

                  return (
                    <div key={opt} className={cls} onClick={() => handleSelect(i, opt)}>
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 ${
                        submitted && isAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : submitted && isSelected && !isAnswer
                          ? 'border-red-400 bg-red-400 text-white'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {submitted && isAnswer
                          ? '✓'
                          : submitted && isSelected && !isAnswer
                          ? '✗'
                          : opt}
                      </span>
                      <span>{label}</span>
                    </div>
                  )
                })}
              </div>

              {submitted && q.explanation && (
                <div className="pl-9 pt-1">
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                    <span className="font-semibold text-gray-600">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {!submitted && (
          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-semibold"
          >
            Submit Quiz
          </Button>
        )}

        {submitted && (
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Course
            </Button>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}
