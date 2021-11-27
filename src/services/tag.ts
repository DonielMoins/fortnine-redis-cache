enum RedisTagTypes {
	SPECIFIC
}

class RedisTag {
	readonly name: string;

	// readonly tagType: RedisTagTypes;
	// priority: number;

	public constructor(name: string) {
		this.name = name;
		// this.tagType = RedisTagTypes.SPECIFIC;
		// this.priority = priority ? priority : -1;
	}
}

// Tag handler, processes and caches keys and namespaces for each tag
// Stores all tags, client IDs associated to each tag, and cached keys for
// faster data fetching
class service {
	readonly cacheEnabled: boolean;
	private tags: Array<RedisTag>;
	private tagRelations: Map<RedisTag, Array<string> | null>;

	constructor(tags: Array<RedisTag> | null, cacheKeys: boolean | null) {
		this.tags = tags ? tags : new Array();
		this.cacheEnabled = (typeof cacheKeys == typeof Boolean) ? <boolean>cacheKeys : true;
		this.tagRelations = new Map();
		this.tags.forEach((value) => this.tagRelations.set(value, null))
	}

	getAllTags(): Promise<any> {
		return new Promise((res) => {
			res(new Array(...this.tags))
		});
	}

	addTags(tagArray: Array<RedisTag>): Promise<any> {
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

	getClientTags(client: string): Array<RedisTag> | undefined {
		let invertedMap: Map<string, Array<RedisTag>> = new Map();
		this.tagRelations.forEach((clients, tag) => clients?.forEach((ID) => invertedMap.has(ID) ? invertedMap.get(ID)?.push(tag) : invertedMap.set(ID, new Array(tag))))
		return invertedMap.get(client)
	}

	getTagKeys(): void {
	}
}

