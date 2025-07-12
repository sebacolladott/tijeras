import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// Componentes UI
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
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
import { zodResolver } from '@hookform/resolvers/zod';
// TanStack Table
// Icons
import {
    CalendarIcon,
    EditIcon,
    FileTextIcon,
    MailIcon,
    PhoneIcon,
    ScissorsIcon,
    StarIcon,
    TrashIcon,
    UserIcon,
    XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// Photo Viewer
import 'react-photo-view/dist/react-photo-view.css';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

// Hooks y Utils
import { useApp } from '@/hooks/useApp';
import { clientSchema } from '@/schemas/validationSchemas';

export default function ClientDetailsPage() {
    const { clients, cuts, updateClient, deleteClient } = useApp();
    const navigate = useNavigate();
    const { id } = useParams();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [clientCuts, setClientCuts] = useState([]);
    const [histLoading, setHistLoading] = useState(true);

    const client = useMemo(
        () => clients.find((c) => String(c.id) === String(id)),
        [clients, id],
    );

    const defaultValues = useMemo(
        () => ({
            name: client?.name || '',
            phone: client?.phone || '',
            email: client?.email || '',
            notes: client?.notes || '',
        }),
        [client],
    );

    const editForm = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues,
    });

    useEffect(() => {
        setHistLoading(true);
        const filteredCuts = cuts
            .filter((cut) => String(cut.clientId) === String(id))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena por fecha DESC
        setClientCuts(filteredCuts);
        setHistLoading(false);
    }, [id, cuts]);

    const handleEditSheetChange = useCallback(() => {
        setIsEditModalOpen(!isEditModalOpen);
        editForm.reset(defaultValues);
    }, [isEditModalOpen, defaultValues, editForm]);

    const onEditClient = useCallback(
        async (data) => {
            await updateClient(id, data);
            editForm.reset(defaultValues);
            setIsEditModalOpen(false);
        },
        [updateClient, id, editForm, defaultValues],
    );

    const handleDeleteClient = useCallback(
        async (id) => {
            await deleteClient(id);
            navigate('/clients');
        },
        [deleteClient, navigate],
    );

    const barberCounts = {};
    clientCuts.forEach((cut) => {
        if (cut.Barber?.id != null) {
            const key = String(cut.Barber.id);
            barberCounts[key] = (barberCounts[key] || 0) + 1;
        }
    });
    let favoriteBarberId = null;
    let favoriteBarberName = null;
    if (Object.keys(barberCounts).length) {
        const [id] = Object.entries(barberCounts).sort(
            (a, b) => b[1] - a[1],
        )[0];
        favoriteBarberId = id;
        favoriteBarberName =
            clientCuts.find((cut) => String(cut.Barber?.id) === id)?.Barber
                ?.name || null;
    }

    if (!client) {
        return (
            <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl shadow text-center">
                <h2 className="font-bold mb-4">Cliente no encontrado</h2>
                <Button onClick={() => navigate('/clients')}>Volver</Button>
            </div>
        );
    }

    return (
        <>
            <div className="h-dvh">
                <div className="h-full flex flex-col p-6 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <SidebarTrigger />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <XIcon />
                        </Button>
                    </div>

                    {/* Cliente Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16">
                                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                    {client.name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('') || 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {client.name}
                                </h1>
                                <Badge>
                                    Cliente desde{' '}
                                    {client.createdAt
                                        ? new Date(
                                              client.createdAt,
                                          ).toLocaleDateString('es-ES', {
                                              weekday: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              month: 'short',
                                          })
                                        : '-'}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end sm:justify-start">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <EditIcon />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                    toast(`¿Eliminar a ${client.name}?`, {
                                        description: `Esto también eliminará todos los cortes asociados a ${client.name}.`,
                                        action: {
                                            label: 'Confirmar',
                                            onClick: () => {
                                                handleDeleteClient(client.id);
                                            },
                                        },
                                    })
                                }
                            >
                                <TrashIcon />
                            </Button>
                        </div>
                    </div>

                    {/* Contact Info and Notes */}
                    <div className="relative flex-1 overflow-hidden">
                        <div className="overflow-auto size-full">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="h-fit">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserIcon className="text-muted-foreground" />
                                            <span>Información de contacto</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                                                <PhoneIcon className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {client.phone || (
                                                        <span className="text-muted-foreground">
                                                            No registrado
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Teléfono
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                                                <MailIcon className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {client.email || (
                                                        <span className="text-muted-foreground">
                                                            No registrado
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Email
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FileTextIcon className="text-muted-foreground" />
                                            Notas del cliente
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Preferencias y observaciones
                                            importantes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="min-h-[40px] rounded bg-muted/50 p-3">
                                            <span
                                                className={
                                                    client.notes
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {client.notes ||
                                                    'Sin notas registradas.'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Historial */}
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <ScissorsIcon className="text-muted-foreground" />
                                            Historial de cortes
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Servicios realizados (
                                            {clientCuts.length} servicios)
                                        </CardDescription>
                                        {/* Barbero favorito dinámico */}
                                        {favoriteBarberId && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                                                <StarIcon />
                                                Barbero favorito:&nbsp;
                                                <span className="font-semibold">
                                                    {favoriteBarberName ||
                                                        'No registrado'}
                                                </span>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {histLoading ? (
                                            <div className="text-sm text-muted-foreground">
                                                Cargando historial...
                                            </div>
                                        ) : clientCuts.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">
                                                Sin cortes registrados.
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {clientCuts.map(
                                                    (cut, index) => (
                                                        <div key={cut.id}>
                                                            <Card className="border bg-muted/30 shadow-none">
                                                                <CardContent className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                                        <span className="font-medium">
                                                                            {
                                                                                cut.date
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-semibold text-base">
                                                                        {
                                                                            cut.service
                                                                        }
                                                                    </h4>
                                                                    <p
                                                                        className={`text-sm flex items-center gap-1 ${
                                                                            cut
                                                                                .Barber
                                                                                ?.id ===
                                                                            favoriteBarberId
                                                                                ? 'text-yellow-600 font-semibold'
                                                                                : 'text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        Barbero:{' '}
                                                                        {cut
                                                                            .Barber
                                                                            ?.name ||
                                                                            'Desconocido'}
                                                                        {cut
                                                                            .Barber
                                                                            ?.id ===
                                                                            favoriteBarberId && (
                                                                            <StarIcon className="w-4 h-4 text-yellow-400 ml-1" />
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        {cut.detail ||
                                                                            'Sin detalles'}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                            {index <
                                                                clientCuts.length -
                                                                    1 && (
                                                                <Separator className="my-4" />
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Sheet open={isEditModalOpen} onOpenChange={handleEditSheetChange}>
                <SheetContent className="w-full">
                    <SheetHeader>
                        <SheetTitle>Editar cliente</SheetTitle>
                        <SheetDescription>
                            Actualizá los datos del cliente y no olvides guardar
                            los cambios cuando termines.
                        </SheetDescription>
                    </SheetHeader>
                    <Form {...editForm}>
                        <form
                            id="edit-client-form"
                            onSubmit={editForm.handleSubmit(onEditClient)}
                            className="grid flex-1 auto-rows-min gap-6 px-4"
                            autoComplete="off"
                        >
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Escribí el nombre completo del cliente"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: +54 9 11 1234-5678"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: nombre@correo.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Agregá alguna nota o detalle adicional"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="edit-client-form"
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
