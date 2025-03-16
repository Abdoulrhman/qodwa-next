import { MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const todos = [
  {
    id: 1,
    title: 'Save Surat Al-Kareaa',
    completed: false,
  },
  {
    id: 2,
    title: 'Repeat Surat Al-Shams',
    completed: false,
  },
];

export const TodoList = () => {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>To-do list</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {todos.map((todo) => (
          <div
            key={todo.id}
            className='flex items-center justify-between space-x-4'
          >
            <div className='flex items-center space-x-4'>
              <Checkbox id={`todo-${todo.id}`} />
              <label
                htmlFor={`todo-${todo.id}`}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {todo.title}
              </label>
            </div>
            <Button variant='ghost' size='icon'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
