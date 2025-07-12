import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useApp } from '@/hooks/useApp';
import { barberSchema } from '@/schemas/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-photo-view/dist/react-photo-view.css';
import { toast } from 'sonner';

export default function BarbersPage() {
    const { barbers, addBarber, updateBarber, deleteBarber } = useApp();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBarberId, setEditingBarberId] = useState(null);
    const [sorting, setSorting] = useState([]);

    const defaultValues = useMemo(() => ({ name: '' }), []);

    const addForm = useForm({
        resolver: zodResolver(barberSchema),
        defaultValues,
    });

    const editForm = useForm({
        resolver: zodResolver(barberSchema),
        defaultValues,
    });

    const handleAddSheetChange = useCallback(() => {
        setIsAddModalOpen((open) => !open);
        addForm.reset(defaultValues);
    }, [defaultValues, addForm]);

    const handleEditSheetChange = useCallback(() => {
        setIsEditModalOpen((open) => !open);
        editForm.reset(defaultValues);
    }, [defaultValues, editForm]);

    const handleEditClick = useCallback(
        (barber) => {
            setEditingBarberId(barber.id);
            editForm.setValue('name', barber.name, { shouldValidate: true });
            setIsEditModalOpen(true);
        },
        [editForm],
    );

    const onAddBarber = useCallback(
        async (data) => {
            try {
                await addBarber({ name: data.name.trim() });
                addForm.reset(defaultValues);
                setIsAddModalOpen(false);
            } catch (err) {
                // Manejo de error opcional
            }
        },
        [addBarber, addForm, defaultValues],
    );

    const onEditBarber = useCallback(
        async (data) => {
            await updateBarber(editingBarberId, { name: data.name.trim() });
            editForm.reset(defaultValues);
            setIsEditModalOpen(false);
        },
        [updateBarber, editingBarberId, editForm, defaultValues],
    );

    const handleDeleteBarber = useCallback(
        async (id) => {
            await deleteBarber(id);
        },
        [deleteBarber],
    );

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nombre',
            },
            {
                id: 'actions',
                header: () => null,
                enableHiding: false,
                maxSize: 50,
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                >
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleEditClick(row.original)
                                    }
                                >
                                    <PencilIcon />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        toast(
                                            `¿Eliminar a ${row.original.name}?`,
                                            {
                                                description: `Esto también eliminará todos los cortes asociados a ${row.original.name}.`,
                                                action: {
                                                    label: 'Confirmar',
                                                    onClick: () => {
                                                        handleDeleteBarber(
                                                            row.original.id,
                                                        );
                                                    },
                                                },
                                            },
                                        )
                                    }
                                >
                                    <TrashIcon />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [handleEditClick, handleDeleteBarber],
    );

    const table = useReactTable({
        data: barbers,
        columns,
        initialState: {
            pagination: { pageSize: 20 },
        },
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <>
            <div className="h-dvh">
                <div className="h-full flex flex-col p-6 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <SidebarTrigger />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <PlusIcon />
                        </Button>
                    </div>
                    <div className="relative flex-1 overflow-hidden">
                        <div className="overflow-auto h-full w-full">
                            <Table
                                wrapperClassName="static overflow-visible"
                                className="table-fixed"
                            >
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            style={{
                                                                width: `${header.getSize()}px`,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext(),
                                                            )}
                                                            {header.column.getIsSorted() ===
                                                            'asc'
                                                                ? ' ▲'
                                                                : header.column.getIsSorted() ===
                                                                    'desc'
                                                                  ? ' ▼'
                                                                  : ''}
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="text-center"
                                            >
                                                Sin registros.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            style={{
                                                                width: `${cell.column.getSize()}px`,
                                                            }}
                                                            className="truncate"
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                Página{' '}
                                {table.getState().pagination.pageIndex + 1} de{' '}
                                {table.getPageCount()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Sheet open={isAddModalOpen} onOpenChange={handleAddSheetChange}>
                <SheetContent className="w-full">
                    <SheetHeader>
                        <SheetTitle>Añadir barbero</SheetTitle>
                        <SheetDescription>
                            Mantenga actualizada la lista de barberos
                            disponibles.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 pb-4 overflow-auto">
                        <Form {...addForm}>
                            <form
                                id="add-barber-form"
                                onSubmit={addForm.handleSubmit(onAddBarber)}
                                autoComplete="off"
                                className="grid flex-1 auto-rows-min gap-6 px-4"
                            >
                                <FormField
                                    control={addForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="¿Cómo se llama el barbero?"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="add-barber-form"
                            disabled={addForm.formState.isSubmitting}
                        >
                            Guardar
                        </Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            {/* Editar barbero */}
            <Sheet open={isEditModalOpen} onOpenChange={handleEditSheetChange}>
                <SheetContent className="w-full">
                    <SheetHeader>
                        <SheetTitle>Editar barbero</SheetTitle>
                        <SheetDescription>
                            Realice ajustes en la información registrada de este
                            barbero.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 pb-4 overflow-auto">
                        <Form {...editForm}>
                            <form
                                id="edit-barber-form"
                                onSubmit={editForm.handleSubmit(onEditBarber)}
                                className="grid flex-1 auto-rows-min gap-6 px-4"
                                autoComplete="off"
                            >
                                <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese un nuevo nombre"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="edit-barber-form"
                            disabled={editForm.formState.isSubmitting}
                        >
                            Guardar
                        </Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
