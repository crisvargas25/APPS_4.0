import { request, Request, response, Response } from "express";
import NodeCache from "node-cache";
import { generateAccessToken } from "../utils/generateToken";
import { cache } from "../utils/cache";
import { User } from "../models/user";
import bcrypt from 'bcryptjs';
import dayjs from "dayjs";
import { Types } from "mongoose";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "credenciales incorrectas" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "credenciales incorrectas" });
        }

        // Generate access token
        const accessToken = generateAccessToken(user.id);

        // Store token in cache with 30 minutes expiration
        cache.set(user.id, accessToken, 60 * 30);

        // Return success response with token
        return res.json({ 
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getTimeToken = (req = request, res = response) => {
    const { userId } = req.body;

    const ttl = cache.getTtl(userId); // Tiempo de vida en milisegundos

    if (!ttl) {
        return res.status(404).json({ message: "Token no existe" });
    }

    const now = Date.now();
    const timeToLife = Math.floor((ttl - now) / 1000); // Segundos restantes
    const expTime = dayjs(ttl).format('HH:mm:ss'); // Hora exacta de expiración

    return res.json({
        timeToLife,
        expTime
    });
};


export const updateToken = (req: Request, res: Response) => {
    const { userId } = req.query;

    if (typeof userId !== 'string') {
        return res.status(400).json({ message: "Parámetro 'userId' es requerido y debe ser un string" });
    }

    const ttl = cache.getTtl(userId);

    if (!ttl) {
        return res.status(404).json({ message: "Token no existe" });
    }

    const newTimeTtl: number = 60 * 15;
    cache.ttl(userId, newTimeTtl);

    return res.json({ message: "Actualizado con éxito" });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const {userEmail}=req.query;
    console.log(userEmail)
    const userList = await User.find();
    const userByEmail = await User.find({email:userEmail});

    console.log(userByEmail)
    return res.json({ userList })
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const{name, email, phone, password, role} = req.body;

    let passwordCrypt = '';
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordCrypt = await bcrypt.hash(password, salt);
    }
    const newUser = new User({
      name,
      email,
      password:passwordCrypt,
      role,
      phone,
      creationDate: Date.now(),
      status:true
    });
    const user = await newUser.save();
    console.log({user});
    return res.json({user});
    
  } catch (error) {
    console.log("Error en saveUser:", error);
    return res.status(426).json({mesage:"Error al guardar un nuevo usuario"});
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { email } = req.query;
  const { name, phone, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("No se ha encontrado el email");
      return res.status(404).json({ message: "El email no existe o es incorrecto" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    // console.log({password});
    console.log(user);
    
    return res.status(200).json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findOne({ _id: id, status: true });
    if (!user) {
      res.status(404).json({ message: 'User not found or already inactive' });
      return;
    }

    user.status = false;
    user.deleteDate = new Date();

    const savedUser = await user.save();

    res.status(200).json({
      message: 'User logically deleted successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phone: savedUser.phone,
        createdDate: savedUser.createdDate,
        deleteDate: savedUser.deleteDate,
        status: savedUser.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};