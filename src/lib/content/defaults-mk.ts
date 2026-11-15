import type { ContactContent, HomeContent, PagesContent, StoryContent } from "./schema";

/**
 * Macedonian (mk) default translations. Merged over the English content —
 * anything missing here falls back to English. Shared fields (phone, map,
 * photos…) always come from English.
 */

type Translatable = {
  home: HomeContent;
  pages: PagesContent;
  story: Omit<StoryContent, "images">;
  contact: Pick<ContactContent, "businessName" | "tagline" | "address" | "hours" | "hoursNote" | "footerText" | "footerNote">;
};

export const DEFAULT_CONTENT_MK: Translatable = {
  home: {
    hero: {
      eyebrow: "Кафуле во соседството",
      heading: "Забавете.\nУживајте во нешто добро.",
      description: "Свежо пржено кафе, свилено млеко и топли пецива — послужени со грижа во агол создаден за уживање.",
      primaryCtaLabel: "Погледнете го менито",
      secondaryCtaLabel: "Посетете не",
      badges: ["Свежо пржено", "Печено секој ден", "Овесно и бадемово млеко"],
    },
    ticker: ["Еспресо", "Флет вајт", "Колд брју", "Матча", "Пур овер", "Кроасани", "Кортадо", "Чај"],
    brewing: {
      eyebrow: "Од зрно до шолја",
      heading: "Како настанува вашата шолја",
      steps: [
        { title: "Зрната", description: "Рачно избрани, свежо пржени зрна со ноти на какао и карамела." },
        { title: "Свежо мелено", description: "Мелено непосредно пред подготовка за да се зачува секоја арома." },
        { title: "Во апаратот", description: "Дозирано, израмнето и набиено во портафилтерот." },
        { title: "Топла вода", description: "Вода со совршена температура тече низ мелената кафе." },
        { title: "Точење", description: "Богато еспресо ја полни шолјата, надополнето со кадифено млеко." },
        { title: "Малку пареа", description: "Топло, мирисливо и подготвено во мигот кога ќе стигне до вас." },
        { title: "Вашата шолја", description: "Подготвено полека. Послужено со топлина." },
      ],
      finalHeading: "Вашата шолја е подготвена.",
      finalMessage: "Седнете — ви чуваме место до прозорецот.",
    },
    featured: {
      eyebrow: "Менито",
      heading: "Нешто за секое расположение",
      description: "Класично еспресо, бавно сварено кафе, матча и пецива печени секое утро.",
      ctaLabel: "Целото мени",
    },
    bestsellers: {
      eyebrow: "Омилени на гостите",
      heading: "Наши најпродавани",
      description: "Шолјите поради кои нашите редовни гости секогаш се враќаат.",
    },
    team: {
      eyebrow: "Луѓето",
      heading: "Запознајте го тимот зад шанкот",
      description: "Насмеани лица, сигурни раце и многу знаење за кафе.",
    },
    visit: {
      eyebrow: "Дојдете на кафе",
      heading: "Посетете го Mellow Mug",
      description: "Седнете до прозорецот, донесете книга или земете го омиленото кафе за понесување.",
    },
  },

  pages: {
    menu: {
      eyebrow: "Менито",
      heading: "Полека подготвено,\nтопло послужено.",
      description: "Класики на еспресо, свилени лате, колд брју, матча и пецива печени секое утро.",
    },
    about: {
      eyebrow: "За нас",
      heading: "Нашата приказна\nи луѓето зад неа.",
      description: "Мало кафуле во соседството, изградено на добри зрна, топла светлина и пријателски лица.",
    },
    visit: {
      eyebrow: "Посетете не",
      heading: "Влезете,\nостанете малку.",
      description: "Најдете не, проверете го денешното работно време или јавете ни се — ќе ни биде мило да ве видиме.",
    },
  },

  story: {
    eyebrow: "Нашата приказна",
    heading: "Мало кафуле со голема љубов кон доброто кафе.",
    intro: "Mellow Mug започна со едноставна идеја: топло место каде кафето е искрено и никој не ве брза.",
    body:
      "Соработуваме со мали пржионици, го загреваме млекото по нарачка и секое утро печеме свежи пецива. Без разлика дали ќе останете еден час или ќе земете кафе на пат кон работа, сакаме секоја посета да ви изгледа како враќање во омилениот агол од соседството.",
    quote: "Доброто кафе е мал секојдневен ритуал — ние само се трудиме да го направиме малку подобар.",
    quoteAuthor: "Тимот на Mellow Mug",
    values: [
      { title: "Свежо пржени зрна", description: "Пржени во мали серии за свежина и полн вкус." },
      { title: "Подготвено по нарачка", description: "Секој пијалак е свеж, токму како што го сакате." },
      { title: "Печено секое утро", description: "Пецива од рерната, не од кутија." },
    ],
  },

  contact: {
    businessName: "Mellow Mug",
    tagline: "Кафе од соседството, послужено со грижа.",
    address: "Скопје, Северна Македонија",
    hours: [
      { days: "Понеделник – Петок", time: "07:00 – 19:00" },
      { days: "Сабота", time: "08:00 – 20:00" },
      { days: "Недела", time: "08:00 – 17:00" },
    ],
    hoursNote: "Кујната се затвора 30 минути пред затворање.",
    footerText: "Свежо пржено кафе, свежи пецива и место кое секогаш е топло.",
    footerNote: "Направено со љубов и многу еспресо.",
  },
};

