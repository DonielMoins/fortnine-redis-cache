import http from "http";
import sockio, { ServerOptions } from "socket.io";
import { Client } from "socket.io/dist/client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

class clientDB extends Map<string, Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>>{
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

	private readonly clients: clientDB = new clientDB();
	constructor(srv?: http.Server | number | undefined, opts?: Partial<ServerOptions> | undefined) {
		super(srv, opts)
		this.on("connect", (socket) => {
			this.clients.addClient(socket.id, socket.client);
		})
		this.on("disconnect", (socket) => {
			this.clients.delete(socket.id);
		})
	}
}

export default sock