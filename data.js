// Lukas Habla word set. Every board is a fixed 6 x 3 grid (18 slots).
// Positions never move: hiding a word leaves its slot empty so Lukas's
// muscle memory stays the same. `null` = empty slot.
//
// Item fields:
//   id      unique key (photos and edits are saved under it)
//   es, en  labels on the button
//   sayEs, sayEn  what the voice says (defaults to the label)
//   icon    emoji, or "svg:<part>" for the body pictures
//   kind    colour group: urgent, people, verb, noun, social, feel, place
//   link    board id to open after speaking (makes it a folder)
//   urgent  plays an attention chime before speaking

window.LH_DATA = {
  // Always on screen, on every board.
  urgentBar: [
    { id: "ayuda", es: "Ayuda", en: "Help", sayEs: "¡Ayúdame!", sayEn: "Help me!", icon: "🙋", kind: "urgent", urgent: true },
    { id: "duele", es: "Me duele", en: "It hurts", icon: "🤕", kind: "urgent", urgent: true, link: "duele" },
    { id: "bano", es: "Baño", en: "Bathroom", sayEs: "Quiero ir al baño", sayEn: "I need the bathroom", icon: "🚽", kind: "urgent" },
    { id: "alto", es: "Alto", en: "Stop", sayEs: "¡Alto!", sayEn: "Stop!", icon: "🛑", kind: "urgent" },
    { id: "si", es: "Sí", en: "Yes", icon: "👍", kind: "social" },
    { id: "no", es: "No", en: "No", icon: "🙅‍♂️", kind: "social" },
  ],

  boards: {
    home: {
      es: "Inicio", en: "Home",
      items: [
        { id: "quiero", es: "Quiero", en: "I want", icon: "🤲", kind: "verb" },
        { id: "mas", es: "Más", en: "More", icon: "➕", kind: "verb" },
        { id: "termine", es: "Ya terminé", en: "All done", icon: "✅", kind: "verb" },
        { id: "comer", es: "Comer", en: "Eat", icon: "🍽️", kind: "verb", link: "comer" },
        { id: "tomar", es: "Tomar", en: "Drink", icon: "🥤", kind: "verb", link: "tomar" },
        { id: "dormir", es: "Dormir", en: "Sleep", sayEs: "Quiero dormir", sayEn: "I want to sleep", icon: "😴", kind: "verb" },

        { id: "mama", es: "Mamá", en: "Mom", icon: "👩", kind: "people" },
        { id: "papa", es: "Papá", en: "Dad", icon: "👨", kind: "people" },
        { id: "max", es: "Max", en: "Max", icon: "🧔", kind: "people" },
        { id: "yo", es: "Yo", en: "Me", icon: "🧒", kind: "people" },
        { id: "abrazo", es: "Abrazo", en: "Hug", icon: "🤗", kind: "social" },
        { id: "familia", es: "Familia", en: "Family", icon: "👨‍👩‍👦", kind: "people", link: "familia" },

        { id: "sentimientos", es: "Me siento", en: "I feel", icon: "😊", kind: "feel", link: "sentimientos" },
        { id: "jugar", es: "Jugar", en: "Play", icon: "🧸", kind: "verb", link: "jugar" },
        { id: "lugares", es: "Ir", en: "Go", sayEs: "Quiero ir", sayEn: "I want to go", icon: "🚗", kind: "place", link: "lugares" },
        { id: "ipad", es: "iPad", en: "iPad", icon: "📱", kind: "noun" },
        { id: "youtube", es: "YouTube", en: "YouTube", icon: "▶️", kind: "noun" },
        { id: "musica", es: "Música", en: "Music", icon: "🎵", kind: "noun" },
      ],
    },

    duele: {
      es: "Me duele", en: "It hurts",
      items: [
        { id: "d_cabeza", es: "Cabeza", en: "Head", sayEs: "Me duele la cabeza", sayEn: "My head hurts", icon: "svg:head", kind: "urgent" },
        { id: "d_ojos", es: "Ojos", en: "Eyes", sayEs: "Me duelen los ojos", sayEn: "My eyes hurt", icon: "👀", kind: "urgent" },
        { id: "d_oido", es: "Oído", en: "Ear", sayEs: "Me duele el oído", sayEn: "My ear hurts", icon: "👂", kind: "urgent" },
        { id: "d_boca", es: "Boca", en: "Mouth", sayEs: "Me duele la boca", sayEn: "My mouth hurts", icon: "👄", kind: "urgent" },
        { id: "d_dientes", es: "Dientes", en: "Teeth", sayEs: "Me duelen los dientes", sayEn: "My teeth hurt", icon: "🦷", kind: "urgent" },
        { id: "d_garganta", es: "Garganta", en: "Throat", sayEs: "Me duele la garganta", sayEn: "My throat hurts", icon: "svg:neck", kind: "urgent" },

        { id: "d_panza", es: "Panza", en: "Tummy", sayEs: "Me duele la panza", sayEn: "My tummy hurts", icon: "svg:tummy", kind: "urgent" },
        { id: "d_espalda", es: "Espalda", en: "Back", sayEs: "Me duele la espalda", sayEn: "My back hurts", icon: "svg:back", kind: "urgent" },
        { id: "d_brazo", es: "Brazo", en: "Arm", sayEs: "Me duele el brazo", sayEn: "My arm hurts", icon: "svg:arms", kind: "urgent" },
        { id: "d_mano", es: "Mano", en: "Hand", sayEs: "Me duele la mano", sayEn: "My hand hurts", icon: "svg:hands", kind: "urgent" },
        { id: "d_pierna", es: "Pierna", en: "Leg", sayEs: "Me duele la pierna", sayEn: "My leg hurts", icon: "svg:legs", kind: "urgent" },
        { id: "d_pie", es: "Pie", en: "Foot", sayEs: "Me duele el pie", sayEn: "My foot hurts", icon: "svg:feet", kind: "urgent" },

        { id: "d_poquito", es: "Poquito", en: "A little", icon: "🤏", kind: "feel" },
        { id: "d_mucho", es: "Mucho", en: "A lot", sayEs: "¡Mucho!", sayEn: "A lot!", icon: "😭", kind: "feel" },
        { id: "d_caí", es: "Me caí", en: "I fell", icon: "🤕", kind: "verb" },
        { id: "d_enfermo", es: "Enfermo", en: "Sick", sayEs: "Estoy enfermo", sayEn: "I feel sick", icon: "🤒", kind: "feel" },
        { id: "d_vomitar", es: "Vomitar", en: "Throw up", sayEs: "Voy a vomitar", sayEn: "I'm going to throw up", icon: "🤮", kind: "urgent", urgent: true },
        { id: "d_curita", es: "Curita", en: "Band-aid", sayEs: "Quiero una curita", sayEn: "I want a band-aid", icon: "🩹", kind: "noun" },
      ],
    },

    sentimientos: {
      es: "Me siento", en: "I feel",
      items: [
        { id: "f_feliz", es: "Feliz", en: "Happy", sayEs: "Estoy feliz", sayEn: "I'm happy", icon: "😊", kind: "feel" },
        { id: "f_triste", es: "Triste", en: "Sad", sayEs: "Estoy triste", sayEn: "I'm sad", icon: "😢", kind: "feel" },
        { id: "f_enojado", es: "Enojado", en: "Mad", sayEs: "Estoy enojado", sayEn: "I'm mad", icon: "😠", kind: "feel" },
        { id: "f_miedo", es: "Miedo", en: "Scared", sayEs: "Tengo miedo", sayEn: "I'm scared", icon: "😨", kind: "feel" },
        { id: "f_cansado", es: "Cansado", en: "Tired", sayEs: "Estoy cansado", sayEn: "I'm tired", icon: "🥱", kind: "feel" },
        { id: "f_enfermo", es: "Enfermo", en: "Sick", sayEs: "Estoy enfermo", sayEn: "I feel sick", icon: "🤒", kind: "feel" },

        { id: "f_hambre", es: "Hambre", en: "Hungry", sayEs: "Tengo hambre", sayEn: "I'm hungry", icon: "😋", kind: "feel" },
        { id: "f_sed", es: "Sed", en: "Thirsty", sayEs: "Tengo sed", sayEn: "I'm thirsty", icon: "💧", kind: "feel" },
        { id: "f_calor", es: "Calor", en: "Hot", sayEs: "Tengo calor", sayEn: "I'm hot", icon: "🥵", kind: "feel" },
        { id: "f_frio", es: "Frío", en: "Cold", sayEs: "Tengo frío", sayEn: "I'm cold", icon: "🥶", kind: "feel" },
        { id: "f_ruido", es: "Mucho ruido", en: "Too loud", icon: "🙉", kind: "urgent", urgent: true },
        { id: "f_descanso", es: "Descanso", en: "Break", sayEs: "Necesito un descanso", sayEn: "I need a break", icon: "🛋️", kind: "urgent", urgent: true },

        { id: "f_espacio", es: "Espacio", en: "Space", sayEs: "Necesito espacio", sayEn: "I need space", icon: "🚪", kind: "feel" },
        { id: "f_aburrido", es: "Aburrido", en: "Bored", sayEs: "Estoy aburrido", sayEn: "I'm bored", icon: "😐", kind: "feel" },
        { id: "f_nervioso", es: "Nervioso", en: "Worried", sayEs: "Estoy nervioso", sayEn: "I'm worried", icon: "😬", kind: "feel" },
        { id: "f_emocionado", es: "Emocionado", en: "Excited", sayEs: "¡Estoy emocionado!", sayEn: "I'm excited!", icon: "🤩", kind: "feel" },
        { id: "f_chistoso", es: "Chistoso", en: "Silly", icon: "🤪", kind: "feel" },
        { id: "f_tequiero", es: "Te quiero", en: "I love you", icon: "❤️", kind: "social" },
      ],
    },

    comer: {
      es: "Comer", en: "Eat",
      items: [
        { id: "c_tortilla", es: "Tortilla", en: "Tortilla", icon: "🫓", kind: "noun" },
        { id: "c_tacos", es: "Tacos", en: "Tacos", icon: "🌮", kind: "noun" },
        { id: "c_quesadilla", es: "Quesadilla", en: "Quesadilla", icon: "🧀", kind: "noun" },
        { id: "c_frijoles", es: "Frijoles", en: "Beans", icon: "🫘", kind: "noun" },
        { id: "c_arroz", es: "Arroz", en: "Rice", icon: "🍚", kind: "noun" },
        { id: "c_pollo", es: "Pollo", en: "Chicken", icon: "🍗", kind: "noun" },

        { id: "c_huevo", es: "Huevo", en: "Egg", icon: "🍳", kind: "noun" },
        { id: "c_pizza", es: "Pizza", en: "Pizza", icon: "🍕", kind: "noun" },
        { id: "c_papas", es: "Papas", en: "Fries", icon: "🍟", kind: "noun" },
        { id: "c_pan", es: "Pan", en: "Bread", icon: "🍞", kind: "noun" },
        { id: "c_cereal", es: "Cereal", en: "Cereal", icon: "🥣", kind: "noun" },
        { id: "c_galleta", es: "Galleta", en: "Cookie", icon: "🍪", kind: "noun" },

        { id: "c_manzana", es: "Manzana", en: "Apple", icon: "🍎", kind: "noun" },
        { id: "c_platano", es: "Plátano", en: "Banana", icon: "🍌", kind: "noun" },
        { id: "c_uvas", es: "Uvas", en: "Grapes", icon: "🍇", kind: "noun" },
        { id: "c_fresa", es: "Fresa", en: "Strawberry", icon: "🍓", kind: "noun" },
        { id: "c_helado", es: "Helado", en: "Ice cream", icon: "🍦", kind: "noun" },
        { id: "c_dulce", es: "Dulce", en: "Candy", icon: "🍬", kind: "noun" },
      ],
    },

    tomar: {
      es: "Tomar", en: "Drink",
      items: [
        { id: "t_agua", es: "Agua", en: "Water", icon: "💧", kind: "noun" },
        { id: "t_leche", es: "Leche", en: "Milk", icon: "🥛", kind: "noun" },
        { id: "t_jugo", es: "Jugo", en: "Juice", icon: "🧃", kind: "noun" },
        { id: "t_chocolate", es: "Chocolate", en: "Hot chocolate", icon: "☕", kind: "noun" },
        { id: "t_licuado", es: "Licuado", en: "Smoothie", icon: "🥤", kind: "noun" },
        { id: "t_aguafresca", es: "Agua fresca", en: "Agua fresca", icon: "🍹", kind: "noun" },

        { id: "t_vaso", es: "Mi vaso", en: "My cup", icon: "🥛", kind: "noun" },
        { id: "t_hielo", es: "Hielo", en: "Ice", icon: "🧊", kind: "noun" },
        null, null, null, null,
        null, null, null, null, null, null,
      ],
    },

    familia: {
      es: "Familia", en: "Family",
      items: [
        { id: "p_kayla", es: "Kayla", en: "Kayla", icon: "👧", kind: "people" },
        { id: "p_heidi", es: "Heidi", en: "Heidi", icon: "👩", kind: "people" },
        { id: "p_arlo", es: "Arlo", en: "Arlo", icon: "👶", kind: "people" },
        { id: "p_abuela", es: "Abuela", en: "Grandma", icon: "👵", kind: "people" },
        { id: "p_abuelo", es: "Abuelo", en: "Grandpa", icon: "👴", kind: "people" },
        { id: "p_tia", es: "Tía", en: "Aunt", icon: "👩‍🦱", kind: "people" },

        { id: "p_tio", es: "Tío", en: "Uncle", icon: "👨‍🦱", kind: "people" },
        { id: "p_primo", es: "Primo", en: "Cousin", icon: "🧒", kind: "people" },
        { id: "p_prima", es: "Prima", en: "Cousin", icon: "👧", kind: "people" },
        { id: "p_maestra", es: "Maestra", en: "Teacher", icon: "👩‍🏫", kind: "people" },
        { id: "p_doctor", es: "Doctor", en: "Doctor", icon: "🧑‍⚕️", kind: "people" },
        { id: "p_amigo", es: "Amigo", en: "Friend", icon: "🧑‍🤝‍🧑", kind: "people" },
        null, null, null, null, null, null,
      ],
    },

    jugar: {
      es: "Jugar", en: "Play",
      items: [
        { id: "j_ipad", es: "iPad", en: "iPad", icon: "📱", kind: "noun" },
        { id: "j_youtube", es: "YouTube", en: "YouTube", icon: "▶️", kind: "noun" },
        { id: "j_tele", es: "Tele", en: "TV", icon: "📺", kind: "noun" },
        { id: "j_musica", es: "Música", en: "Music", icon: "🎵", kind: "noun" },
        { id: "j_cantar", es: "Cantar", en: "Sing", icon: "🎤", kind: "verb" },
        { id: "j_bailar", es: "Bailar", en: "Dance", icon: "🕺", kind: "verb" },

        { id: "j_pelota", es: "Pelota", en: "Ball", icon: "⚽", kind: "noun" },
        { id: "j_carros", es: "Carros", en: "Cars", icon: "🚙", kind: "noun" },
        { id: "j_bloques", es: "Bloques", en: "Blocks", icon: "🧱", kind: "noun" },
        { id: "j_libro", es: "Libro", en: "Book", icon: "📖", kind: "noun" },
        { id: "j_colorear", es: "Colorear", en: "Color", icon: "🖍️", kind: "verb" },
        { id: "j_burbujas", es: "Burbujas", en: "Bubbles", icon: "🫧", kind: "noun" },

        { id: "j_resbaladilla", es: "Resbaladilla", en: "Slide", icon: "🛝", kind: "noun" },
        { id: "j_banarme", es: "Bañarme", en: "Bath", sayEs: "Quiero bañarme", sayEn: "I want a bath", icon: "🛁", kind: "verb" },
        { id: "j_cosquillas", es: "Cosquillas", en: "Tickles", icon: "🤭", kind: "social" },
        { id: "j_otravez", es: "Otra vez", en: "Again", sayEs: "¡Otra vez!", sayEn: "Again!", icon: "🔁", kind: "verb" },
        { id: "j_miturno", es: "Mi turno", en: "My turn", icon: "☝️", kind: "social" },
        { id: "j_ayudame", es: "Ayúdame", en: "Help me", icon: "🤝", kind: "verb" },
      ],
    },

    lugares: {
      es: "Ir", en: "Go",
      items: [
        { id: "l_casa", es: "Casa", en: "Home", icon: "🏠", kind: "place" },
        { id: "l_carro", es: "Carro", en: "Car", icon: "🚗", kind: "place" },
        { id: "l_afuera", es: "Afuera", en: "Outside", icon: "🌳", kind: "place" },
        { id: "l_parque", es: "Parque", en: "Park", icon: "🏞️", kind: "place" },
        { id: "l_escuela", es: "Escuela", en: "School", icon: "🏫", kind: "place" },
        { id: "l_tienda", es: "Tienda", en: "Store", icon: "🛒", kind: "place" },

        { id: "l_cama", es: "Cama", en: "Bed", icon: "🛏️", kind: "place" },
        { id: "l_cuarto", es: "Mi cuarto", en: "My room", icon: "🚪", kind: "place" },
        { id: "l_cocina", es: "Cocina", en: "Kitchen", icon: "🍳", kind: "place" },
        { id: "l_abuela", es: "Casa de abuela", en: "Grandma's house", icon: "🏡", kind: "place" },
        { id: "l_playa", es: "Playa", en: "Beach", icon: "🏖️", kind: "place" },
        { id: "l_alberca", es: "Alberca", en: "Pool", icon: "🏊", kind: "place" },

        { id: "l_doctor", es: "Doctor", en: "Doctor", icon: "🏥", kind: "place" },
        { id: "l_restaurante", es: "Restaurante", en: "Restaurant", icon: "🍔", kind: "place" },
        { id: "l_vamonos", es: "¡Vámonos!", en: "Let's go!", icon: "🚶‍♂️", kind: "verb" },
        { id: "l_quedarme", es: "Quedarme", en: "Stay", sayEs: "Me quiero quedar", sayEn: "I want to stay", icon: "🧍‍♂️", kind: "verb" },
        null, null,
      ],
    },
  },
};