/** Macedonian names for the seeded collections, matched by English name. */
export const SEED_CATEGORIES_MK: Record<string, { name: string; description: string }> = {
  "Espresso Bar": { name: "Еспресо бар", description: "Класични еспресо пијалаци" },
  "Lattes & Milk": { name: "Лате и млечни", description: "Свилени, топли и мазни" },
  "Cold Coffee": { name: "Ладно кафе", description: "Со мраз и бавно натопено" },
  "Matcha & Tea": { name: "Матча и чај", description: "Земјено, свежо и смирувачко" },
  Bakery: { name: "Пекара", description: "Печено свежо секое утро" },
};

export const SEED_ITEMS_MK: Record<string, { name: string; description: string; tags?: string[] }> = {
  Espresso: { name: "Еспресо", description: "Силно, густо двојно еспресо со ноти на темна чоколада." },
  Cappuccino: { name: "Капучино", description: "Еднакви делови еспресо, загреано млеко и воздушна пена." },
  "Pour Over": { name: "Пур овер", description: "Кафе од едно потекло, рачно и полека подготвено.", tags: ["Едно потекло"] },
  "Flat White": { name: "Флет вајт", description: "Кадифена микропена врз богато ристрето." },
  "Caramel Latte": { name: "Карамел лате", description: "Домашна карамела, еспресо и загреано млеко.", tags: ["Слатко"] },
  "Honey Latte": { name: "Лате со мед", description: "Мед од ливадски цвеќиња и малку цимет." },
  "Iced Latte": { name: "Ладно лате", description: "Еспресо со мраз и млеко по ваш избор." },
  "Cold Brew": { name: "Колд брју", description: "Натопено 18 часа. Мазно, со ниска киселост.", tags: ["18 часа натопено"] },
  "Matcha Latte": { name: "Матча лате", description: "Церемонијална матча изматена со загреано млеко." },
  "Iced Matcha": { name: "Ладна матча", description: "Свежа, кремаста и освежителна." },
  "Butter Croissant": { name: "Кроасан со путер", description: "Ронлив, златен и печен секое утро." },
  "Pain au Chocolat": { name: "Чоколаден кроасан", description: "Путерести слоеви со темна чоколада." },
};

export const SEED_TEAM_MK: Record<string, { role: string; bio: string }> = {
  Maya: { role: "Главна бариста", bio: "Перфекционистка во лате-арт и голем љубител на пур овер." },
  Leo: { role: "Пржач на кафе", bio: "Ги наоѓа најдобрите зрна и го прилагодува секое пржење." },
  Sara: { role: "Слаткарка", bio: "Станува пред изгрејсонце за кроасаните да бидат топли кога ќе дојдете." },
  Omar: { role: "Менаџер на кафулето", bio: "Се грижи музиката да е вистинската, а редот да се движи брзо." },
};
