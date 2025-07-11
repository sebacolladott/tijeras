export default function ClientsPage() {
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
