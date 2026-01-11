import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    throw new Error('REDIS_URL is not defined');
};

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const redis =
    globalForRedis.redis ??
    new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Slot locking utilities
export const SLOT_LOCK_PREFIX = 'slot_lock:';
export const SLOT_LOCK_DURATION = (parseInt(process.env.SLOT_LOCK_DURATION_MINUTES || '10') * 60); // seconds

export async function lockSlot(
    vendorId: string,
    startTime: Date,
    sessionId: string
): Promise<boolean> {
    const key = `${SLOT_LOCK_PREFIX}${vendorId}:${startTime.toISOString()}`;
    const result = await redis.set(key, sessionId, 'EX', SLOT_LOCK_DURATION, 'NX');
    return result === 'OK';
}

export async function unlockSlot(
    vendorId: string,
    startTime: Date,
    sessionId: string
): Promise<boolean> {
    const key = `${SLOT_LOCK_PREFIX}${vendorId}:${startTime.toISOString()}`;
    const currentSession = await redis.get(key);

    if (currentSession === sessionId) {
        await redis.del(key);
        return true;
    }

    return false;
}

export async function isSlotLocked(
    vendorId: string,
    startTime: Date
): Promise<boolean> {
    const key = `${SLOT_LOCK_PREFIX}${vendorId}:${startTime.toISOString()}`;
    const exists = await redis.exists(key);
    return exists === 1;
}

export async function extendSlotLock(
    vendorId: string,
    startTime: Date,
    sessionId: string
): Promise<boolean> {
    const key = `${SLOT_LOCK_PREFIX}${vendorId}:${startTime.toISOString()}`;
    const currentSession = await redis.get(key);

    if (currentSession === sessionId) {
        await redis.expire(key, SLOT_LOCK_DURATION);
        return true;
    }

    return false;
}
