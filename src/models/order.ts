import { Document, Schema, Types, model } from "mongoose";
import { User } from "./user";

// Interfaz para tipado en TypeScript
export interface IOrder extends Document {
    _id: Types.ObjectId;
    creationDate: Date;
    fkUser: Types.ObjectId;
    total: number;
    subtotal: number;
    status: boolean; // Added for logical deletes
}

// Esquema de la orden
const orderSchema = new Schema<IOrder>({
    creationDate: {
        type: Date,
        default: Date.now,
    },
    fkUser: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
    type: Boolean,
    default: true,
    }
}, {
    timestamps: true // Opcional: agrega createdAt y updatedAt automáticamente
});

// Exportar el modelo
export const Order = model<IOrder>('Order', orderSchema, 'orders');

// Tercer parámetro es el nombre exacto de la colección en la base de datos