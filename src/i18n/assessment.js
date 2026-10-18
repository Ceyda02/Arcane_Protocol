const TURKISH_QUESTIONS = {
  'net-dns': {
    prompt: 'Tarayıcınıza bir web sitesi adı yazdığınızda DNS ne yapar?',
    options: {
      a: 'Site adını, bilgisayarınızın bağlanabileceği bir IP adresine dönüştürür',
      b: 'Gönderdiğiniz her şeyi şifreler',
      c: 'Zararlı web sitelerini engeller',
    },
  },
  'net-port': {
    prompt: 'Bir web sunucusu 443 numaralı bağlantı noktasını dinliyor. Bu port normalde ne için kullanılır?',
    options: {
      a: 'HTTPS: şifrelemeyle korunan web trafiği',
      b: 'Şifrelenmemiş, düz web trafiği',
      c: 'E-posta göndermek',
    },
  },
  'web-authn': {
    prompt: 'Kimlik doğrulama ile yetkilendirme arasındaki fark nedir?',
    options: {
      a: 'Kimlik doğrulama kim olduğunuzu kanıtlar; yetkilendirme neler yapabileceğinizi belirler',
      b: 'Aynı şeyin iki farklı adıdır',
      c: 'Yetkilendirme kim olduğunuzu kanıtlar; kimlik doğrulama neler yapabileceğinizi belirler',
    },
  },
  'web-input': {
    prompt: 'Bir site, ziyaretçilerin arama kutusuna yazdığı metni doğrudan bir veritabanı sorgusuna ekliyor. Temel risk nedir?',
    options: {
      a: 'Birisi, veritabanı sorgusunun işleyişini değiştiren özel olarak hazırlanmış bir metin girebilir',
      b: 'Sayfa yavaş yüklenebilir',
      c: 'Tarayıcı yanlış yazı tipini gösterebilir',
    },
  },
  'log-pattern': {
    prompt: 'Bu kısa logu inceleyin. Hangi ayrıntı daha yakından araştırılmalı?\n\n09:02:11 giriş başarılı kullanıcı=mira kaynak=198.51.100.7\n09:03:02 giriş başarısız kullanıcı=tomas kaynak=203.0.113.50\n09:03:04 giriş başarısız kullanıcı=tomas kaynak=203.0.113.50\n09:03:06 giriş başarısız kullanıcı=tomas kaynak=203.0.113.50\n09:03:09 giriş başarılı kullanıcı=tomas kaynak=203.0.113.50',
    options: {
      a: 'Aynı hesap ve adresten art arda birkaç başarısız girişin ardından başarılı bir giriş olması',
      b: 'Mira’nın saat 09:02’de giriş yapmış olması',
      c: 'Logda iki farklı kişinin görünmesi',
    },
  },
  'log-fp': {
    prompt: 'Bir uyarıyı inceliyorsunuz ve bunun normal işini yapan zamanlanmış bir bakım betiğinden kaynaklandığını görüyorsunuz. Bu sonuca ne denir?',
    options: {
      a: 'Yanlış pozitif',
      b: 'Doğru pozitif',
      c: 'Doğrulanmış ihlal',
    },
  },
  'code-read': {
    prompt: 'Bu kod satırını inceleyin:\n\nquery = "SELECT * FROM users WHERE name = \'" + name + "\'"\n\nSorun nedir?',
    options: {
      a: 'Kullanıcının verdiği metin, güvenli bir parametre olarak aktarılmak yerine doğrudan sorguya ekleniyor',
      b: 'SELECT komutunu kullanması',
      c: 'Değişkenin adının name olması',
    },
  },
  'code-pass': {
    prompt: 'Bir uygulama kullanıcı parolalarını nasıl saklamalıdır?',
    options: {
      a: 'Yavaş çalışan bir parola özetleme işleviyle oluşturulmuş, salt eklenmiş özetler olarak',
      b: 'Şifrelenmiş olarak; şifreleme anahtarı veritabanının yanında saklanmalı',
      c: 'Destek ekibinin parolasını unutan kullanıcılara yardım edebilmesi için düz metin olarak',
    },
  },
  'vuln-idor': {
    prompt: 'Bir sayfa faturanız için /invoice?id=1042 adresini gösteriyor. Numarayı 1043 yaptığınızda başka bir müşterinin faturası açılıyor. Bu hangi zayıflıktır?',
    options: {
      a: 'Bozuk erişim denetimi: uygulama bu faturanın size ait olup olmadığını kontrol etmiyor',
      b: 'Zayıf parola',
      c: 'Sayfanın çok yavaş olması',
    },
  },
  'vuln-ethics': {
    prompt: 'Sahibi olmadığınız bir sistemde olası bir güvenlik açığı fark ettiniz. Sorumlu davranış nedir?',
    options: {
      a: 'Testi durdurun, daha fazla deneme yapmayın ve durumu sistem sahibine onaylı bildirim kanalıyla iletin',
      b: 'Emin olmak için gizlice test etmeye devam edin',
      c: 'Açığı hemen herkese açık biçimde paylaşın',
    },
  },
  'for-preserve': {
    prompt: 'Bir bilgisayarda olayla ilgili kanıt bulunabileceğinden şüpheleniyorsunuz. Önce ne yapmalısınız?',
    options: {
      a: 'Mevcut durumu koruyun (kopyasını veya imajını alın) ve yaptığınız işlemleri kaydedin',
      b: 'Önce kullanıcıya ne hatırladığını sorun, sonra karar verin',
      c: 'Şüpheli dosyaları silip sistemi normale dönmesi için yeniden başlatın',
    },
  },
  'for-time': {
    prompt: 'Bir logda 10:00 +00:00 (UTC), diğerinde 12:00 +02:00 yazıyor. Bunlar aynı anı mı gösteriyor?',
    options: {
      a: 'Evet, +02:00 dilimindeki 12:00, UTC’de 10:00’dur',
      b: 'Hayır, aralarında iki saat vardır',
      c: 'Bu saatleri karşılaştırmak mümkün değildir',
    },
  },
  'int-task': {
    prompt: 'Şu anda hangi görev size daha ilgi çekici geliyor?',
    options: {
      a: 'Bir gözetleme kulesindeki alarmları izleyip hangilerinin gerçek olduğuna karar vermek',
      b: 'İzinli bir çalışmada, kurgusal bir kasanın gizli kapısını bulmak',
      c: 'Güvenli ve kurgusal bir saldırganı savunma sistemlerinin fark edip etmediğini sınamak',
      d: 'Eski kayıtlardan geçmişte ne olduğunu bir araya getirmek',
    },
  },
  'int-trouble': {
    prompt: 'Bir sorun çıktığında, aşağıdakilerden hangisini yapmayı tercih edersiniz?',
    options: {
      a: 'Olay sürerken müdahale edip sistemlerin çalışmaya devam etmesini sağlamak',
      b: 'Sorunun tam olarak nasıl mümkün olduğunu anlamak',
      c: 'Savunmaları yeniden sınayarak iyileştirmek',
      d: 'Ne olduğunu sırasıyla ve ayrıntılı biçimde kaydetmek',
    },
  },
};

const TURKISH_UNSURE_OPTION = 'Henüz emin değilim';

export function localizeAssessmentQuestion(question, language) {
  if (language !== 'tr') return question;
  const translation = TURKISH_QUESTIONS[question.id];
  if (!translation) return question;
  return {
    ...question,
    prompt: translation.prompt,
    options: question.options.map((option) => ({
      ...option,
      text: translation.options[option.id] ?? option.text,
    })),
  };
}

export function localizeUnsureOption(option, language) {
  return language === 'tr' ? { ...option, text: TURKISH_UNSURE_OPTION } : option;
}
