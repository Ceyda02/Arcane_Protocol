const MALWARE_TRANSLATIONS = {
  worm: {
    name: 'Solucan',
    title: 'Yayılan Çürüme',
    malwareType: 'Solucan',
    tease: 'Kalenin birbirine bağlı koridorları arasında bir şey sürünüyor. Ona hiçbir kapı açılmadı.',
  },
  virus: {
    name: 'Virüs',
    title: 'Rün Vebası',
    malwareType: 'Dosya bulaştıran virüs',
    tease: 'Güvenilir kitapların kenarlarında bir kuzgun yuva yapmış. Kitaplar hâlâ kitap gibi görünüyor.',
  },
  trojan: {
    name: 'Truva Atı',
    title: 'Sahte Müttefik',
    malwareType: 'Truva atı',
    tease: 'Bir şövalyenin miğferinde güzel bir maske gülümsüyor. Zırhın altındaki şey gülümsemiyor.',
  },
  ransomware: {
    name: 'Fidye Yazılımı',
    title: 'Demir Gaspçı',
    malwareType: 'Fidye yazılımı',
    tease: 'Zincirlenmiş kitaplar ve mühürlü sandıklar. Kilitlerden bir tahta oturan bir zorba.',
  },
  spyware: {
    name: 'Casus Yazılım',
    title: 'Sessiz Dinleyici',
    malwareType: 'Casus yazılım',
    tease: 'Ayna gibi parlayan gözler, havada süzülen mercekler. Boş odalarda bile izlendiğini hissediyorsun.',
  },
  keylogger: {
    name: 'Tuş Kaydedici',
    title: 'Fısıldayan Kâtip',
    malwareType: 'Tuş kaydı yapan zararlı yazılım',
    tease: 'Havada süzülen bir tüy, henüz sesli söylemediğin şeyleri yazıyor.',
  },
  rootkit: {
    name: 'Rootkit',
    title: 'İçi Boş Kral',
    malwareType: 'Rootkit',
    tease: 'Kralın zırhı kale duvarıyla bütünleşiyor. Fenerin, durduğu yeri aydınlatmıyor.',
  },
  botnet: {
    name: 'Botnet',
    title: 'Bin Maskeli Sürü',
    malwareType: 'Botnet',
    tease: 'Uzaktan parlayan iplerle çekilen küçük maskelerden oluşan bir kovan.',
  },
  'logic-bomb': {
    name: 'Mantık Bombası',
    title: 'Uyuyan Lanet',
    malwareType: 'Mantık bombası',
    tease: 'Güzel bir kurmalı çiçek kapalı duruyor ve uğulduyor. Kalbindeki kırmızı rün atıp tutuyor.',
  },
  wiper: {
    name: 'Veri Silici',
    title: 'Kül Yiyici',
    malwareType: 'Veri silici',
    tease: 'Boş parşömenler ve kırık taşlar, uzun bir şeyin geçtiği yeri gösteriyor.',
  },
  dropper: {
    name: 'Yükleyici / İndirici',
    title: 'Kutsanmamış Ulak',
    malwareType: 'Yükleyici / indirici',
    tease: 'Pelerinli bir ulak, mühürlü siyah yumurtalar taşıyor. Her biri sıcak.',
  },
  adware: {
    name: 'Reklam Yazılımı',
    title: 'Altın Ayartıcı',
    malwareType: 'Reklam yazılımı / istenmeyebilecek uygulama',
    tease: 'Parıltılı tekliflerin içinde boğulan bir soytarı. Her düğmenin iki anlamı var.',
  },
};

