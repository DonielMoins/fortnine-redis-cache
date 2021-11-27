import { IORedisPool, IORedisPoolOptions } from "ts-ioredis-pool";
import IORedis from "ioredis";
import EventEmitter from "events";

class RedisEmitter extends EventEmitter { };
// Event to be
const eventHandler: RedisEmitter = new RedisEmitter();

// CLI
class RedisCLIPool extends IORedisPool {

	constructor(opts: IORedisPoolOptions) {
		super(opts)
	}

	// [x: string]: any;

	setKey(key: string, value: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const client = await this.getConnection()
				if (client) {
					client.set(key, value)

					// Don't forget to release your connection
					await this.release(client)
					resolve(true)
				}
			} catch (err: any) {
				reject(err)
			}
		});
	};

	setKeys(obj: Map<string, string>): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const client = await this.getConnection()
				if (client) {
					obj.forEach((key, val) => {
						if (!key) throw new Error("Key value cannot be null!");
						client.set(key, val);
					})

					// Don't forget to release your connection
					await this.release(client)
					resolve(true)
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
				var finalList = new Array<string>();
				if (client) {
					for (const key in keys) {
						if ((typeof key) == (typeof String(" "))) throw new Error("Key value cannot be null!");
						finalList.push(<string>(await client.get(key)));
					}
					// Don't forget to release your connection
					await this.release(client)
					resolve(finalList);
				}
			} catch (err: any) {
				reject(err);
			}
		});
	}
}

const poolOpts = IORedisPoolOptions
	.fromUrl((process.env.REDIS_URL || "redis://127.0.0.1") as string)
	// This accepts the RedisOptions class from ioredis as an argument
	// https://github.com/luin/ioredis/blob/master/lib/redis/RedisOptions.ts
	.withIORedisOptions({
		maxRetriesPerRequest: Number(process.env.REDIS_POOL_MaxRetriesPerRequest) | 3,
		autoResubscribe: true

	})
	// This accepts the Options class from @types/generic-pool as an argument
	// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/generic-pool/index.d.ts#L36
	.withPoolOptions({
		max: Number(process.env.REDIS_POOL_MAX) | 50,
		min: Number(process.env.REDIS_POOL_MIN) | 0,
		autostart: true,
	})

/*
	NOTE: Do not forget to release all clients if
	you are going to use any stock functions.
*/
const CLIPool = new RedisCLIPool(poolOpts);

// Subscriber
// class SuberData extends Object {
//     subscriber: typeof IORedis;
//     subscribedTo: Array<string> | null = new Array();
//     channels: Array<string> | null = new Array();
// }
class SubscriberPool extends IORedisPool {
	private activeSubs: number;

	constructor(opts: IORedisPoolOptions) {
		super(opts)
		this.activeSubs = 0;
	}

	// subs: Array<SuberData> = new Array();
	addPSub(sub: string, event: string | Function): void {
		var client: any;
		new Promise(() => {
			client = this.getConnection()
				.then(
					(subscriber) => {
						if (subscriber) this.activeSubs++
						if (typeof event == typeof String()) {
							subscriber.subscribe(sub, (err, _activeChannels) => {
								if (err) {
									this.release(subscriber).then(() => this.activeSubs--)
								}
							})
							// Does adding a listener like this even work??
							subscriber.on("message", (...args: any[]) => {
								eventHandler.emit(<string>event, args)
							})
						} else {
							subscriber.on("message", (...args: any[]) => {
								(<Function>event)()
							})
						}
					});


		}).finally(() => this.release(<IORedis.Redis>client))
	}
	addSub(sub: string, event: string | Function): void {
		var client: any;
		new Promise(() => {
			client = this.getConnection()
				.then(
					(subscriber) => {
						if (subscriber) this.activeSubs++
						if (typeof event == typeof String()) {
							subscriber.subscribe(sub, (err, _activeChannels) => {
								if (err) {
									this.release(subscriber).then(() => this.activeSubs--)
								}
							})
							// Does adding a listener like this even work??
							subscriber.on("message", (...args: any[]) => {
								eventHandler.emit(<string>event, args)
							})
						} else {
							subscriber.on("message", (...args: any[]) => {
								(<Function>event)()
							})
						}
					});


		}).finally(() => this.release(<IORedis.Redis>client))
	}
}

let SubPool = new SubscriberPool(poolOpts)

export { CLIPool, SubPool, eventHandler as events }
