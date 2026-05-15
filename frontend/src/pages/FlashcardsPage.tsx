import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import api from '@/services/api'

interface Flashcard {
  id: number
  position: number
  front: string
  back: string
}

interface Deck {
  id: number
  courseId: number
  title: string
  createdAt: string
  cards: Flashcard[]
}

export default function FlashcardsPage() {
  const { id: courseId, deckId } = useParams<{ id: string; deckId: string }>()
  const navigate = useNavigate()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())

  const { data: deck, isLoading, isError } = useQuery<Deck>({
    queryKey: ['deck', deckId],
    queryFn: async () => (await api.get(`/decks/${deckId}`)).data,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  if (isError || !deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load flashcards.</p>
      </div>
    )
  }

  const cards = deck.cards
  const total = cards.length
  const current = cards[index]
  const allDone = known.size === total

  function goNext() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 150)
  }

  function goPrev() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150)
  }

  function markKnown() {
    setKnown((prev) => new Set([...prev, current.id]))
    if (index < total - 1) goNext()
  }

  function resetDeck() {
    setKnown(new Set())
    setIndex(0)
    setFlipped(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{deck.title}</h1>
          <p className="text-xs text-gray-500">{total} cards · {known.size} known</p>
        </div>
        <button onClick={resetDeck} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {/* Progress bar */}
        <div className="w-full max-w-lg">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Card {index + 1} of {total}</span>
            <span>{known.size} known</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Flip card */}
        {!allDone ? (
          <>
            <div
              className="w-full max-w-lg cursor-pointer"
              style={{ perspective: '1200px' }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '260px',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white rounded-3xl border-2 border-gray-200 flex flex-col items-center justify-center p-8 shadow-sm"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-4">Term</span>
                  <p className="text-xl font-bold text-gray-900 text-center leading-snug">{current.front}</p>
                  <p className="text-xs text-gray-400 mt-6">Click to reveal definition</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-teal-600 rounded-3xl flex flex-col items-center justify-center p-8 shadow-sm"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-xs font-semibold text-teal-200 uppercase tracking-widest mb-4">Definition</span>
                  <p className="text-base text-white text-center leading-relaxed">{current.back}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full max-w-lg">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={index === 0}
                className="flex-shrink-0 rounded-xl h-11 w-11 p-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setFlipped(false); setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 150) }}
                  disabled={index === total - 1}
                  className="flex-1 rounded-xl h-11 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Still learning
                </Button>
                <Button
                  onClick={markKnown}
                  className="flex-1 rounded-xl h-11 bg-teal-600 hover:bg-teal-700"
                >
                  Got it ✓
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={goNext}
                disabled={index === total - 1}
                className="flex-shrink-0 rounded-xl h-11 w-11 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          /* Completion screen */
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-teal-200 p-10 flex flex-col items-center gap-4 text-center shadow-sm">
            <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
              <Layers className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Deck complete!</h2>
            <p className="text-gray-500">You marked all {total} cards as known.</p>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" onClick={resetDeck} className="flex-1 rounded-xl h-11">
                <RotateCcw className="h-4 w-4 mr-2" /> Study again
              </Button>
              <Button onClick={() => navigate(`/courses/${courseId}`)} className="flex-1 rounded-xl h-11 bg-teal-600 hover:bg-teal-700">
                Back to course
              </Button>
            </div>
          </div>
        )}

        {/* Dot navigation */}
        {total <= 20 && (
          <div className="flex gap-1.5 flex-wrap justify-center max-w-lg">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setFlipped(false); setIndex(i) }}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === index
                    ? 'bg-teal-600 w-4'
                    : known.has(c.id)
                    ? 'bg-teal-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
