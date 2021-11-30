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
		this.tags.forEach(_tag => {
			if (_tag.name == tag) return _tag.keys
		});
		return tagKeys
	}

	fetchAllTagRedis(tag: RedisTag, cli_pool: RedisCLIPool): Map<string, string> {
		var res: string[];
		if (tag.keys.includes("*")) {
			cli_pool.getConnection().then(async (cli) => {
				//  This defo doesnt work # TODO
				cli.keys("*").then((vals) => { res = vals }).finally(() => { cli_pool.release(cli) })
			})
		} else {
			cli_pool.getKeys(tag.keys).then((vals) => { res = vals })
		}
		var ret: Map<string, string> = new Map<string, string>();
		tag.keys.map((key, index) => {
			ret.set(key, res[index])
		})
		return ret;

	}
}
export { RedisTag, service }
