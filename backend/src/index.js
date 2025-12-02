import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`GenZ backend listening on port ${PORT}`);
    const raw = process.env.MONGO_URI || '';
    try {
        // Attempt to parse and show host only (without credentials)
        const url = new URL(raw);
        console.log('Mongo host:', url.host);
    }
    catch (e) {
        if (raw)
            console.log('Mongo URI provided (sanitized)');
        else
            console.log('No MONGO_URI provided; using default');
    }
    console.log('Redis host:', process.env.REDIS_HOST || 'redis');
});
