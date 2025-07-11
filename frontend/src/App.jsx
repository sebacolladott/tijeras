import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
  useParams,
} from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Fuse from "fuse.js";
import { toast } from "sonner";

// TanStack Table
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// Sidebar
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

// Sheets, Dialogs y AlertDialogs
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Dropdowns y Formularios
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

// Hooks y Utils
import { useIsMobile } from "./hooks/use-mobile";
import { useApp } from "./hooks/useApp";
import { cn } from "./lib/utils";

// Icons
import {
  UsersIcon,
  UserIcon,
  ScissorsIcon,
  LogOutIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  CreditCardIcon,
  NotebookIcon,
  PlusIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ImageIcon,
  ArrowLeftIcon,
  EditIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  XIcon,
  CameraIcon,
  ScissorsSquareIcon,
  GalleryVerticalEndIcon,
  FileSlidersIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FileTextIcon,
  StarIcon,
} from "lucide-react";

// Photo Viewer
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const API_URL = "/api";

// ------ LOGIN PAGE ------
const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

function LoginPage() {
  const { login, loading } = useApp();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    const success = await login(values.username, values.password);
    if (!success) {
      form.setError("username", {
        message: "Usuario o contraseña incorrectos",
      });
      form.setError("password", { message: " " }); // forzar mostrar error
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="inline-flex flex-col items-start self-center font-medium">
          <span className="font-triumvirate text-white text-2xl font-bold italic text-shadow-[2px_2px_0_#ff0000]">
            TIJERAS
          </span>
          <span className="text-[10px] font-light tracking-wide text-white self-end -mt-1">
            BARBER STUDIO
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Ingrese sus datos para acceder a su cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="false"
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Usuario"
                          autoFocus
                          autoComplete="username"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Contraseña"
                          autoComplete="current-password"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ------ DASHBOARD LAYOUT ------
function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useSidebar();
  const { user, logout } = useApp();

  const menus = [
    {
      path: "/cuts",
      title: "Cortes",
      icon: <ScissorsIcon />,
    },
    {
      path: "/clients",
      title: "Clientes",
      icon: <UsersIcon />,
    },
    {
      path: "/barbers",
      title: "Barberos",
      icon: <UserIcon />,
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menus.map(({ path, title, icon }) => (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith(path)}
                    >
                      <Link to={path} className="flex items-center">
                        {icon}
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="logo.png" alt="tijeras-logo" />
                      <AvatarFallback>TS</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">TIJERAS</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {user?.role ?? ""}
                      </span>
                    </div>
                    <EllipsisVerticalIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    <LogOutIcon />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex-1 overflow-auto bg-gradient-to-br from-background to-primary/10 text-foreground">
        <Routes>
          <Route path="/cuts" element={<CutsPage />} />
          <Route path="/cuts/:id" element={<CutDetailsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="*" element={<Navigate to="/cuts" replace />} />
        </Routes>
      </SidebarInset>
    </>
  );
}

// ------ CUTS PAGE ------
const addCutSchema = z.object({
  clientName: z.string().min(1, "El nombre del cliente es obligatorio"),
  barberId: z.string().min(1, "Seleccione un barbero"),
  service: z.enum(["Corte", "Corte + Barba", "Barba"], {
    errorMap: () => ({ message: "El servicio es obligatorio" }),
  }),
  detail: z.string().optional(),
  nota: z.string().optional(),
  metodoPago: z.enum(["efectivo", "transferencia"], {
    errorMap: () => ({ message: "El método de pago es obligatorio" }),
  }),
});

function CutsPage() {
  const {
    clients,
    barbers,
    cuts,
    addCut,
    addClient,
    fetchClients,
    addCutPhoto,
    loading,
  } = useApp();
  const navigate = useNavigate();
  console.log(loading);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  // Valores iniciales y formulario
  const defaultValues = useRef({
    clientName: "",
    phone: "",
    barberId: "",
    service: "",
    date: "",
    detail: "",
    nota: "",
    metodoPago: "",
  }).current;

  const addForm = useForm({
    resolver: zodResolver(addCutSchema),
    defaultValues,
  });
  const clientName = addForm.watch("clientName");

  // Sugerencias de clientes (memoizado)
  const fuse = useMemo(
    () =>
      new Fuse(clients, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [clients]
  );
  const suggestions = useMemo(
    () =>
      clientName && clientName.trim() !== ""
        ? fuse.search(clientName).map(({ item }) => item)
        : [],
    [fuse, clientName]
  );

  const selectSuggestion = useCallback(
    (client) => {
      addForm.setValue("clientName", client.name, { shouldValidate: true });
      addForm.setValue("phone", client.phone || "");
      setShowSuggestions(false);
    },
    [addForm]
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
        (c) => c.name.toLowerCase() === data.clientName.toLowerCase()
      );
      let clientId = finalClient?.id;

      if (!clientId) {
        const newClient = await addClient({
          name: data.clientName.trim(),
          phone: data.phone?.trim() || "",
        });
        clientId = newClient?.id;
        if (!clientId) throw new Error("Error creando cliente");
        await fetchClients();
      }

      // Crear corte
      const newCut = await addCut({
        clientId,
        barberId: Number(data.barberId),
        service: data.service,
        date: new Date().toISOString().split("T")[0],
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
    [clients, addClient, fetchClients, addCut, addCutPhoto, photoFiles, addForm]
  );

  // Columnas tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) =>
          row.original.date
            ? new Date(row.original.date).toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-",
      },
      {
        accessorKey: "Client.name",
        header: "Cliente",
        cell: ({ row }) => <span>{row.original.Client?.name || "-"}</span>,
      },
      {
        accessorKey: "Barber.name",
        header: "Barbero",
        cell: ({ row }) => row.original.Barber?.name || "-",
      },
      {
        accessorKey: "photos",
        enableSorting: false,
        header: "Fotos",
        cell: ({ row }) => {
          const count = row.original.photos?.length ?? 0;
          return (
            <span className="font-semibold">
              {count} foto{count !== 1 ? "s" : ""}
            </span>
          );
        },
      },
    ],
    []
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
          <div key={idx} className="relative" style={{ width: 60, height: 60 }}>
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
                setPhotoFiles((prev) => prev.filter((_, i) => i !== idx))
              }
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
            >
              <XIcon />
            </button>
          </div>
        );
      }),
    [photoFiles]
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
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
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
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            width: `${header.getSize()}px`,
                            cursor: "pointer",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc"
                            ? " ▲"
                            : header.column.getIsSorted() === "desc"
                            ? " ▼"
                            : ""}
                        </TableHead>
                      ))}
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
                            target.closest("button") ||
                            target.closest("a") ||
                            target.closest("[data-no-navigate]")
                          ) {
                            return;
                          }
                          navigate(`/cuts/${row.original.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: `${cell.column.getSize()}px` }}
                            className="truncate"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
                  <p className="text-lg font-medium">Sin registros.</p>
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
                        if (target.closest(".no-navigate")) return;
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
                                  ? new Date(cut.date).toLocaleDateString(
                                      "es-ES",
                                      {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                      }
                                    )
                                  : "-"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cut.date
                                  ? new Date(cut.date).toLocaleDateString(
                                      "es-ES",
                                      {
                                        year: "numeric",
                                      }
                                    )
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{cut.service}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Cliente */}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {cut.Client?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">
                              {cut.Client?.name || "Cliente no asignado"}
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
                              {cut.Barber?.name || "Barbero no asignado"}
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
                              {cut.metodoPago.charAt(0).toUpperCase() +
                                cut.metodoPago.slice(1)}
                            </span>
                          </div>
                        </div>
                        {/* Fotos */}
                        {cut.photos?.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <PhotoProvider>
                              <div className="flex gap-2 no-navigate">
                                {cut.photos.slice(0, 4).map((photo, index) => (
                                  <PhotoView
                                    key={photo.id}
                                    src={photo.path || "/placeholder.svg"}
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
                                          "/placeholder.svg?height=60&width=60"
                                        }
                                        alt="Foto"
                                        className="size-14 object-cover rounded-lg border shadow-sm"
                                      />
                                    </div>
                                  </PhotoView>
                                ))}
                                {cut.photos.length > 4 && (
                                  <div className="size-14 bg-muted rounded-lg border shadow-sm flex items-center justify-center">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                      +{cut.photos.length - 4}
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
                Página {table.getState().pagination.pageIndex + 1} de{" "}
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
              Registre un nuevo corte con cliente, barbero y detalles
              opcionales.
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
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() =>
                            setTimeout(() => setShowSuggestions(false), 150)
                          }
                        />
                      </FormControl>
                      {/* Sugerencias flotantes */}
                      {showSuggestions && suggestions.length > 0 && (
                        <ul
                          className="absolute left-0 top-full mt-1 z-30 w-full
                                bg-popover border border-border rounded-xl
                                shadow-xl
                                overflow-y-auto max-h-44
                                animate-in fade-in"
                        >
                          {suggestions.map((client, i) => (
                            <li
                              key={client.id}
                              className={`
                px-4 py-2 text-sm cursor-pointer
                transition-colors
                hover:bg-primary/10 hover:text-primary
                ${i !== 0 ? "border-t border-muted/50" : ""}
              `}
                              onMouseDown={() => selectSuggestion(client)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
                                  {client.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {client.name}
                                  </span>
                                  {client.phone && (
                                    <span className="ml-2 text-muted-foreground text-xs">
                                      {client.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
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
                            <SelectItem key={b.id} value={String(b.id)}>
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
                          <SelectItem value="Corte">Corte</SelectItem>
                          <SelectItem value="Corte + Barba">
                            Corte + Barba
                          </SelectItem>
                          <SelectItem value="Barba">Barba</SelectItem>
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
                      <FormLabel>Método de pago*</FormLabel>
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
                          <SelectItem value="efectivo">Efectivo</SelectItem>
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
            <Button type="submit" form="add-cut-form" disabled={loading}>
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

const editCutSchema = z.object({
  service: z.string().min(1, "El servicio es obligatorio"),
  metodoPago: z.string().min(1, "El método de pago es obligatorio"),
  detail: z.string().optional(),
  nota: z.string().optional(),
});

function CutDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cuts, fetchCuts, updateCut, deleteCut, deleteCutPhoto, addCutPhoto } =
    useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);

  const cut = useMemo(() => cuts.find((c) => c.id === Number(id)), [cuts, id]);

  const defaultValues = useMemo(
    () => ({
      service: cut?.service || "",
      metodoPago: cut?.metodoPago || "",
      detail: cut?.detail || "",
      nota: cut?.nota || "",
    }),
    [cut]
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
    [updateCut, cut, photoFiles, addCutPhoto, fetchCuts]
  );

  const handleDeleteClient = useCallback(
    async (id) => {
      await deleteCut(id);
      navigate("/cuts");
    },
    [deleteCut, navigate]
  );

  const onDeletePhoto = useCallback(
    async (photoId) => {
      toast(`¿Eliminar esta foto?`, {
        description: `Esta acción no se puede deshacer.`,
        action: {
          label: "Confirmar",
          onClick: () => {
            deleteCutPhoto(cut.id, photoId);
          },
        },
      });
    },
    [cut, deleteCutPhoto]
  );

  if (!cut) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl shadow text-center">
        <h2 className="font-bold mb-4 text-lg">Corte no encontrado</h2>
        <Button onClick={() => navigate("/cuts")}>Volver al listado</Button>
      </div>
    );
  }

  return (
    <>
      <div className="h-dvh">
        <div className="h-full flex flex-col p-6 space-y-4">
          <div className="flex justify-between items-center gap-2">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <XIcon />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Cliente y Barber */}
            <div className="flex items-center gap-5">
              <Avatar className="size-16 shrink-0">
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {cut.Client?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold break-words line-clamp-2">
                  {cut.Client?.name ? (
                    cut.Client.name
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </h1>
                <div className="text-base sm:text-lg font-medium flex items-center gap-1">
                  <span className="text-muted-foreground">Barbero:</span>
                  {cut.Barber?.name ? (
                    <span>{cut.Barber.name}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex items-center flex-wrap gap-2 text-sm">
                  <Badge>{cut.service}</Badge>
                  <Badge variant="secondary">
                    <CalendarIcon />
                    <p>
                      {cut.date
                        ? new Date(cut.date).toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
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
                      label: "Confirmar",
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
                    <p className="font-medium">{cut.service}</p>
                    <p className="text-sm text-muted-foreground">
                      Método de pago: {cut.metodoPago || "—"}
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
                      {cut.photos && cut.photos.length > 0 ? (
                        <PhotoProvider>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {cut.photos.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative rounded overflow-hidden group"
                              >
                                <AspectRatio ratio={1}>
                                  <PhotoView src={photo.path}>
                                    <img
                                      src={photo.path}
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
                                  onClick={() => onDeletePhoto(photo.id)}
                                >
                                  <XIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
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
              Actualice los datos del servicio realizado o agregue nuevas fotos.
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
                          <SelectItem value="Corte">Corte</SelectItem>
                          <SelectItem value="Corte + Barba">
                            Corte + Barba
                          </SelectItem>
                          <SelectItem value="Barba">Barba</SelectItem>
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
                      <FormLabel>Método de Pago*</FormLabel>
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
                          <SelectItem value="efectivo">Efectivo</SelectItem>
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
                    onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {photoFiles &&
                      photoFiles.length > 0 &&
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
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1"
                              onClick={() =>
                                setPhotoFiles((prev) =>
                                  prev.filter((_, i) => i !== idx)
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
            <Button type="submit" form="edit-cut-form">
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

// ------ CLIENTES PAGE ------
// Esquema Zod
const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z
    .string()
    .min(6, "Teléfono muy corto")
    .max(30, "Teléfono demasiado largo")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z
    .string()
    .max(255, "Máx. 255 caracteres")
    .optional()
    .or(z.literal("")),
});

function ClientsPage() {
  const { clients, addClient } = useApp();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sorting, setSorting] = useState([]);

  const defaultValues = useRef({
    name: "",
    phone: "",
    email: "",
    notes: "",
  }).current;

  const addForm = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const onAddClient = useCallback(
    async (data) => {
      await addClient({
        name: data.name.trim(),
        phone: data.phone?.trim() || "",
        email: data.email?.trim() || "",
        notes: data.notes?.trim() || "",
      });
      addForm.reset(defaultValues);
      setIsAddModalOpen(false);
    },
    [addClient, addForm, defaultValues]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => row.original.name?.trim() || "—",
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
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

  // Autofocus solo cuando se abre la Sheet
  const nameInputRef = useRef(null);

  // Resetea el form cada vez que se abre el modal
  const handleSheetChange = useCallback(
    (open) => {
      setIsAddModalOpen(open);
      if (open) {
        setTimeout(() => {
          addForm.reset(defaultValues);
          nameInputRef.current?.focus();
        }, 10);
      }
    },
    [addForm, defaultValues]
  );

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
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            width: `${header.getSize()}px`,
                            cursor: "pointer",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc"
                            ? " ▲"
                            : header.column.getIsSorted() === "desc"
                            ? " ▼"
                            : ""}
                        </TableHead>
                      ))}
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
                            target.closest("button") ||
                            target.closest("a") ||
                            target.closest("[data-no-navigate]")
                          ) {
                            return;
                          }
                          navigate(`/clients/${row.original.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: `${cell.column.getSize()}px` }}
                            className="truncate"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet para alta de cliente con Form de ShadCN */}
      <Sheet open={isAddModalOpen} onOpenChange={handleSheetChange}>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle>Añadir cliente</SheetTitle>
            <SheetDescription>
              Mantenga actualizada la lista de clientes disponibles.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 pb-4 overflow-auto">
            <Form {...addForm}>
              <form
                id="add-client-form"
                onSubmit={addForm.handleSubmit(onAddClient)}
                className="grid flex-1 auto-rows-min gap-6 px-4"
                autoComplete="off"
              >
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Escribí el nombre completo del cliente"
                          {...field}
                          ref={nameInputRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: nombre@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Agregá alguna nota o detalle adicional"
                          rows={2}
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
            <Button type="submit" form="add-client-form">
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

function ClientDetailsPage() {
  const { clients, cuts, updateClient, deleteClient } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientCuts, setClientCuts] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  const client = useMemo(
    () => clients.find((c) => String(c.id) === String(id)),
    [clients, id]
  );

  const defaultValues = useMemo(
    () => ({
      name: client?.name || "",
      phone: client?.phone || "",
      email: client?.email || "",
      notes: client?.notes || "",
    }),
    [client]
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
    [updateClient, id, editForm, defaultValues]
  );

  const handleDeleteClient = useCallback(
    async (id) => {
      await deleteClient(id);
      navigate("/clients");
    },
    [deleteClient, navigate]
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
    const [id] = Object.entries(barberCounts).sort((a, b) => b[1] - a[1])[0];
    favoriteBarberId = id;
    favoriteBarberName =
      clientCuts.find((cut) => String(cut.Barber?.id) === id)?.Barber?.name ||
      null;
  }

  if (!client) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl shadow text-center">
        <h2 className="font-bold mb-4">Cliente no encontrado</h2>
        <Button onClick={() => navigate("/clients")}>Volver</Button>
      </div>
    );
  }

  return (
    <>
      <div className="h-dvh">
        <div className="h-full flex flex-col p-6 space-y-4">
          <div className="flex justify-between items-center gap-2">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <XIcon />
            </Button>
          </div>

          {/* Cliente Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {client.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{client.name}</h1>
                <Badge>
                  Cliente desde{" "}
                  {client.createdAt
                    ? new Date(client.createdAt).toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        year: "numeric",
                        month: "short",
                      })
                    : "-"}
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
                      label: "Confirmar",
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
                        <p className="text-xs text-muted-foreground">Email</p>
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
                      Preferencias y observaciones importantes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[40px] rounded bg-muted/50 p-3">
                      <span
                        className={
                          client.notes
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {client.notes || "Sin notas registradas."}
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
                      Servicios realizados ({clientCuts.length} servicios)
                    </CardDescription>
                    {/* Barbero favorito dinámico */}
                    {favoriteBarberId && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                        <StarIcon />
                        Barbero favorito:&nbsp;
                        <span className="font-semibold">
                          {favoriteBarberName || "No registrado"}
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
                        {clientCuts.map((cut, index) => (
                          <div key={cut.id}>
                            <Card className="border bg-muted/30 shadow-none">
                              <CardContent className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {cut.date}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-base">
                                  {cut.service}
                                </h4>
                                <p
                                  className={`text-sm flex items-center gap-1 ${
                                    cut.Barber?.id === favoriteBarberId
                                      ? "text-yellow-600 font-semibold"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  Barbero: {cut.Barber?.name || "Desconocido"}
                                  {cut.Barber?.id === favoriteBarberId && (
                                    <StarIcon className="w-4 h-4 text-yellow-400 ml-1" />
                                  )}
                                </p>
                                <p className="text-sm">
                                  {cut.detail || "Sin detalles"}
                                </p>
                              </CardContent>
                            </Card>
                            {index < clientCuts.length - 1 && (
                              <Separator className="my-4" />
                            )}
                          </div>
                        ))}
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
              Actualizá los datos del cliente y no olvides guardar los cambios
              cuando termines.
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
                      <Input placeholder="Ej: +54 9 11 1234-5678" {...field} />
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
                      <Input placeholder="Ej: nombre@correo.com" {...field} />
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
            <Button type="submit" form="edit-client-form">
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

// ------ BARBERS PAGE ------
// Esquema Zod
const barberSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

function BarbersPage() {
  const { barbers, addBarber, updateBarber, deleteBarber } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [sorting, setSorting] = useState([]);

  const defaultValues = useMemo(() => ({ name: "" }), []);

  const addForm = useForm({
    resolver: zodResolver(barberSchema),
    defaultValues,
  });

  const editForm = useForm({
    resolver: zodResolver(barberSchema),
    defaultValues,
  });

  const handleAddSheetChange = useCallback(() => {
    setIsAddModalOpen(!isAddModalOpen);
    addForm.reset(defaultValues);
  }, [isAddModalOpen, defaultValues, addForm]);

  const handleEditSheetChange = useCallback(() => {
    setIsEditModalOpen(!isEditModalOpen);
    editForm.reset(defaultValues);
  }, [isEditModalOpen, defaultValues, editForm]);

  const handleEditClick = useCallback(
    (barber) => {
      setEditingBarberId(barber.id);
      editForm.setValue("name", barber.name, { shouldValidate: true });
      setIsEditModalOpen(true);
    },
    [editForm]
  );

  const onAddBarber = useCallback(
    async (data) => {
      await addBarber({ name: data.name.trim() });
      addForm.reset(defaultValues);
      setIsAddModalOpen(false);
    },
    [addBarber, addForm, defaultValues, setIsAddModalOpen]
  );

  const onEditBarber = useCallback(
    async (data) => {
      await updateBarber(editingBarberId, { name: data.name.trim() });
      editForm.reset(defaultValues);
      setIsEditModalOpen(false);
    },
    [updateBarber, editingBarberId, editForm, setIsEditModalOpen]
  );

  const handleDeleteBarber = useCallback(
    async (id) => {
      await deleteBarber(id);
    },
    [deleteBarber]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        id: "actions",
        header: () => null,
        enableHiding: false,
        maxSize: 50,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    toast(`¿Eliminar a ${row.original.name}?`, {
                      description: `Esto también eliminará todos los cortes asociados a ${row.original.name}.`,
                      action: {
                        label: "Confirmar",
                        onClick: () => {
                          handleDeleteBarber(row.original.id);
                        },
                      },
                    })
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
    [handleEditClick, handleDeleteBarber]
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
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            width: `${header.getSize()}px`,
                            cursor: "pointer",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc"
                            ? " ▲"
                            : header.column.getIsSorted() === "desc"
                            ? " ▼"
                            : ""}
                        </TableHead>
                      ))}
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
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: `${cell.column.getSize()}px` }}
                            className="truncate"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
                Página {table.getState().pagination.pageIndex + 1} de{" "}
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
              Mantenga actualizada la lista de barberos disponibles.
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
            <Button type="submit" form="add-barber-form">
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
              Realice ajustes en la información registrada de este barbero.
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
            <Button type="submit" form="edit-barber-form">
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

// ------ MAIN APP ------
export default function App() {
  const { token, user } = useApp();

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            !token || !user ? <LoginPage /> : <Navigate to="/cuts" replace />
          }
        />
        <Route
          path="/*"
          element={
            token && user ? (
              <SidebarProvider defaultOpen={false}>
                <DashboardLayout />
              </SidebarProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
