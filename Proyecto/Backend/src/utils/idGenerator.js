/**
 * idGenerator.js
 * Pequeña fábrica de generadores de ID autoincremental, usada por los
 * repositorios en memoria para simular una PK autonumérica.
 */
export function createIdGenerator(startAt = 1) {
  let currentId = startAt;
  return function nextId() {
    return currentId++;
  };
}

export default createIdGenerator;
