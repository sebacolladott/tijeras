import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export const addCutSchema = z.object({
    clientName: z.string().min(1, 'El nombre del cliente es obligatorio'),
    barberId: z.string().min(1, 'Seleccione un barbero'),
    service: z.enum(['Corte', 'Corte + Barba', 'Barba'], {
        errorMap: () => ({ message: 'El servicio es obligatorio' }),
    }),
    detail: z.string().optional(),
    nota: z.string().optional(),
    metodoPago: z.enum(['efectivo', 'transferencia'], {
        errorMap: () => ({ message: 'El método de pago es obligatorio' }),
    }),
});

export const editCutSchema = z.object({
    service: z.string().min(1, 'El servicio es obligatorio'),
    metodoPago: z.string().min(1, 'El método de pago es obligatorio'),
    detail: z.string().optional(),
    nota: z.string().optional(),
});

export const clientSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    phone: z
        .string()
        .min(6, 'Teléfono muy corto')
        .max(30, 'Teléfono demasiado largo')
        .optional()
        .or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    notes: z
        .string()
        .max(255, 'Máx. 255 caracteres')
        .optional()
        .or(z.literal('')),
});

export const barberSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
});
