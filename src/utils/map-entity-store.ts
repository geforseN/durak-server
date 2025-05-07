import type { EntityStore } from "@/types/entity-store.js";

type EntityId = string;

interface Entity {
  id: string;
}


export default class MapEntityStore<E extends Entity>
  implements EntityStore<Entity>
{
  #map: Map<EntityId, E>;
  #entityName: string;

  constructor(entityName: string, map = new Map()) {
    this.#entityName = entityName;
    this.#map = map;
  }

  get(id: EntityId) {
    return this.#map.get(id);
  }

  require(id: EntityId) {
    const entity = this.get(id);
    if (!entity) {
      throw new Error(`Unknown ${this.#entityName} with id = ${id}`);
    }
    return entity;
  }

  set(entity: E) {
    this.#map.set(entity.id, entity);
  }

  delete(value: EntityId | E) {
    return this.#map.delete(this.#getEntityId(value));
  }

  has(value: EntityId | E) {
    return this.#map.has(this.#getEntityId(value));
  }

  #getEntityId(value: EntityId | E) {
    return typeof value === "string" ? value : value.id;
  }
}