const REALM_TRANSLATIONS = {
  shapeshifter: {
    name: 'Şekil Değiştiren',
    tease: 'Yüzü, yakınındaki kişiye göre değişen bir figür.',
    lore: 'Güvendiğin kişilerin yüzlerini takar. İzlemen gereken yüz değil, o yüzün yaptıklarıdır.',
    metaphor: 'Güvenilir kimliklerin güvenilmez biçimde davranmasını ve iddia ettiği şey olmayan girdileri anlatan bir öykü mecazı.',
    concepts: ['Bağlam', 'İlişkilendirme', 'Normal davranış kalıpları'],
    clue: 'Eylemleri, o kimlik için normal olan davranışlarla karşılaştır.',
    lesson: '1. bölümde karşılaşıldı. Sonraki bölümlerde Şekil Değiştiren, girdi doğrulama ve enjeksiyon konularını öğretir.',
  },
  wraith: {
    name: 'Fısıldayan Hortlak',
    tease: 'Sıradan ayak seslerinin arasında gizlenen solgun bir fısıltı.',
    lore: 'Kalabalıktan daha yüksek ses çıkarmadan gürültünün içinde saklanır.',
    metaphor: 'Sıradan olayların arasına gizlenmiş şüpheli etkinlik.',
    concepts: ['Log analizi', 'Olay ilişkilendirme', 'Tespit mühendisliği'],
    clue: 'En gürültülü olana değil, tekrar edene bak.',
    lesson: 'İlerideki Gece Nöbeti bölümünde planlanıyor.',
  },
  werewolf: {
    name: 'Kapıdaki Kurt Adam',
    tease: 'Bu gece kendisi gibi davranmayan tanıdık bir köylü.',
    lore: 'Gündüz aynı yüz. Gece başka bir yaratık.',
    metaphor: 'Alışılmış davranışlarından farklı hareket eden, ele geçirilmiş bir hesap.',
    concepts: ['Davranış göstergeleri', 'Uyarı önceliklendirme', 'Olay incelemesi'],
    clue: 'Bu gece olanları olağan davranışla karşılaştır.',
    lesson: 'İlerideki Gece Nöbeti bölümünde planlanıyor.',
  },
  vampire: {
    name: 'Ödünç İsimlerin Vampiri',
    tease: 'Başkasının adıyla davet edilmiş nazik bir konuk.',
    lore: 'Davet edilmeden giremediği için başkasının davetini ödünç alır.',
    metaphor: 'Çalınan kimlik bilgilerini anlatan bir mecazdır. Teknik terimler kimlik bilgisi hırsızlığı, hesap ele geçirme ve oturum ele geçirmedir.',
    concepts: ['Kimlik bilgisi güvenliği', 'Çok faktörlü kimlik doğrulama', 'Oturum yönetimi'],
    clue: 'Onu kim, nereden davet etti?',
    lesson: 'Parçalanmış Ağ bölümü için planlanıyor.',
  },
  mimic: {
    name: 'Taklitçi',
    tease: 'Tam olarak sandığa benzeyen bir sandık.',
    lore: 'Güvenilir görünür. Bütün yeteneği bundan ibarettir.',
    metaphor: 'Güvenilir görünen yanıltıcı girdi.',
    concepts: ['Veri doğrulama', 'Güvenli ayrıştırma', 'Varsayımları doğrulama'],
    clue: 'Varsayma; doğrula.',
    lesson: 'Parçalanmış Ağ bölümü için planlanıyor.',
  },
  'memory-eater': {
    name: 'Anı Yiyen',
    tease: 'Onun geçtiği yerde sayfalar sessizleşiyor.',
    lore: 'Nesneyi değil, kanıtı yer.',
    metaphor: 'Kanıtın kaybolması, değiştirilmesi veya yok edilmesi.',
    concepts: ['Kanıtı koruma', 'Log bütünlüğü', 'Adli bilişim muhakemesi'],
    clue: 'Burada olması gerekirken olmayan ne?',
    lesson: 'Anı Mahzeni bölümü için planlanıyor.',
  },
};

export function localizeBestiaryCreature(creature, language) {
  if (language !== 'tr') return creature;
  const translation = creature.grimoire !== undefined
    ? REALM_TRANSLATIONS[creature.id]
    : MALWARE_TRANSLATIONS[creature.id];
  return translation ? { ...creature, ...translation } : creature;
}
