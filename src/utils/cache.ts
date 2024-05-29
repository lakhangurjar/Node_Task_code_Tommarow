import Redis from 'ioredis';

const redis = new Redis();

export const setCache = async (key: string, value: any, expiry: number) => {
    await redis.set(key, JSON.stringify(value), 'EX', expiry);
};

export const getCache = async (key: string) => {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
};
