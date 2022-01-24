import { RedisCLIPool, RedisEmitter } from "./redis"
class RedisTag {
	readonly name: string;
	keys: string[] = [];
	// readonly tagType: RedisTagTypes;
	// priority: number;

	constructor(name: string);
	constructor(name: string, keys: string[]);
	constructor(...args: any[]) {
		this.name = args[0];
		this.keys = args[1]

		// this.tagType = RedisTagTypes.SPECIFIC;
		// this.priority = priority ? priority : -1;
	}


}

// Tag handler, processes and caches keys and namespaces for each tag
// Stores all tags, client IDs associated to each tag, and cached keys for
// faster data fetching
class service {
	// readonly cacheEnabled: boolean;
	private tags: Array<RedisTag>;
	private tagRelations: Map<RedisTag, Array<string> | null>;

	constructor(tags: Array<RedisTag>, redisEvents: RedisEmitter | null) {
		this.tags = tags;
		// this.cacheEnabled = (typeof cacheKeys == typeof Boolean) ? <boolean>cacheKeys : true;
		this.tagRelations = new Map();
		this.tags.forEach((value) => this.tagRelations.set(value, null))
	}

	getAllTags(): Promise<any> {
		return new Promise((res) => {
			return new Array(...this.tags)
		});
	}

	addTags(tagArray: RedisTag[]): Promise<any> {
		return new Promise((res) => {
			this.tags = [...this.tags, ...tagArray]
			res(this.tags)
		})
	}

	addTag(newtag: RedisTag): Promise<any> {
		return new Promise((res) => {
			this.tags.push(newtag)
			res(this.tags)
		})
	}

	getClientTags(client: string): RedisTag[] | undefined {
		let invertedMap: Map<string, Array<RedisTag>> = new Map();
		this.tagRelations.forEach((clients, tag) => clients?.forEach((ID) => invertedMap.has(ID) ? invertedMap.get(ID)?.push(tag) : invertedMap.set(ID, new Array(tag))))
		return invertedMap.get(client)
	}

	getTagKeys(tag: string): string[] {
		var tagKeys = new Array();
		for (const _tag in this.tags) {
			if (Object.prototype.hasOwnProperty.call(this.tags, _tag)) {
				const _tagname = this.tags[_tag].name;
				if (_tagname == tag) {
					return this.tags[_tag].keys
				}

			}
		}
		return tagKeys
	}
	getTag(tagName: string): RedisTag | undefined {
		for (const tag in this.tags) {
			if (Object.prototype.hasOwnProperty.call(this.tags, tag)) {
				const _tagName = this.tags[tag].name;
				if (_tagName == tagName) return this.tags[tag]
			}
		}
		return
	}

	fetchTagMap(tag: RedisTag, cli_pool: RedisCLIPool): Promise<Map<string, string>> {
		return new Promise((res, rej) => {
			try {
				var Keys: string[] = [];
				var keyValues: string[] = [];
				var ret: Map<string, string> = new Map<string, string>();
				// var cursor: string = "0"
				if (tag.keys.includes("*")) {
					cli_pool.getConnection().then((cli) => {

						// for some reason scan.then is never fulfilled??
						// figure that out lol, goodluck future me

						// while (cursor !== "-1") {
						// 	cli.scan(0).then(r => {
						// 		console.log(r)
						// 	})
						// }

						//FIXME: Keys is potentially blocking, figure out how to use redis SCAN ^
						cli.keys("*").then((keys: string[]) => {
							console.log(keys)
							cli_pool.getKeyVals(keys).then((vals) => {
								console.log(vals)
								for (let i: number = 0; i < keys.length; i++) {
									ret.set(keys[i], vals[i] ? vals[i] : "Undefined")
								}
								res(ret)
							})
						}).finally(() => {
							cli_pool.release(cli)
						})

					})
				} else {
					Keys = tag.keys
					cli_pool.getKeyVals(Keys).then((vals) => { keyValues = vals }).then(() => {
						for (let i: number = 0; i < Keys.length; i++) {
							ret.set(Keys[i], keyValues[i])
						}
					}).finally(() => { res(ret) })
				}
			} catch (err) { rej(err); }
		})

	}
}
export { RedisTag, service }
