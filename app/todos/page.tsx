import React from 'react'
import TodosList from './TodosList'

function Todos() {
  return (
    <div>
      {/* @ts-expect-error Server Component */}
      <TodosList />
    </div>
  )
}

export default Todos