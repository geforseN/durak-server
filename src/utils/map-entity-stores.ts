import type { Entity, EntityStore } from "@/types/entity-store.js";

export class MapEntityStores<C extends { new (...args: any[]): Entity }> {
  #map;

  constructor(map: Map<C, EntityStore<Entity>>) {
    this.#map = map;
  }

  static create<CA extends { new (...args: any[]): Entity }[]>(values: {
    [K in keyof CA]: { For: CA[K]; store: EntityStore<InstanceType<CA[K]>> };
  }) {
    return new MapEntityStores<CA[number]>(
      new Map(values.map((value) => [value.For, value.store])),
    );
  }

  get(id: Entity["id"]) {
    for (const store of this.#map.values()) {
      const value = store.get(id);
      if (value) return value;
    }
  }

  require(id: Entity["id"]) {
    const entity = this.get(id);
    if (!entity) {
      throw new Error(`Unknown entity with id = ${id}`);
    }
    return entity;
  }

  set(entity: Entity) {
    const Class = this.#map.keys().find((Class) => entity instanceof Class);
    if (!Class) {
      throw new Error("Unknown entity");
    }
    const store = this.#map.get(Class);
    if (!store) {
      throw new Error("Impossible");
    }
    store.set(entity);
  }

  delete(value: Entity | Entity["id"]) {
    const store = this.#map.values().find((store) => store.has(value));
    if (!store) {
      throw new Error("Unknown entity value");
    }
    store.delete(value);
  }

  has(value: Entity | Entity["id"]): boolean {
    return this.#map.values().some((store) => store.has(value));
  }
}
