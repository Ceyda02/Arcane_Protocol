const TURKISH_GRIMOIRE = {
  'events-alerts-incidents': {
    title: 'Olaylar, Uyarılar ve Güvenlik Vakaları',
    category: 'Foundations',
    source: 'Sessiz Nöbetin Çanları',
    concept: 'Olay, uyarı, yanlış pozitif ve doğrulanmış güvenlik vakası.',
    plain: 'Olay, gerçekleşip kayda alınan bir şeydir. Uyarı, birinin daha yakından incelemesi gerektiğini belirten işarettir. Doğrulanmış güvenlik vakası ise araştırma sonucunda zararlı olduğu kanıtlanan bir uyarıdır.',
    technical: 'Güvenlik operasyonlarında olaylar, ortak biçime dönüştürülmüş log kayıtlarıdır. Tespit kuralları bunların bazılarını uyarıya dönüştürür. Ön incelemede uyarılar doğru pozitif (gerçek bir sorun) veya yanlış pozitif (zararsız etkinlik) olarak sınıflandırılır. Zararlı ya da yetkisiz etkinlik doğrulandığında güvenlik vakası ilan edilir.',
    example: {
      label: 'Kapı örneği',
      text: 'Olay: Kapı saat 21.02’de açıldı.\nUyarı: Kapı 60 saniyede 3 kez açıldı.\nYanlış pozitif: Kandilci yağ taşıyordu.\nGüvenlik vakası: Sahte bir geçiş belgesi kullanıldı.',
    },
    mistake: 'Her uyarıyı saldırı kanıtı saymak ya da bütün uyarıları gürültü diye görmezden gelmek.',
    takeaway: 'Uyarı, araştırılması gereken bir işarettir. Sonuca varmadan önce doğrula.',
  },
  'reading-the-ledger': {
    title: 'Log Tablosunu Okuma',
    category: 'Logs & Investigation',
    source: 'Sessiz Nöbetin Çanları',
    concept: 'Kimlik doğrulama ve etkinlik loglarını okumak.',
    plain: 'Her log satırı bir şeyin ne zaman olduğunu, nereden geldiğini, kimin adına gerçekleştiğini, ne yapıldığını ve nasıl sonuçlandığını söyler. Anlam, satırların birbiriyle nasıl bağlantı kurduğunda ortaya çıkar.',
    technical: 'İncelemede hesap, kaynak IP adresi, kullanıcı aracısı, konumun olağan davranışla karşılaştırılması, günün saati ve başarılı bir oturum açma sonrasında yapılan işlemler arasında geçiş yapılır.',
    example: {
      label: 'Şüpheli örüntü (sentetik)',
      text: '22:01:45  203.0.113.77  guard_bram  oturum açma  reddedildi\n22:01:49  203.0.113.77  guard_bram  oturum açma  reddedildi\n22:02:10  203.0.113.77  guard_bram  oturum açma  başarılı\n22:04:30  203.0.113.77  guard_bram  kayıt_dışa_aktarımı  başarılı',
    },
    mistake: 'Süresi dolmuş tek bir geçiş belgesini işaretlemek ya da sessiz bir dışa aktarımı gözden kaçırmak gibi, bir satırı tek başına değerlendirmek.',
    takeaway: 'Satırları birlikte oku ve o hesap için olağan davranışla karşılaştır.',
  },
  'timelines-and-time-zones': {
    title: 'Zaman Çizelgeleri ve Saat Dilimleri',
    category: 'Forensics',
    source: 'Sessiz Nöbetin Çanları',
    concept: 'Olay zaman çizelgesi oluşturmak ve saat dilimlerini eşitlemek.',
    plain: 'Neden-sonuç ilişkisini görmek için olayları zamana göre sırala. Önce tüm kayıtların aynı saati kullandığından emin ol.',
    technical: 'Olayları sıralamadan önce UTC’ye dönüştür. Pozitif saat farkı, yerel saatin UTC’den ileride olduğu anlamına gelir; bu nedenle farkı çıkar. Dönüştürme sırasında tarih bir önceki güne kayabilir.',
    example: {
      label: 'UTC’ye dönüştürme',
      text: '23:03:30 +01:00  ->  22:03:30 UTC\n17:04:10 -05:00  ->  22:04:10 UTC\n00:06:00 +02:00 (ertesi gün)  ->  22:06:00 UTC',
    },
    mistake: 'Farklı sistemlerin ham yerel saatlerini doğrudan sıralamak.',
    takeaway: 'Önce saatleri UTC’ye göre eşitle; özgün zaman damgalarını da başvuru için sakla.',
  },
  'context-and-correlation': {
    title: 'Bağlam, Olay İlişkilendirme ve Yanlış Pozitifler',
    category: 'Logs & Investigation',
    source: 'Sessiz Nöbetin Çanları',
    concept: 'Başarısız oturum açma sayısının neden tek başına saldırıyı kanıtlamadığı.',
    plain: 'Birkaç başarısız deneme yazım hatası olabilir; sessiz bir saldırgan ise her hesapta yalnızca bir kez deneyebilir. Denemelerin çevresinde başka neler olduğuna bak.',
    technical: 'Etkili tespitler birden çok işareti birleştirir: yeni bir kaynak adresi, tek adresten birçok hesaba erişim denemesi, başarısız denemelerin ardından gelen başarılı giriş, değişen kimlik doğrulama yöntemi ve hassas bir işlem. Yanlış pozitifleri azaltmak için kuralları olağan davranış kalıplarına göre ayarla.',
    example: {
      label: 'Birleşen zayıf işaretler (sentetik)',
      text: 'tek adres, dört hesap, ardından başarılı giriş\noturum açma yöntemi değişti\narşiv dışa aktarıldı',
    },
    mistake: 'Tek bir eşiğe güvenmek ya da başarısız denemeleri bütünüyle önemsiz saymak.',
    takeaway: 'Neyi bildiğini, nelerin belirsiz kaldığını ve hangi kanıtın sonucu doğrulayacağını açıkça belirt.',
  },
};

export function localizeGrimoirePage(page, language) {
  if (language !== 'tr') return page;
  const translation = TURKISH_GRIMOIRE[page.id];
  return translation ? { ...page, ...translation } : page;
}
