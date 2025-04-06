'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, Plus, Trash, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Todo {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  completed: boolean;
}

const DEFAULT_TODOS: Todo[] = [
  {
    id: '1',
    title: {
      en: 'Save Surat Al-Kareaa',
      ar: 'حفظ سورة القارعة'
    },
    completed: false,
  },
  {
    id: '2',
    title: {
      en: 'Repeat Surat Al-Shams',
      ar: 'مراجعة سورة الشمس'
    },
    completed: false,
  },
];

export const TodoList = () => {
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const isRTL = locale === 'ar';
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoEn, setNewTodoEn] = useState('');
  const [newTodoAr, setNewTodoAr] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Load todos from localStorage on component mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      setTodos(DEFAULT_TODOS);
      localStorage.setItem('todos', JSON.stringify(DEFAULT_TODOS));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodoEn.trim() === '' || newTodoAr.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: {
        en: newTodoEn.trim(),
        ar: newTodoAr.trim()
      },
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setNewTodoEn('');
    setNewTodoAr('');
    setIsAddingTodo(false);
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>{t('home.todo_list')}</CardTitle>
        <Button 
          variant='outline' 
          size='sm' 
          onClick={() => setIsAddingTodo(!isAddingTodo)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isRTL ? 'إضافة مهمة' : 'Add Task'}
        </Button>
      </CardHeader>
      
      {isAddingTodo && (
        <CardContent className="border-t border-b p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRTL ? 'المهمة (بالإنجليزية)' : 'Task (English)'}
              </label>
              <Input
                value={newTodoEn}
                onChange={(e) => setNewTodoEn(e.target.value)}
                placeholder={isRTL ? 'اكتب المهمة بالإنجليزية' : 'Type task in English'}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRTL ? 'المهمة (بالعربية)' : 'Task (Arabic)'}
              </label>
              <Input
                value={newTodoAr}
                onChange={(e) => setNewTodoAr(e.target.value)}
                placeholder={isRTL ? 'اكتب المهمة بالعربية' : 'Type task in Arabic'}
                className="w-full"
                dir="rtl"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={addTodo} 
                disabled={!newTodoEn.trim() || !newTodoAr.trim()}
              >
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent className='space-y-4'>
        {todos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {isRTL ? 'لا توجد مهام حالياً' : 'No tasks yet'}
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                'flex items-center justify-between rounded-md p-2',
                todo.completed ? 'bg-muted/50' : '',
                isRTL ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'flex items-center gap-3',
                isRTL ? 'flex-row-reverse' : ''
              )}>
                <Checkbox 
                  id={`todo-${todo.id}`} 
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodoCompletion(todo.id)}
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    todo.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {todo.title[locale as 'en' | 'ar']}
                </label>
              </div>
              
              <Button 
                variant='ghost' 
                size='icon'
                onClick={() => removeTodo(todo.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash className='h-4 w-4' />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
