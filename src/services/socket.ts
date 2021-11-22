import { any, map } from "bluebird";
import sockio from "socket.io";
import { Client } from "socket.io/dist/client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

class clientMap extends Map<string, Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>>{
	private length: number;

	constructor() {
		super()
		this.length = 0;
	}

	_disconnect(client_id: string): void {
		this.get(client_id)?._disconnect()
		this.delete(client_id);
		this.length--
	}

	isConnected(client_id: string): boolean {
		return this.has(client_id) ? true : false;
	}

	addClient(client_id: string, client: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) {
		if (!this.has(client_id)) {
			if ([...this.values()].includes(client)) {
				this.forEach((value: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, key: string, map: Map<string, Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>>) => {
					if (value === client) {
						this.set(client_id, client)
						this.delete(key);
					}
				})
			} else {
				this.set(client_id, client);
				this.length++
			}
		}
	}

}
class sock extends sockio.Server {

	private readonly clients: clientMap = new clientMap();
	constructor() {
		super()
		this.on("connect", (socket) => {
			this.clients.addClient(socket.id, socket.client);
		})
		this.on("disconnect", (socket) => {
			this.clients.delete(socket.id);
		})
	}
}

export { sock }