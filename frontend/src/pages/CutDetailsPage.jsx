import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
// TanStack Table
// Icons
import {
    CalendarIcon,
    CameraIcon,
    EditIcon,
    FileSlidersIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// Photo Viewer
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

// Hooks y Utils
import { useApp } from '@/hooks/useApp';
import { editCutSchema } from '@/schemas/validationSchemas';

export default function CutDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const {
        cuts,
        fetchCuts,
        updateCut,
        deleteCut,
        deleteCutPhoto,
        addCutPhoto,
    } = useApp();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [photoFiles, setPhotoFiles] = useState([]);

    const cut = useMemo(
        () => cuts.find((c) => c.id === Number(id)),
        [cuts, id],
    );

    const defaultValues = useMemo(
        () => ({
            service: cut?.service || '',
            metodoPago: cut?.metodoPago || '',
            detail: cut?.detail || '',
            nota: cut?.nota || '',
        }),
        [cut],
    );

    const editForm = useForm({
        resolver: zodResolver(editCutSchema),
        defaultValues,
    });

    useEffect(() => {
        if (isEditModalOpen && cut) {
            editForm.reset(defaultValues);
        }
    }, [isEditModalOpen, cut, defaultValues, editForm]);

    const handleEditSheetChange = useCallback(() => {
        setIsEditModalOpen((prev) => !prev);
        if (isEditModalOpen) {
            setPhotoFiles([]); // ✅ Limpiar fotos nuevas al cerrar
        }
    }, [isEditModalOpen]);

    const onEditCut = useCallback(
        async (data) => {
            await updateCut(cut.id, data);

            // Subir fotos nuevas si existen
            if (photoFiles.length > 0) {
                for (const file of photoFiles) {
                    await addCutPhoto(cut.id, file);
                }
                setPhotoFiles([]);
            }

            // 🔥 Refrescar la lista de cortes para que se actualice el detalle
            await fetchCuts();

            setIsEditModalOpen(false);
        },
        [updateCut, cut, photoFiles, addCutPhoto, fetchCuts],
    );

    const handleDeleteClient = useCallback(
        async (id) => {
            await deleteCut(id);
            navigate('/cuts');
        },
        [deleteCut, navigate],
    );

    const onDeletePhoto = useCallback(
        async (photoId) => {
            toast(`¿Eliminar esta foto?`, {
                description: `Esta acción no se puede deshacer.`,
                action: {
                    label: 'Confirmar',
                    onClick: () => {
                        deleteCutPhoto(cut.id, photoId);
                    },
                },
            });
        },
        [cut, deleteCutPhoto],
    );

    if (!cut) {
        return (
            <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl shadow text-center">
                <h2 className="font-bold mb-4 text-lg">Corte no encontrado</h2>
                <Button onClick={() => navigate('/cuts')}>
                    Volver al listado
                </Button>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Cliente y Barber */}
                        <div className="flex items-center gap-5">
                            <Avatar className="size-16 shrink-0">
                                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                    {cut.Client?.name
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('') || 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-1">
                                <h1 className="text-2xl sm:text-3xl font-bold break-words line-clamp-2">
                                    {cut.Client?.name ? (
                                        cut.Client.name
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </h1>
                                <div className="text-base sm:text-lg font-medium flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                        Barbero:
                                    </span>
                                    {cut.Barber?.name ? (
                                        <span>{cut.Barber.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center flex-wrap gap-2 text-sm">
                                    <Badge>{cut.service}</Badge>
                                    <Badge variant="secondary">
                                        <CalendarIcon />
                                        <p>
                                            {cut.date
                                                ? new Date(
                                                      cut.date,
                                                  ).toLocaleDateString(
                                                      'es-ES',
                                                      {
                                                          weekday: 'short',
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : '-'}
                                        </p>
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-2 justify-end sm:justify-start">
                            {/* Botón Editar */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <EditIcon />
                            </Button>

                            {/* 🔥 Botón Eliminar */}
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                    toast(`¿Eliminar este corte?`, {
                                        description: `Esta acción no se puede deshacer.`,
                                        action: {
                                            label: 'Confirmar',
                                            onClick: () => {
                                                handleDeleteClient(cut.id);
                                            },
                                        },
                                    })
                                }
                            >
                                <TrashIcon />
                            </Button>
                        </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="relative flex-1 overflow-hidden">
                        <div className="overflow-auto h-full w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Servicio */}
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                            <FileSlidersIcon className="text-muted-foreground" />
                                            <span>Servicio</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="font-medium">
                                            {cut.service}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Método de pago:{' '}
                                            {cut.metodoPago || '—'}
                                        </p>
                                        {cut.nota && !!cut.nota.trim() && (
                                            <p className="text-sm text-muted-foreground">
                                                Nota: {cut.nota}
                                            </p>
                                        )}
                                        {cut.detail && !!cut.detail.trim() && (
                                            <p className="text-sm text-muted-foreground">
                                                Detalle: {cut.detail}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Fotos */}
                                {cut.photos?.length > 0 && (
                                    <Card className="lg:col-span-3">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                                <CameraIcon className="text-muted-foreground" />
                                                <span>Fotos</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {cut.photos &&
                                            cut.photos.length > 0 ? (
                                                <PhotoProvider>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                        {cut.photos.map(
                                                            (photo) => (
                                                                <div
                                                                    key={
                                                                        photo.id
                                                                    }
                                                                    className="relative rounded overflow-hidden group"
                                                                >
                                                                    <AspectRatio
                                                                        ratio={
                                                                            1
                                                                        }
                                                                    >
                                                                        <PhotoView
                                                                            src={
                                                                                photo.path
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    photo.path
                                                                                }
                                                                                alt="Foto"
                                                                                className="w-full h-full object-cover rounded cursor-pointer"
                                                                            />
                                                                        </PhotoView>
                                                                    </AspectRatio>
                                                                    {/* Botón eliminar siempre visible */}
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute top-1 right-1 z-10"
                                                                        onClick={() =>
                                                                            onDeletePhoto(
                                                                                photo.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <XIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </PhotoProvider>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Sin fotos registradas.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sheet de edición */}
            <Sheet open={isEditModalOpen} onOpenChange={handleEditSheetChange}>
                <SheetContent className="w-full">
                    <SheetHeader>
                        <SheetTitle>Editar corte</SheetTitle>
                        <SheetDescription>
                            Actualice los datos del servicio realizado o agregue
                            nuevas fotos.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 pb-4 overflow-auto">
                        <Form {...editForm}>
                            <form
                                id="edit-cut-form"
                                onSubmit={editForm.handleSubmit(onEditCut)}
                                autoComplete="off"
                                className="grid flex-1 auto-rows-min gap-6 px-4"
                            >
                                {/* Servicio */}
                                <FormField
                                    control={editForm.control}
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

                                {/* Método de pago */}
                                <FormField
                                    control={editForm.control}
                                    name="metodoPago"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Método de Pago*
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

                                {/* Detalle */}
                                <FormField
                                    control={editForm.control}
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
                                    control={editForm.control}
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

                                {/* Subir nuevas fotos */}
                                <FormItem>
                                    <FormLabel>Nuevas fotos</FormLabel>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) =>
                                            setPhotoFiles(
                                                Array.from(e.target.files),
                                            )
                                        }
                                    />
                                    <div className="mt-2 flex gap-2 flex-wrap">
                                        {photoFiles &&
                                            photoFiles.length > 0 &&
                                            photoFiles.map((file, idx) => {
                                                const url =
                                                    URL.createObjectURL(file);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="relative"
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                        }}
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
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-1 right-1"
                                                            onClick={() =>
                                                                setPhotoFiles(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                _,
                                                                                i,
                                                                            ) =>
                                                                                i !==
                                                                                idx,
                                                                        ),
                                                                )
                                                            }
                                                        >
                                                            <XIcon />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </FormItem>
                            </form>
                        </Form>
                    </div>
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="edit-cut-form"
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
