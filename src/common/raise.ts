export default function raise(err: Error | string = new Error()): never {
  throw typeof err === "string" ? new Error(err) : err;
}
