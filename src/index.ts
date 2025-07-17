import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import menuRoutes from './routes/menuRoutes';
import connectDB from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir todas las solicitudes CORS
app.use(cors({
  origin: '*', // ¡Permitir todos los orígenes!
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Error connecting to database:', error);
  });
