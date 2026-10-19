// Regenerates src/data/pets.json, fetching a new Dog CEO image per profile (matching the breed in the bio).
// Usage: npm run generate:pets [-- <output-path>]
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const profiles = [
  ['Luna', 'mix', [
    'Soy una mestiza de 2 años, cariñosa y muy juguetona.',
    'Me llevo bien con niños y otros perros, y ya sé pasear con correa.',
    'Estoy vacunada y esterilizada, lista para llegar a mi hogar para siempre.',
  ]],
  ['Max', 'labrador', [
    'Soy un labrador de 4 años, tranquilo y muy leal.',
    'Busco una familia con patio que disfrute las caminatas largas.',
    'Llevo meses esperando en el refugio; ¿serás tú quien me lleve a casa?',
  ]],
  ['Canela', 'mix', [
    'Soy una cachorra de 6 meses, curiosa y llena de energía.',
    'Necesito una familia paciente que me enseñe y juegue conmigo cada día.',
    'Tengo mis primeras vacunas y muchas ganas de aprender.',
  ]],
  ['Rocky', 'pitbull', [
    'Soy un pitbull de 3 años: mi apariencia es fuerte, pero soy un gran apapachador.',
    'Prefiero ser el único perro de la casa y adoro dormir junto a mis humanos.',
    'Estoy esterilizado, sano y listo para demostrar lo noble que soy.',
  ]],
  ['Nala', 'retriever/golden', [
    'Soy una golden retriever de 7 años, dulce y muy tranquila.',
    'Sería ideal para personas mayores o un hogar sin mucho ajetreo.',
    'Los perros adultos también tenemos mucho amor que dar; adóptame.',
  ]],
  ['Toby', 'beagle', [
    'Soy un beagle de 5 años con un olfato increíble y un corazón enorme.',
    'Me encanta explorar, así que necesito un hogar con paseos diarios.',
    'Estoy vacunado, desparasitado y esperando mi segunda oportunidad.',
  ]],
  ['Mía', 'chihuahua', [
    'Soy una chihuahua de 3 años, pequeña pero muy valiente.',
    'Soy perfecta para departamento y me encanta estar en tus piernas.',
    'Me rescataron de la calle y hoy sueño con una familia que me cuide.',
  ]],
  ['Bruno', 'german/shepherd', [
    'Soy un pastor alemán de 2 años, inteligente y protector.',
    'Busco a alguien activo que quiera entrenar y hacer deporte conmigo.',
    'Estoy esterilizado y con todas mis vacunas al día.',
  ]],
  ['Frida', 'mix', [
    'Soy una mestiza de 1 año con orejas enormes y mucha personalidad.',
    'Soy sociable con gatos, así que me adapto a hogares con otras mascotas.',
    'Estoy vacunada y esterilizada, y solo me falta tu hogar.',
  ]],
  ['Coco', 'poodle/toy', [
    'Soy un poodle de 9 años, tierno, tranquilo y muy educado.',
    'Mi familia anterior ya no pudo cuidarme y extraño tener un sofá propio.',
    'Adoptar a un perro senior cambia dos vidas: la mía y la tuya.',
  ]],
  ['Simba', 'husky', [
    'Soy un husky de 3 años, aventurero y muy conversador.',
    'Necesito un hogar activo, con clima fresco y paseos largos todos los días.',
    'Estoy esterilizado y vacunado, listo para correr a tu lado.',
  ]],
  ['Kira', 'collie/border', [
    'Soy una border collie de 2 años, rapidísima y muy obediente.',
    'Me encantan los retos: juegos de pelota, trucos y entrenamiento diario.',
    'Busco una familia que quiera compartir su energía conmigo.',
  ]],
  ['Thor', 'rottweiler', [
    'Soy un rottweiler de 5 años, protector, tranquilo y muy noble.',
    'Me va mejor con adultos con experiencia en perros grandes.',
    'Estoy sano y esterilizado; solo necesito a alguien que confíe en mí.',
  ]],
  ['Lola', 'dachshund', [
    'Soy una salchicha de 4 años, simpática y algo testaruda.',
    'Me adapto bien a un departamento, pero necesito evitar las escaleras.',
    'Estoy vacunada y desparasitada; prometo llenar tu casa de alegría.',
  ]],
  ['Zeus', 'dane/great', [
    'Soy un gran danés de 3 años: enorme por fuera, muy gentil por dentro.',
    'Necesito un hogar con espacio y una familia que no le tema a mi tamaño.',
    'Estoy esterilizado y listo para ser tu gigante consentido.',
  ]],
  ['Maya', 'mix', [
    'Soy una mestiza de 5 años, tranquila y muy agradecida.',
    'Me encanta acompañar a mis humanos mientras trabajan desde casa.',
    'Llevo un año en el refugio esperando que alguien me elija.',
  ]],
  ['Rufo', 'bulldog/english', [
    'Soy un bulldog inglés de 6 años, dormilón y muy cariñoso.',
    'Prefiero los paseos cortos y un hogar fresco, sin mucho calor.',
    'Estoy esterilizado y con mis chequeos al día; adóptame y roncaremos juntos.',
  ]],
  ['Bella', 'spaniel/cocker', [
    'Soy una cocker spaniel de 4 años, dulce y muy sociable.',
    'Me llevo de maravilla con niños, gatos y otros perros.',
    'Estoy vacunada y esterilizada, lista para mi nueva familia.',
  ]],
  ['Oso', 'stbernard', [
    'Soy un san bernardo de 2 años, bonachón y muy paciente.',
    'Sería feliz en una casa con jardín y una familia con niños.',
    'Estoy vacunado y listo para dar los abrazos más grandes.',
  ]],
  ['Pelusa', 'maltese', [
    'Soy una maltés de 8 años, delicada, tranquila y muy mimosa.',
    'Busco un hogar sereno, ideal para una persona mayor o una pareja.',
    'Mi dueña falleció y hoy necesito un nuevo regazo donde descansar.',
  ]],
  ['Duke', 'boxer', [
    'Soy un boxer de 3 años, payaso, alegre y muy leal.',
    'Me encanta jugar con niños, aunque a veces olvido mi tamaño.',
    'Estoy esterilizado y vacunado, listo para unirme a tu familia.',
  ]],
  ['Sasha', 'samoyed', [
    'Soy una samoyedo de 2 años y siempre estoy sonriendo.',
    'Necesito cepillado frecuente y un hogar donde no me dejen sola.',
    'Estoy esterilizada y vacunada; solo me falta tu cariño.',
  ]],
  ['Chispa', 'terrier/russell', [
    'Soy una jack russell de 1 año, inquieta y muy divertida.',
    'Busco una familia activa con tiempo para jugar y paseos diarios.',
    'Estoy vacunada y aprendiendo a convivir; ¿me ayudas a crecer?',
  ]],
  ['Tango', 'dalmatian', [
    'Soy un dálmata de 4 años, elegante y lleno de energía.',
    'Me encanta correr, así que soy ideal para alguien deportista.',
    'Estoy esterilizado y sano, esperando mi segunda oportunidad.',
  ]],
  ['Princesa', 'shihtzu', [
    'Soy una shih tzu de 6 años, coqueta y muy tranquila.',
    'Soy perfecta para departamento y para familias con poco tiempo libre.',
    'Estoy vacunada, esterilizada y lista para que me consientas.',
  ]],
  ['Bobby', 'schnauzer/miniature', [
    'Soy un schnauzer miniatura de 7 años, alerta y muy cariñoso.',
    'Soy un buen guardián de casa y me encanta acompañar en el sofá.',
    'Estoy sano y esterilizado; los perros maduros somos compañeros fieles.',
  ]],
  ['Kiara', 'mix', [
    'Soy una mestiza de 3 años, tímida al principio y muy amorosa después.',
    'Necesito una familia paciente que me dé tiempo para confiar.',
    'Me rescataron de la calle y estoy vacunada y esterilizada.',
  ]],
  ['Lucas', 'pug', [
    'Soy un pug de 5 años, glotón, gracioso y muy apegado.',
    'Me adapto a cualquier hogar, siempre que pueda dormir contigo.',
    'Estoy esterilizado y con mis vacunas al día.',
  ]],
  ['Nieve', 'pyrenees', [
    'Soy una pastora de los Pirineos de 3 años, serena y protectora.',
    'Necesito espacio y una familia que entienda mi carácter independiente.',
    'Estoy esterilizada y lista para cuidar de tu hogar.',
  ]],
  ['Ramón', 'hound/basset', [
    'Soy un basset hound de 8 años, calmado y con orejas larguísimas.',
    'Sigo una dieta especial para cuidar mi peso y mi espalda.',
    'Busco un hogar tranquilo donde pasar mis mejores años.',
  ]],
  ['Greta', 'doberman', [
    'Soy una doberman de 4 años, inteligente, sensible y muy leal.',
    'Me pongo nerviosa con los ruidos fuertes y necesito un hogar tranquilo.',
    'Estoy esterilizada; con paciencia, seré tu mejor compañera.',
  ]],
  ['Pancho', 'mix', [
    'Soy un mestizo de 10 años, sabio, tranquilo y muy cariñoso.',
    'Ya no necesito correr; me basta con un rincón cálido y tu compañía.',
    'Adoptar a un senior es regalarle un final feliz.',
  ]],
  ['Chloe', 'pomeranian', [
    'Soy una pomerania de 2 años, pequeña, esponjosa y muy vivaz.',
    'Soy ideal para departamento y me encanta que me lleven a todos lados.',
    'Estoy vacunada y esterilizada, lista para mi nuevo hogar.',
  ]],
  ['Bongo', 'greyhound', [
    'Soy un galgo de 6 años, rescatado y algo tímido con extraños.',
    'Corro rápido, pero en casa soy el perro más tranquilo del mundo.',
    'Busco una familia que me enseñe que ya estoy a salvo.',
  ]],
  ['Lupe', 'pembroke', [
    'Soy una corgi de 3 años, alegre, curiosa y muy comunicativa.',
    'Me llevo bien con niños y me encanta pasear por el parque.',
    'Estoy esterilizada y vacunada, lista para mover la colita en tu casa.',
  ]],
  ['Rex', 'malinois', [
    'Soy un pastor belga malinois de 2 años, enérgico y muy inteligente.',
    'Necesito un tutor con experiencia y mucho tiempo para entrenar.',
    'Estoy sano y esterilizado; con la guía correcta, seré increíble.',
  ]],
  ['Lila', 'whippet', [
    'Soy una whippet de 5 años, delicada, veloz y muy dulce.',
    'Me encantan las mantas, el sofá y una buena carrera en el parque.',
    'Estoy esterilizada y lista para ser tu sombra.',
  ]],
  ['Tomás', 'akita', [
    'Soy un akita de 6 años, digno, leal y algo reservado.',
    'Prefiero ser el único perro de la casa y un hogar con adultos.',
    'Estoy esterilizado; cuando confío en alguien, es para siempre.',
  ]],
  ['Pepa', 'bulldog/french', [
    'Soy una bulldog francés de 3 años, divertida y muy apapachadora.',
    'Me adapto bien a departamento y no necesito paseos largos.',
    'Estoy vacunada y esterilizada; adóptame y no te arrepentirás.',
  ]],
  ['Hachi', 'shiba', [
    'Soy un shiba inu de 4 años, limpio, independiente y muy expresivo.',
    'Busco una familia con experiencia que respete mi espacio.',
    'Estoy esterilizado y listo para enseñarte lo que es la lealtad.',
  ]],
  ['Dulce', 'cavapoo', [
    'Soy una cavapoo de 1 año, alegre, cariñosa y casi no suelto pelo.',
    'Me encantan los niños y aprendo trucos muy rápido.',
    'Estoy vacunada y lista para convertirme en tu mejor amiga.',
  ]],
  ['Bolt', 'weimaraner', [
    'Soy un weimaraner de 2 años, atlético y muy apegado a mi gente.',
    'Necesito ejercicio diario y no me gusta pasar mucho tiempo solo.',
    'Estoy esterilizado y vacunado, listo para salir a correr contigo.',
  ]],
  ['Manchas', 'mix', [
    'Soy un mestizo de 4 años con manchas únicas y un gran corazón.',
    'Me llevo bien con todos: niños, perros y hasta gatos.',
    'Estoy vacunado y esterilizado; solo espero que me elijas.',
  ]],
  ['Abril', 'mountain/bernese', [
    'Soy una boyero de Berna de 3 años, tranquila y muy afectuosa.',
    'Me encantan los niños y los climas frescos.',
    'Estoy esterilizada y vacunada, lista para formar parte de tu familia.',
  ]],
  ['Chester', 'terrier/yorkshire', [
    'Soy un yorkshire de 9 años, pequeño, valiente y muy mimoso.',
    'Ya perdí algunos dientes, pero no las ganas de recibir cariño.',
    'Busco un hogar tranquilo para disfrutar mi vida senior.',
  ]],
  ['Kaiser', 'chow', [
    'Soy un chow chow de 5 años, independiente y muy tranquilo.',
    'Prefiero un hogar con adultos y paseos sin prisas.',
    'Estoy esterilizado y con mis vacunas al día.',
  ]],
  ['Nina', 'vizsla', [
    'Soy una vizsla de 2 años, cariñosa, activa y muy pegada a mis humanos.',
    'Sería feliz con una familia deportista que me lleve de excursión.',
    'Estoy esterilizada y lista para seguirte a todas partes.',
  ]],
  ['Pirata', 'mix', [
    'Soy un mestizo de 6 años y perdí un ojo, pero no la alegría.',
    'Me adapto perfecto a mi condición y no necesito cuidados especiales.',
    'Estoy vacunado y esterilizado; mírame con el corazón y adóptame.',
  ]],
  ['Olivia', 'labradoodle', [
    'Soy una labradoodle de 2 años, juguetona y muy sociable.',
    'Suelto poco pelo, así que soy buena opción para personas con alergias.',
    'Estoy vacunada y esterilizada, esperando a mi familia ideal.',
  ]],
  ['Sultán', 'mastiff/english', [
    'Soy un mastín de 7 años, imponente pero muy tranquilo y gentil.',
    'Necesito un hogar con espacio y una familia que me dé muchos mimos.',
    'Estoy esterilizado; los perros grandes también merecemos una casa.',
  ]],
]

const outputPath = process.argv[2] ?? fileURLToPath(new URL('../src/data/pets.json', import.meta.url))

const usedImages = new Set()

async function fetchUniqueImage(breed) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`)
    const { status, message } = await res.json()
    if (status !== 'success') throw new Error(`Dog CEO error for ${breed}: ${message}`)
    if (!usedImages.has(message)) {
      usedImages.add(message)
      return message
    }
  }
  throw new Error(`Could not get a unique image for ${breed}`)
}

const pets = []
for (const [index, [name, breed, bio]] of profiles.entries()) {
  pets.push({ id: index + 1, name, bio, image: await fetchUniqueImage(breed) })
}

writeFileSync(outputPath, JSON.stringify(pets, null, 2) + '\n')
console.log(`Wrote ${pets.length} profiles to ${outputPath}`)
