import type { Shelter } from '../types/shelter'

// Fictional demo data. Phone numbers use the unassigned +502 0 prefix and emails use the
// reserved .example domain, so no real shelter or person can be contacted by mistake.
export const shelters: Shelter[] = [
  {
    id: 'patitas-felices',
    name: 'Refugio Patitas Felices',
    address: '12 Calle 5-40, Zona 10',
    city: 'Ciudad de Guatemala',
    phone: '+502 0000 0101',
    email: 'adopciones@patitasfelices.example',
    visitingHours: [
      { label: 'Lunes a viernes', days: [1, 2, 3, 4, 5], opens: '09:00', closes: '17:00' },
      { label: 'Sábado', days: [6], opens: '09:00', closes: '13:00' },
    ],
  },
  {
    id: 'casa-canina-antigua',
    name: 'Casa Canina Antigua',
    address: '3a Avenida Norte #18',
    city: 'Antigua Guatemala',
    phone: '+502 0000 0202',
    email: 'hola@casacanina.example',
    visitingHours: [
      { label: 'Martes a domingo', days: [0, 2, 3, 4, 5, 6], opens: '10:00', closes: '16:00' },
    ],
  },
  {
    id: 'huellitas-xela',
    name: 'Huellitas de Xela',
    address: '14 Avenida 8-25, Zona 1',
    city: 'Quetzaltenango',
    phone: '+502 0000 0303',
    email: 'visitas@huellitasxela.example',
    visitingHours: [
      { label: 'Lunes a sábado', days: [1, 2, 3, 4, 5, 6], opens: '08:00', closes: '14:00' },
    ],
  },
  {
    id: 'hogar-peludo-mixco',
    name: 'Hogar Peludo Mixco',
    address: 'Calzada San Juan 15-60, Zona 4',
    city: 'Mixco',
    phone: '+502 0000 0404',
    email: 'adopta@hogarpeludo.example',
    visitingHours: [
      { label: 'Miércoles a viernes', days: [3, 4, 5], opens: '13:00', closes: '18:00' },
      { label: 'Sábado y domingo', days: [0, 6], opens: '09:00', closes: '15:00' },
    ],
  },
]
