import { stringify } from "querystring";
import { RedisCLIPool, RedisEmitter } from "./redis"
class RedisTag {
	readonly name: string;
	// debugKey: string = "All";
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

	fetchAllTagRedis(tag: RedisTag, cli_pool: RedisCLIPool): Map<string, string> {
		var keys: string[] = [];
		var keyValues: string[] = [];
		if (tag.keys.includes("*")) {
			cli_pool.getConnection().then((cli) => {
				//  This defo doesnt work # TODO
				cli.keys("*").then((fetched) => {
					keys = fetched
				}).then(() => {
					cli_pool.release(cli)
				})

			}).then(() => {
				cli_pool.getKeyVals(keys).then((vals) => { keyValues = vals })
			})

		} else {
			keys = tag.keys
			cli_pool.getKeyVals(keys).then((vals) => { keyValues = vals })
		}
		var ret: Map<string, string> = new Map<string, string>();
		for (let i: number = 0; i < keys.length; i++) {
			ret.set(keys[i], keyValues[i])
		}
		return ret;

	}
}
export { RedisTag, service }
