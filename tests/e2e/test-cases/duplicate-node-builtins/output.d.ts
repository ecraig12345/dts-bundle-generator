import { Stream } from 'node:stream';
import { Stream as Stream$1 } from 'stream';

export interface NodeStream {
	stream: Stream;
}
export interface PlainStream {
	// TODO this should be Stream$1
	stream: Stream;
}
export interface Combined {
	nodeStream: NodeStream;
	plainStream: PlainStream;
}

export {};
