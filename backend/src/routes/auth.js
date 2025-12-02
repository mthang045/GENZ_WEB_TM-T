import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../app.js';
import { sendVerificationEmail } from '../utils/email.js';
const router = Router();
// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const usersCollection = db.collection('users');
        const existing = await usersCollection.findOne({ email });
        if (existing)
            return res.status(400).json({ error: 'Email already used' });
        // Get next userId (auto-increment starting from 1)
        const lastUser = await usersCollection.findOne({}, { sort: { userId: -1 } });
        const nextUserId = ((lastUser === null || lastUser === void 0 ? void 0 : lastUser.userId) || 0) + 1;
        const hashed = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({
            email,
            userId: nextUserId,
            password: hashed,
            name,
            phone,
            address,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const token = jwt.sign({ sub: result.insertedId.toString(), role: 'user' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.insertedId.toString(), email, name, userId: nextUserId, role: 'user' } });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name, userId: user.userId, role: user.role } });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/forgot-password
router.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                await usersCollection.updateOne({ email }, { $set: { resetCode: code, resetCodeCreated: new Date() } });
                try {
                    await sendVerificationEmail(email, code);
                } catch (mailErr) {
                    console.error('Send email error:', mailErr);
                    return res.status(500).json({ error: 'Không gửi được email xác nhận. Vui lòng thử lại.' });
                }
                res.json({ message: 'Mã xác nhận đã được gửi về email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process forgot password' });
    }
});

// POST /api/auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        console.log('[POST /auth/reset-password] Received:', { email, code, newPassword });
        if (!email || !code || !newPassword) return res.status(400).json({ error: 'Missing fields' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email });
        if (!user || user.resetCode !== code) return res.status(400).json({ error: 'Invalid code or email' });
        // Đổi mật khẩu
        const hashed = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne({ email }, { $set: { password: hashed }, $unset: { resetCode: '', resetCodeCreated: '' } });
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
