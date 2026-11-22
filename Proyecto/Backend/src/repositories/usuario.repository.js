import Usuario from "../models/Usuario.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * usuario.repository.js
 * Única responsabilidad: guardar/leer Usuarios (credenciales y rol) de un
 * array en memoria. El email se compara sin distinguir mayúsculas.
 */
const usuarios = [];
const nextId = createIdGenerator(1);

const normalizarEmail = (email) => String(email).trim().toLowerCase();

export const UsuarioRepository = {
  findById(id) {
    return usuarios.find((u) => u.id === id) ?? null;
  },

  findByEmail(email, excludeId) {
    const buscado = normalizarEmail(email);
    return usuarios.find((u) => u.id !== excludeId && u.email === buscado) ?? null;
  },

  findByClienteId(clienteId) {
    return usuarios.find((u) => u.clienteId === clienteId) ?? null;
  },

  create(data) {
    const usuario = new Usuario({ id: nextId(), ...data, email: normalizarEmail(data.email) });
    usuarios.push(usuario);
    return usuario;
  },

  update(id, changes) {
    const index = usuarios.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const actualizado = { ...usuarios[index], ...changes };
    usuarios[index] = new Usuario({ ...actualizado, email: normalizarEmail(actualizado.email) });
    return usuarios[index];
  },

  deleteByClienteId(clienteId) {
    const index = usuarios.findIndex((u) => u.clienteId === clienteId);
    if (index === -1) return false;
    usuarios.splice(index, 1);
    return true;
  },
};

export default UsuarioRepository;
