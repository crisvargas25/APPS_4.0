// Importa el módulo 'express', que es un framework para crear servidores web y APIs en Node.js
import express from 'express';
// Importa 'morgan', un middleware que registra las solicitudes HTTP en la consola
import morgan from 'morgan';

// Importación comentada de las rutas de autenticación (se puede habilitar cuando exista el archivo correspondiente)
import authRoutes from './routes/auth.route';
import connectDB from './config/db';

// Crea una instancia de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware que permite a Express interpretar JSON en las solicitudes entrantes
app.use(express.json());
// Middleware que utiliza Morgan para registrar las solicitudes en el formato 'dev' (resumen legible)
app.use(morgan('dev'));

// Middleware comentado que montaría las rutas de autenticación bajo el prefijo '/api/auth'
app.use('/api/auth', authRoutes);

// Inicia el servidor y lo pone a escuchar en el puerto definido. Imprime un mensaje en consola cuando está listo.



connectDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})


