import ioredispool from "ts-ioredis-pool";
import bluebird from "bluebird";
import EventEmitter from "events";
import { resolve } from "path/posix";

class RedisEmitter extends EventEmitter { };
class RedisCLIPool extends ioredispool.IORedisPool {

    setKey(key: string, value: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await this.getConnection()
                if (client) {
                    client.set(key, value)

                    // Don't forget to release your connection
                    await this.release(client)
                }
            } catch (err: any) {
                reject(err)
            }
        });
    };

    setKeys(obj: Iterable<Object>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await this.getConnection()
                if (client) {
                    for (const key in obj) {
                        if (!key) throw new Error("Key value cannot be null!");
                        client.set(key, obj[key]);
                        resolve(true);
                    }

                    // Don't forget to release your connection
                    await this.release(client)
                }
            } catch (err: any) {
                reject(err)
            }
        });
    };

    getKey(key: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await this.getConnection()
                if (client) {
                    if (!key) throw new Error("Key value cannot be null!");
                    resolve(await client.get(key));

                    // Don't forget to release your connection
                    await this.release(client)
                }
            } catch (err: any) {
                reject(err);
            }
        });
    }

    getKeys(keys: Array<string>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await this.getConnection()
                var finalList = [];
                if (client) {
                    for (const key in keys) {
                        if (!key) throw new Error("Key value cannot be null!");
                        client.get(key, keys[key]);
                        resolve(true);
                    }

                    // Don't forget to release your connection
                    await this.release(client)
                }
            } catch (err: any) {
                reject(err);
            }
        });
    }


}

// Event to be
const eventHandler: RedisEmitter = new RedisEmitter();

// CLI

const ioRedisCLIPoolOpts = ioredispool.IORedisPoolOptions
    .fromUrl((process.env.REDIS_URL || "redis://127.0.0.1") as string)
    // This accepts the RedisOptions class from ioredis as an argument
    // https://github.com/luin/ioredis/blob/master/lib/redis/RedisOptions.ts
    .withIORedisOptions({
        maxRetriesPerRequest: 3
    })
    // This accepts the Options class from @types/generic-pool as an argument
    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/generic-pool/index.d.ts#L36
    .withPoolOptions({
        min: 2,
        max: 20,
    })

const ioRedisCLIPool = new RedisCLIPool(ioRedisCLIPoolOpts);

export { ioRedisCLIPool, eventHandler as eventHandler } 
