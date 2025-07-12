import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// Dropdowns y Formularios
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
// Sheets, Dialogs y AlertDialogs
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
// Sidebar
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
// TanStack Table
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import Fuse from 'fuse.js';
// Icons
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CreditCardIcon,
    PlusIcon,
    ScissorsIcon,
    XIcon,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
// Photo Viewer
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useNavigate } from 'react-router';

// Hooks y Utils
import { useApp } from '@/hooks/useApp';
import { addCutSchema } from '@/schemas/validationSchemas';

export default function CutsPage() {
    const {
        clients,
        barbers,
        cuts,
        addCut,
        addClient,
        fetchClients,
        addCutPhoto,
    } = useApp();
    const navigate = useNavigate();

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);

    // Valores iniciales y formulario
    const defaultValues = useRef({
        clientName: '',
        phone: '',
        barberId: '',
        service: '',
        date: '',
        detail: '',
        nota: '',
        metodoPago: '',
    }).current;

    const addForm = useForm({
        resolver: zodResolver(addCutSchema),
        defaultValues,
    });
    const clientName = addForm.watch('clientName');

    // Sugerencias de clientes (memoizado)
    const fuse = useMemo(
        () =>
            new Fuse(clients, {
                keys: ['name'],
                threshold: 0.3,
            }),
        [clients],
    );
    const suggestions = useMemo(
        () =>
            clientName && clientName.trim() !== ''
                ? fuse.search(clientName).map(({ item }) => item)
                : [],
        [fuse, clientName],
    );

    const selectSuggestion = useCallback(
        (client) => {
            addForm.setValue('clientName', client.name, {
                shouldValidate: true,
            });
            addForm.setValue('phone', client.phone || '');
            setShowSuggestions(false);
        },
        [addForm],
    );

    const handlePhotoChange = useCallback((e) => {
        setPhotoFiles(Array.from(e.target.files));
    }, []);

    const handleAddSheetChange = useCallback(() => {
        setIsAddModalOpen((open) => !open);
        setPhotoFiles([]);
        addForm.reset(defaultValues);
    }, [addForm, defaultValues]);

    const onAddCut = useCallback(
        async (data) => {
            // Buscar o crear cliente
            let finalClient = clients.find(
                (c) => c.name.toLowerCase() === data.clientName.toLowerCase(),
            );
            let clientId = finalClient?.id;

            if (!clientId) {
                const newClient = await addClient({
                    name: data.clientName.trim(),
                    phone: data.phone?.trim() || '',
                });
                clientId = newClient?.id;
                if (!clientId) throw new Error('Error creando cliente');
                await fetchClients();
            }

            // Crear corte
            const newCut = await addCut({
                clientId,
                barberId: Number(data.barberId),
                service: data.service,
                date: new Date().toISOString().split('T')[0],
                detail: data.detail,
                nota: data.nota,
                metodoPago: data.metodoPago,
            });

            // Subir fotos
            if (addCutPhoto && photoFiles.length > 0) {
                for (const file of photoFiles) {
                    await addCutPhoto(newCut.id, file);
                }
            }

            addForm.reset();
            setPhotoFiles([]);
            setIsAddModalOpen(false);
        },
        [
            clients,
            addClient,
            fetchClients,
            addCut,
            addCutPhoto,
            photoFiles,
            addForm,
        ],
    );

    // Columnas tabla
    const columns = useMemo(
        () => [
            {
                accessorKey: 'date',
                header: 'Fecha',
                cell: ({ row }) =>
                    row.original.date
                        ? new Date(row.original.date).toLocaleDateString(
                              'es-ES',
                              {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              },
                          )
                        : '-',
            },
            {
                accessorKey: 'Client.name',
                header: 'Cliente',
                cell: ({ row }) => (
                    <span>{row.original.Client?.name || '-'}</span>
                ),
            },
            {
                accessorKey: 'Barber.name',
                header: 'Barbero',
                cell: ({ row }) => row.original.Barber?.name || '-',
            },
            {
                accessorKey: 'photos',
                enableSorting: false,
                header: 'Fotos',
                cell: ({ row }) => {
                    const count = row.original.photos?.length ?? 0;
                    return (
                        <span className="font-semibold">
                            {count} foto{count !== 1 ? 's' : ''}
                        </span>
                    );
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data: cuts,
        columns,
        initialState: {
            pagination: { pageSize: 20 },
        },
        state: { globalFilter, sorting },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Previsualización de fotos del formulario
    const photoPreviews = useMemo(
        () =>
            photoFiles.map((file, idx) => {
                const url = URL.createObjectURL(file);
                return (
                    <div
                        key={idx}
                        className="relative"
                        style={{ width: 60, height: 60 }}
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={file.name}
                            className="block"
                        >
                            <img
                                src={url}
                                alt={file.name}
                                className="rounded object-cover w-full h-full border border-muted shadow"
                            />
                        </a>
                        <button
                            type="button"
                            onClick={() =>
                                setPhotoFiles((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                )
                            }
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                            <XIcon />
                        </button>
                    </div>
                );
            }),
        [photoFiles],
    );

    return (
        <>
            <div className="h-dvh">
                <div className="h-full flex flex-col p-6 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <SidebarTrigger />
                        <div className="flex items-center space-x-2 flex-1 justify-end">
                            <Input
                                type="text"
                                placeholder="Buscar..."
                                value={globalFilter ?? ''}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                className="max-w-xs"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setPhotoFiles([]);
                                    setIsAddModalOpen(true);
                                }}
                            >
                                <PlusIcon />
                            </Button>
                        </div>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        {/* Tabla escritorio */}
                        <div className="overflow-auto size-full hidden md:block">
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
                                            <TableRow
                                                key={row.id}
                                                onClick={(e) => {
                                                    const target = e.target;
                                                    if (
                                                        target.closest(
                                                            'button',
                                                        ) ||
                                                        target.closest('a') ||
                                                        target.closest(
                                                            '[data-no-navigate]',
                                                        )
                                                    ) {
                                                        return;
                                                    }
                                                    navigate(
                                                        `/cuts/${row.original.id}`,
                                                    );
                                                }}
                                                className="cursor-pointer"
                                            >
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

                        {/* Cards mobile */}
                        <div className="overflow-auto size-full md:hidden space-y-4">
                            {table.getRowModel().rows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <ScissorsIcon className="w-12 h-12 mb-4" />
                                    <p className="text-lg font-medium">
                                        Sin registros.
                                    </p>
                                </div>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const cut = row.original;
                                    return (
                                        <Card
                                            key={cut.id}
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={(e) => {
                                                const target = e.target;
                                                if (
                                                    target.closest(
                                                        '.no-navigate',
                                                    )
                                                )
                                                    return;
                                                navigate(`/cuts/${cut.id}`);
                                            }}
                                        >
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                            <CalendarIcon className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {cut.date
                                                                    ? new Date(
                                                                          cut.date,
                                                                      ).toLocaleDateString(
                                                                          'es-ES',
                                                                          {
                                                                              weekday:
                                                                                  'short',
                                                                              day: 'numeric',
                                                                              month: 'short',
                                                                          },
                                                                      )
                                                                    : '-'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {cut.date
                                                                    ? new Date(
                                                                          cut.date,
                                                                      ).toLocaleDateString(
                                                                          'es-ES',
                                                                          {
                                                                              year: 'numeric',
                                                                          },
                                                                      )
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {cut.service}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Cliente */}
                                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                            {cut.Client?.name
                                                                ?.split(' ')
                                                                .map(
                                                                    (n) => n[0],
                                                                )
                                                                .join('') ||
                                                                '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-foreground text-sm">
                                                            {cut.Client?.name ||
                                                                'Cliente no asignado'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Cliente
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Barbero */}
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-secondary/50 rounded-lg">
                                                        <ScissorsIcon className="w-4 h-4 text-secondary-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">
                                                            {cut.Barber?.name ||
                                                                'Barbero no asignado'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Barbero
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Método de pago */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-xs px-2 py-1 rounded-full border font-medium">
                                                            {cut.metodoPago
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                cut.metodoPago.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Fotos */}
                                                {cut.photos?.length > 0 && (
                                                    <div className="pt-2 border-t border-border">
                                                        <PhotoProvider>
                                                            <div className="flex gap-2 no-navigate">
                                                                {cut.photos
                                                                    .slice(0, 4)
                                                                    .map(
                                                                        (
                                                                            photo,
                                                                            index,
                                                                        ) => (
                                                                            <PhotoView
                                                                                key={
                                                                                    photo.id
                                                                                }
                                                                                src={
                                                                                    photo.path ||
                                                                                    '/placeholder.svg'
                                                                                }
                                                                            >
                                                                                <div
                                                                                    className="relative group/photo cursor-pointer"
                                                                                    style={{
                                                                                        animationDelay: `${index * 100}ms`,
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            photo.path ||
                                                                                            '/placeholder.svg?height=60&width=60'
                                                                                        }
                                                                                        alt="Foto"
                                                                                        className="size-14 object-cover rounded-lg border shadow-sm"
                                                                                    />
                                                                                </div>
                                                                            </PhotoView>
                                                                        ),
                                                                    )}
                                                                {cut.photos
                                                                    .length >
                                                                    4 && (
                                                                    <div className="size-14 bg-muted rounded-lg border shadow-sm flex items-center justify-center">
                                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                                            +
                                                                            {cut
                                                                                .photos
                                                                                .length -
                                                                                4}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </PhotoProvider>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Paginación */}
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
            {/* Sheet (modal de agregar) */}
            <Sheet open={isAddModalOpen} onOpenChange={handleAddSheetChange}>
                <SheetContent className="w-full">
                    <SheetHeader>
                        <SheetTitle>Añadir corte</SheetTitle>
                        <SheetDescription>
                            Registre un nuevo corte con cliente, barbero y
                            detalles opcionales.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 pb-4 overflow-auto">
                        <Form {...addForm}>
                            <form
                                id="add-cut-form"
                                onSubmit={addForm.handleSubmit(onAddCut)}
                                autoComplete="off"
                                className="grid flex-1 auto-rows-min gap-6 px-4"
                            >
                                {/* Cliente */}
                                <FormField
                                    control={addForm.control}
                                    name="clientName"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Cliente*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Buscá o escribí el nombre del cliente"
                                                    autoComplete="off"
                                                    className="bg-background border border-muted rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                                                    onFocus={() =>
                                                        setShowSuggestions(true)
                                                    }
                                                    onBlur={() =>
                                                        setTimeout(
                                                            () =>
                                                                setShowSuggestions(
                                                                    false,
                                                                ),
                                                            150,
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            {/* Sugerencias flotantes */}
                                            {showSuggestions &&
                                                suggestions.length > 0 && (
                                                    <ul
                                                        className="absolute left-0 top-full mt-1 z-30 w-full
                                bg-popover border border-border rounded-xl
                                shadow-xl
                                overflow-y-auto max-h-44
                                animate-in fade-in"
                                                    >
                                                        {suggestions.map(
                                                            (client, i) => (
                                                                <li
                                                                    key={
                                                                        client.id
                                                                    }
                                                                    className={`px-4 py-2 text-sm cursor-pointer
                transition-colors
                hover:bg-primary/10 hover:text-primary
                ${i !== 0 ? 'border-t border-muted/50' : ''}
              `}
                                                                    onMouseDown={() =>
                                                                        selectSuggestion(
                                                                            client,
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
                                                                            {client.name
                                                                                .split(
                                                                                    ' ',
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        n,
                                                                                    ) =>
                                                                                        n[0],
                                                                                )
                                                                                .join(
                                                                                    '',
                                                                                )
                                                                                .slice(
                                                                                    0,
                                                                                    2,
                                                                                )}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">
                                                                                {
                                                                                    client.name
                                                                                }
                                                                            </span>
                                                                            {client.phone && (
                                                                                <span className="ml-2 text-muted-foreground text-xs">
                                                                                    {
                                                                                        client.phone
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Barbero */}
                                <FormField
                                    control={addForm.control}
                                    name="barberId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Barbero*</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccioná un barbero" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {barbers.map((b) => (
                                                        <SelectItem
                                                            key={b.id}
                                                            value={String(b.id)}
                                                        >
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Servicio */}
                                <FormField
                                    control={addForm.control}
                                    name="service"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Servicio*</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccioná el servicio" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Corte">
                                                        Corte
                                                    </SelectItem>
                                                    <SelectItem value="Corte + Barba">
                                                        Corte + Barba
                                                    </SelectItem>
                                                    <SelectItem value="Barba">
                                                        Barba
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Detalle */}
                                <FormField
                                    control={addForm.control}
                                    name="detail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Detalle</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Notas sobre el servicio realizado"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Nota */}
                                <FormField
                                    control={addForm.control}
                                    name="nota"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nota</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Agregá alguna aclaración o comentario adicional"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Método de pago */}
                                <FormField
                                    control={addForm.control}
                                    name="metodoPago"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Método de pago*
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccioná el método de pago" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="efectivo">
                                                        Efectivo
                                                    </SelectItem>
                                                    <SelectItem value="transferencia">
                                                        Transferencia
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Fotos */}
                                <FormItem>
                                    <FormLabel>Fotos</FormLabel>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoChange}
                                    />
                                    <div className="mt-2 flex gap-2 flex-wrap">
                                        {photoPreviews}
                                    </div>
                                </FormItem>
                            </form>
                        </Form>
                    </div>
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="add-cut-form"
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
        </>
    );
}
