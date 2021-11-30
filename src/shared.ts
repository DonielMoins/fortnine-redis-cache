import { IORedisPoolOptions } from "ts-ioredis-pool";
import { SubscriberPool, RedisCLIPool, RedisEmitter } from "./services/redis";
import sock from "./services/socket";
import { RedisTag, service as tagSrv } from "./services/tag";


// REDIS
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

const RedEvents: RedisEmitter = new RedisEmitter();

const RedSubPool = new SubscriberPool(poolOpts, RedEvents);
const RedCLIPool = new RedisCLIPool(poolOpts);

// Subscribe to all key SET commands then Emit to redisEmitter.
// Each Tag will listen to all changes, if key included in tag is changed
// send an update event to every client in tag's room (in the socket rooms).

// Smarter way to do this would be to have a subscriber per tag,
// that way we cut down the useless checks. Therefore better performance.
// But honestly too lazy to do that rn. #TODO

// Also looks like i... actually planned it that way... (when tf?)
// Thank you past me for actually making a plan...

// YO TF... I MADE IT POSSIBLE TO RUN A FUNCTION ON A SUB BEING TRIGGERED
// bruh when did i get so big brain...

RedSubPool.addPSub("__keyspace@0__:*", "Change")


// Tag
const tagList = [
	new RedisTag("all", ["*"]),
	new RedisTag("example", ["Qi1"])
]
const TagService = new tagSrv(tagList, RedEvents);

// Socket Server

const SocketService = new sock()


export { SocketService, TagService, RedEvents, RedCLIPool, RedSubPool }
