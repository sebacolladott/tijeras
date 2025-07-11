import { useApp } from "@/hooks/useApp";
import { loginSchema } from "@/schemas/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function LoginPage() {
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
