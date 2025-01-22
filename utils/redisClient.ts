import Redis from "ioredis";

const redis = new Redis();

export const saveToRedis = async (key: string, value: string, ttl: number) => {
	await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const getFromRedis = async (key: string) => {
	const data = await redis.get(key);
	return data ? JSON.parse(data) : null;
};

export const deleteFromRedis = async (key: string) => {
	await redis.del(key);
};

export default redis;
