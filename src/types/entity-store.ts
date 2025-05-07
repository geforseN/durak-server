export interface Entity {
  id: string;
}

export interface EntityStore<E extends Entity> {
  get(id: E["id"]): E | undefined;
  require(id: E["id"]): E;

  set(entity: E): void;

  delete(value: E | E["id"]): boolean;
  has(value: E | E["id"]): boolean;
}
