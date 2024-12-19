interface Entity {
  id: string;
}

type ID = Entity["id"];

export default class EntityStore<E extends Entity> {
  #map: Map<ID, E>;
  #entityName: string;

  constructor(entityName: string, map = new Map()) {
    this.#entityName = entityName;
    this.#map = map;
  }

  get(value: ID | E) {
    return this.#map.get(this.#getEntityId(value));
  }

  require(value: ID | E) {
    const entity = this.get(this.#getEntityId(value));
    if (!entity) {
      throw new Error(`Unknown ${this.#entityName} with id = ${value}`);
    }
    return entity;
  }

  set(entity: E) {
    this.#map.set(entity.id, entity);
  }

  delete(value: ID | E) {
    return this.#map.delete(this.#getEntityId(value));
  }

  has(value: ID | E) {
    return this.#map.has(this.#getEntityId(value));
  }

  #getEntityId(value: ID | E) {
    return typeof value === "string" ? value : value.id;
  }
}
