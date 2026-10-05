const servicios = [
  {
    id: 1,
    nombre: 'Masaje Sueco Relajante',
    categoria: 'Masajes',
    descripcion: 'Masaje corporal completo enfocado en liberar tensión muscular y mejorar la circulación, con técnicas suaves y movimientos largos y fluidos.',
    duracionMinutos: 60,
    precio: 90000,
    estado: 'activo',
    proveedor: 'Lucía Pérez',
    zona: 'El Peñón',
    imagenPrincipal: 'https://via.placeholder.com/400x300?text=Masaje+Sueco',
    galeria: [
      'https://via.placeholder.com/400x300?text=Foto+1',
      'https://via.placeholder.com/400x300?text=Foto+2'
    ],
    insumos: ['Aceite esencial de lavanda', 'Camilla portátil', 'Toallas desechables']
  },
  {
    id: 2,
    nombre: 'Clases de Yoga Personalizadas',
    categoria: 'Bienestar físico',
    descripcion: 'Sesiones de yoga adaptadas a tu nivel y objetivos, ya sea relajación, flexibilidad o fuerza.',
    duracionMinutos: 50,
    precio: 70000,
    estado: 'activo',
    proveedor: 'Yoga Vital',
    zona: 'El Peñón',
    imagenPrincipal: 'https://via.placeholder.com/400x300?text=Yoga',
    galeria: [
      'https://via.placeholder.com/400x300?text=Foto+1'
    ],
    insumos: ['Mat de yoga', 'Bloques de yoga']
  },
  {
    id: 3,
    nombre: 'Fisioterapia y Bienestar Muscular',
    categoria: 'Salud',
    descripcion: 'Tratamiento fisioterapéutico para recuperación muscular, dolores articulares y rehabilitación general.',
    duracionMinutos: 45,
    precio: 110000,
    estado: 'activo',
    proveedor: 'Andrés Silva',
    zona: 'El Peñón',
    imagenPrincipal: 'https://via.placeholder.com/400x300?text=Fisioterapia',
    galeria: [],
    insumos: ['Equipo de electroestimulación', 'Camilla de tratamiento']
  }
];

export default servicios;