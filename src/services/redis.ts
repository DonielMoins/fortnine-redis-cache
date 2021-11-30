import { IORedisPool, IORedisPoolOptions } from "ts-ioredis-pool";
import IORedis from "ioredis";
import EventEmitter from "events";

class RedisEmitter extends EventEmitter { };

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

	getKeys(keys: Array<string>): Promise<string[]> {
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



/*
	NOTE: Do not forget to release all clients if
	you are going to use any stock functions.
*/

class SubscriberPool extends IORedisPool {
	private activeSubs: number;
	private eventHandler: RedisEmitter;

	constructor(opts: IORedisPoolOptions, eventHandler: RedisEmitter) {
		super(opts)
		this.activeSubs = 0;
		this.eventHandler = eventHandler
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
								this.eventHandler.emit(<string>event, args)
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
								this.eventHandler.emit(<string>event, args)
							})
						} else {
							subscriber.on("message", (...args: any[]) => {
								(<Function>event)()
							})
						}
					});
			//  Does this work??
		}).finally(() => this.release(<IORedis.Redis>client))
	}
}



export { RedisCLIPool, SubscriberPool, RedisEmitter }
