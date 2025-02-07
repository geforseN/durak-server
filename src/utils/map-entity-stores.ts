import type { Entity, EntityStore } from "@/types/entity-store.js";

type ConstructableEntity = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to use any, unknown[] will not work
  new (...args: any[]): Entity;
};

export class MapEntityStores<C extends ConstructableEntity> {
  #map: Map<C, EntityStore<InstanceType<C>>>;

  constructor(map: Map<C, EntityStore<InstanceType<C>>>) {
    this.#map = map;
  }

  static create<CA extends ConstructableEntity[]>(values: {
    [K in keyof CA]: { For: CA[K]; store: EntityStore<InstanceType<CA[K]>> };
  }) {
    return new MapEntityStores<CA[number]>(
      // @ts-expect-error Type 'Entity' is not assignable to type 'InstanceType<CA[number]>'
      new Map(values.map((value) => [value.For, value.store])),
    );
  }

  get(id: InstanceType<C>["id"]) {
    for (const store of this.#map.values()) {
      const value = store.get(id);
      if (value) {
        return value;
      }
    }
  }

  require(id: InstanceType<C>["id"]) {
    const entity = this.get(id);
    if (!entity) {
      throw new Error(`Unknown entity with id = ${id}`);
    }
    return entity;
  }

  set(entity: InstanceType<C>) {
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

  delete(value: InstanceType<C> | InstanceType<C>["id"]) {
    const store = this.#map.values().find((store) => store.has(value));
    if (!store) {
      throw new Error("Unknown entity value");
    }
    store.delete(value);
  }

  has(value: InstanceType<C> | InstanceType<C>["id"]): boolean {
    return this.#map.values().some((store) => store.has(value));
  }
}
