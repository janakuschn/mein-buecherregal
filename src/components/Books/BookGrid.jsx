// ZIEL-PFAD: src/components/Books/BookGrid.jsx
import React from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BookCard from './BookCard'

function SortableBookCard({ book, onClick, showRatings, showProgress }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: book.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BookCard book={book} onClick={onClick} showRatings={showRatings} showProgress={showProgress} />
    </div>
  )
}

export default function BookGrid({ books, onBookClick, showRatings, showProgress, sortable, onReorder }) {
  // Zwei Sensoren für verschiedene Input-Methoden:
  // 1. PointerSensor (Desktop): ab 8px Bewegung = Drag
  // 2. TouchSensor (iPhone/Android): 1 Sekunde Long Press + 5px Toleranz = Drag
  // Damit funktioniert Drag & Drop sowohl auf Desktop als auch auf Touch-Geräten.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 1000, tolerance: 5 } })
  )

  if (!books || books.length === 0) {
    return <p className="empty-state">Noch keine Bücher in dieser Ansicht.</p>
  }

  if (!sortable) {
    return (
      <div className="book-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={onBookClick}
            showRatings={showRatings}
            showProgress={showProgress}
          />
        ))}
      </div>
    )
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = books.findIndex((b) => b.id === active.id)
    const newIndex = books.findIndex((b) => b.id === over.id)
    onReorder(arrayMove(books, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={books.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className="book-grid">
          {books.map((book) => (
            <SortableBookCard
              key={book.id}
              book={book}
              onClick={onBookClick}
              showRatings={showRatings}
              showProgress={showProgress}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
