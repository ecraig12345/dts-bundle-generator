import type { NodeStream } from "./node-stream";
import type { PlainStream } from "./plain-stream";

export interface Combined {
  nodeStream: NodeStream;
  plainStream: PlainStream;
}