import { useState } from 'react'
import { queryDb } from '@livestore/livestore'
import { useStore } from '@livestore/react'
import { tables, events } from '@goated/livestore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'

// Define queries
const todosQuery = queryDb(() => 
  tables.todos.where({ deletedAt: null })
)

const completedTodosQuery = queryDb(() => 
  tables.todos.where({ completed: true, deletedAt: null })
)

const pendingTodosQuery = queryDb(() => 
  tables.todos.where({ completed: false, deletedAt: null })
)

export function TodoApp() {
  const { store } = useStore()
  const [newTodoTitle, setNewTodoTitle] = useState('')
  
  // Use queries to get reactive data
  const todos = store.useQuery(todosQuery)
  const completedTodos = store.useQuery(completedTodosQuery)
  const pendingTodos = store.useQuery(pendingTodosQuery)

  const createTodo = () => {
    if (newTodoTitle.trim()) {
      store.commit(events.todoCreated({
        id: crypto.randomUUID(),
        title: newTodoTitle.trim(),
        completed: false,
        createdBy: 'user-1', // In a real app, this would be the current user ID
        createdAt: new Date(),
      }))
      setNewTodoTitle('')
    }
  }

  const toggleTodo = (id: string, completed: boolean) => {
    store.commit(events.todoUpdated({
      id,
      completed: !completed,
      updatedAt: new Date(),
    }))
  }

  const deleteTodo = (id: string) => {
    store.commit(events.todoDeleted({
      id,
      deletedAt: new Date(),
    }))
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">LiveStore Todo App</h1>
      
      {/* Add new todo */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Add a new todo..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createTodo()}
          className="flex-1"
        />
        <Button onClick={createTodo} disabled={!newTodoTitle.trim()}>
          Add
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Total: {todos.length} | Pending: {pendingTodos.length} | Completed: {completedTodos.length}
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No todos yet. Add one above!
        </div>
      )}
    </div>
  )
} 