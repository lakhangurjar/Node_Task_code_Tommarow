import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone
        }
    });

    res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });

    await prisma.user.update({
        where: { id: user.id },
        data: { sessionToken: token }
    });

    res.json({ message: 'Logged in successfully' });
};

export const logout = async (req: Request, res: Response) => {
    const { userId } = req as any;

    await prisma.user.update({
        where: { id: userId },
        data: { sessionToken: null }
    });

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
