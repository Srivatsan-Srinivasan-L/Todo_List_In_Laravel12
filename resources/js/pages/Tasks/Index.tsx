import { Head,router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle,Calendar,List,CheckCircle,Search,ChevronLeft,ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {  Textarea } from '@/components/ui/textarea';


import { useForm } from '@inertiajs/react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';

interface Task {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    due_date:string | null;
    list_id:number;
    list:{
        id:number;
        title:string;
    };
}

interface List {
    id:number;
    title:string;
}
interface Props {
    tasks:{
        data:Task[];
        current_page:number;
        last_page:number;
        per_page:number;
        total:number;
        form:number;
        to:number;
    };

    lists:List[];
    filters:{
        search:string;
        filter:string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs:BreadcrumbItem[]=[
    {
        title:'Tasks',
        href:'/tasks',
    },
];

export default function TasksIndex({tasks,lists,filters,flash} : Props){
        const [isOpen, setIsOpen] = useState(false);
        const [editingTask, setEditingTask] = useState<List | null>(null);
        const [showToast, setShowToast] = useState(false);
        const [toastMessage, setToastMessage] = useState('');
        const [toastType, setToastType] = useState<'success' | 'error'>('success');
        const [searchTerm,setSearchTerm] = useState(filters.search);
        const [completionFilter,setCompletionFilter] = useState<'all' | 'completed' | 'pending'>(filters.filter as 'all' | 'completed' | 'pending');


           useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
        title: '',
        description: '',
        due_date:'',
        list_date:'',
        is_completed:false as boolean,
    });

      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingTask) {
            put(route('tasks.update', editingTask.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingTask(null);
                },
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setData({
            title: task.title,
            description: task.description || '',
             due_date: task.due_date || '',
            list_id: task.list_id.toString(),
            is_completed: task.is_completed,



        });
        setIsOpen(true);
    };

    const handleDelete = (taskId: number) => {
        destroy(route('tasks.destroy', taskId));
    };


          const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('tasks.index'),

     {
        search:searchTerm,
        filter:completionFilter,


        },
        {
            preserveState:true,
            preserveScroll:true,


        });
    };

    const handleFilterChange = (value:'all'| 'completed'|'pending')=>{
        setCompletionFilter(value);
        router.get(route('tasks.index'),{
            search:searchTerm,
            filter:value,
        },{
            preserveState:true,
            preserveScroll:true,
        });
    };


         const handlePageChange = (page: number ) => {

        router.get(route('tasks.index'),

     {
                page,

        search:searchTerm,
        filter:completionFilter,


        },
        {
            preserveState:true,
            preserveScroll:true,


        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks"/>
               <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {showToast && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white animate-in fade-in slide-in-from-top-5`}>
                        {toastType === 'success' ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                        <span>{toastMessage}</span>
                    </div>
                )}
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground mt-1">Manage your task and stay organized</p>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}/>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                                <Plus className="h-4 w-4  mr-2"/>
                                New Task

                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {editingTask? 'Edit Task' : 'Create New Task'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <input id='title' value={data.title} onChange={(e)=>setData('title',e.target.value)}
                                required className="focus:ring-2 focus:ring-primary"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor='description'>Description</Label>
                                <input id='description' value={data.description} onChange={(e) => setData('description',e.target.value)}
                                className="focus:ring-2 focus:ring-primary"/>
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='list_id'>List</Label>
                                <Select  value={data.list_id} onValueChange={(value)=>setData('list_id',value)}>
                                    <SelectTrigger className="focus:ring-2 focus:ring-primary">
                                        <SelectValue placeholder="Select a list"/>

                                    </SelectTrigger>
                                    {lists.map((list)=>(
                                        <SelectItem key={list.id} value={list.id.toString()}>
                                            {list.title}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Label htmlFor="due_date">Due Date</Label>
                                <input type='date' value={data.due_date}
                                onChange={(e)=>setData('due_date',e.target.value)}
                                className="focus:ring-2 focus:ring-primary"/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id='is_completed' checked={data.is_completed} onChange={(e) =>setData('is_completed',e.target.checked)}
                                className='h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary'/>
                                <Label htmlFor="is_completed">Completed</Label>
                            </div>
                            <Button type='submit' disabled={processing}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg">
                                {editingTask ? 'Update' : 'Create'}
                            </Button>

                        </form>

                    </DialogContent>
                    <div className="flex gap-4 mb-4">
                        <form onSubmit={handleSearch} className=
                    </div>
  </div>
        </AppLayout>);

}

