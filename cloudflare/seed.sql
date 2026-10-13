DELETE FROM "Appointment";
DELETE FROM "ContactMessage";
DELETE FROM "TeamMember";
DELETE FROM "Post";
DELETE FROM "Service";
DELETE FROM "User";
INSERT INTO "User" ("id","email","passwordHash","name","role","createdAt") VALUES ('c3e1c8d4-07fc-43d3-a57e-31e0dcfb17ef','admin@prokosovasolutions.com','pbkdf2$100000$oUy468jRc3yiCyesYpOH7A==$g5xWT9FKbzHgfxtr73cUO4Ip/podq0hANdpfRYhk2og=','Site Yöneticisi','ADMIN',1791931177878);
INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES ('9f8e7166-d849-4b19-85c2-8b5478fba62b','sirket-kurulusu','Kosova''da Şirket Kuruluşu','Yabancı girişimciler için Kosova''da hızlı, eksiksiz ve uçtan uca şirket kuruluşu.','Kosova, düşük vergi oranları ve hızlı kuruluş süreçleriyle yabancı girişimciler için Avrupa''nın en cazip merkezlerinden biri. Şirketinizi birkaç gün içinde, tüm resmi adımları sizin adınıza yöneterek kuruyoruz.

## Nasıl çalışıyoruz?

İş modelinize en uygun şirket türünü (LLC/SH.P.K. vb.) belirliyor; isim tespiti, ARBK tescili, fiskal numara ve gerekli tüm kayıtları eksiksiz tamamlıyoruz. Siz Kosova''da olmasanız bile süreci vekaletle yürütebiliriz.

## Kuruluştan sonra da yanınızdayız

- Banka hesabı açılışında rehberlik

- Muhasebe ve vergi kaydının devreye alınması

- Çalışan ve oturum süreçleriyle entegrasyon

600''den fazla şirketi başarıyla kurduğumuz tecrübeyle, sürecin her adımında tek muhatabınız biziz.','Building2','Şirket türü ve isim tespiti
ARBK (ticaret sicili) tescili
Fiskal numara ve KDV kaydı
Banka hesabı açılışı desteği
Resmi adres ve sözleşmeler',1,1,1791931177878,1791931177878);
INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES ('841c3170-daf2-46f6-a5ce-f2b78dc4a902','oturum-calisma-izni','Oturum & Çalışma İzni','Kosova''da oturum ve çalışma izni başvurularında eksiksiz dosya ve uçtan uca takip.','Kosova''da yaşamak ve çalışmak için gereken oturum/çalışma izni süreçlerini sizin için baştan sona yönetiyoruz. Eksik belge veya yanlış başvuru kaynaklı gecikmelerin önüne geçiyoruz.

## Kapsam

İster şirket ortağı, ister çalışan, ister aile birleşimi yoluyla; durumunuza en uygun oturum türünü belirliyor, dosyanızı eksiksiz hazırlıyor ve sonuçlanana kadar takip ediyoruz.

## Neden biz?

- 820''den fazla başarılı oturum başvurusu tecrübesi

- Güncel mevzuat ve kurum süreçlerine hâkimiyet

- Belge, tercüme ve noter işlemlerinde tam destek

Randevularınızı planlıyor, kurumlarla iletişimi sizin adınıza yürütüyoruz.','Plane','Oturum izni başvurusu ve yenileme
Çalışma izni süreçleri
Aile birleşimi
Belge hazırlama ve tercüme/noter
Başvuru takibi ve randevu yönetimi',2,1,1791931177878,1791931177878);
INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES ('37da0237-34e0-4ff9-ac96-7680df9c0212','muhasebe-vergi','Muhasebe & Vergi','Kosova''da aylık muhasebe, beyannameler ve vergi danışmanlığında mevzuata tam uyum.','Şirketinizin Kosova''daki tüm muhasebe ve vergi yükümlülüklerini üstleniyoruz. Böylece siz işinize odaklanırken, bildirimlerinizin zamanında ve doğru yapıldığından emin olursunuz.

## Hizmet kapsamı

Aylık muhasebe kayıtlarından KDV ve vergi beyannamelerine, bordro ve çalışan bildirimlerinden finansal raporlamaya kadar tüm süreçleri yönetiyoruz.

## Avantajınız

- Kosova''nın düşük vergi oranlarından yasal yollarla en iyi şekilde yararlanma

- Zamanında bildirim, ceza riskinin önlenmesi

- Yöneticiye özel, anlaşılır finansal raporlar

Düzenli bilgilendirme ve şeffaf çalışma biçimiyle sürprizlerle karşılaşmazsınız.','Calculator','Aylık muhasebe ve defter tutma
KDV ve vergi beyannameleri
Bordro ve çalışan bildirimleri
Finansal raporlama
Vergi planlaması',3,1,1791931177878,1791931177878);
INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES ('c744e677-48c6-415a-b301-30088d18aefb','yatirim-is-danismanligi','Yatırım & İş Danışmanlığı','Kosova pazarına giriş, yatırım ve büyüme stratejilerinde yerel uzmanlık.','Kosova''da yatırım yapmayı veya işinizi büyütmeyi mi planlıyorsunuz? Yerel pazara dair saha tecrübemizle, doğru kararları doğru zamanda almanıza yardımcı oluyoruz.

## Neler sunuyoruz?

Pazar ve sektör analizinden fizibiliteye, yatırım teşviklerinden yerel ortaklık ve tedarikçi bağlantılarına kadar; Kosova''da iş yapmanın tüm pratik boyutlarında yanınızdayız.

## Kimler için?

- Kosova pazarına açılmak isteyen yabancı şirketler

- Yeni bir yatırım fırsatını değerlendiren girişimciler

- Mevcut işini büyütmek isteyen yerel şirketler

İlk görüşmede hedeflerinizi dinliyor, size özel bir yol haritası çıkarıyoruz.','TrendingUp','Pazara giriş stratejisi
Sektör ve fizibilite analizi
Yatırım teşvikleri ve fırsatlar
Ortaklık ve yerel bağlantılar
Büyüme ve operasyon danışmanlığı',4,1,1791931177878,1791931177878);
INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES ('f365097f-6b33-48ab-bcbf-a0816a468d4c','kosovada-sirket-nasil-kurulur','Kosova''da Şirket Nasıl Kurulur? Adım Adım Rehber','Yabancı girişimciler için Kosova''da şirket kuruluşunun adımları, gereken belgeler ve süreler.','Kosova, hızlı kuruluş süreçleri ve düşük vergi oranlarıyla yabancı girişimciler için cazip bir merkez. Peki süreç nasıl işliyor?

## 1. Şirket türünü ve ismi belirleyin

En yaygın tür, limited şirkete (SH.P.K. / LLC) karşılık gelen yapıdır. İş modelinize uygun türü seçip isim tespitini yapıyoruz.

## 2. ARBK tescili

Ticaret sicili (ARBK) nezdinde tescil ile şirketiniz tüzel kişilik kazanır ve fiskal numarasını alır.

## 3. Vergi ve KDV kaydı

Faaliyetinize göre KDV mükellefiyeti ve gerekli vergi kayıtları tamamlanır.

## 4. Banka hesabı ve muhasebe

- Kurumsal banka hesabının açılması

- Aylık muhasebe ve beyan süreçlerinin devreye alınması

Tüm bu adımları, Kosova''da bulunmanıza gerek kalmadan vekaletle sizin adınıza yürütebiliriz. Detaylı bilgi için bizimle görüşün.','ProKosova Solutions','Şirket Kuruluşu',1,1791931177878,1791931177878,1791931177878);
INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES ('9f5b8731-856c-4baa-80b4-80b43cf8e76d','kosovada-oturum-izni-sartlar-surec','Kosova''da Oturum İzni: Şartlar ve Süreç','Kosova''da oturum izni türleri, başvuru şartları ve sürecin doğru yönetimi.','Kosova''da yaşamak isteyen yabancılar için oturum izni, sürecin doğru yönetildiğinde oldukça akıcı ilerleyen bir aşamadır.

## Oturum türleri

Şirket ortaklığı, çalışma, aile birleşimi veya diğer gerekçelerle farklı oturum türleri mevcuttur. Durumunuza en uygun olanı birlikte belirleriz.

## Başvuru için genel adımlar

- Gerekli belgelerin hazırlanması ve tercüme/noter işlemleri

- Başvurunun yapılması ve randevu yönetimi

- Sonuçlanana kadar takip ve kurum iletişimi

## Sık yapılan hatalar

Eksik belge ve geç yapılan yenilemeler en sık karşılaşılan gecikme sebepleridir. 820''den fazla başarılı başvuru tecrübemizle bu riskleri ortadan kaldırıyoruz.

Oturum süreciniz için ücretsiz ön görüşme talep edebilirsiniz.','ProKosova Solutions','Oturum',1,1791931177878,1791931177878,1791931177878);
INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES ('19ad6a64-faaa-47ba-845d-e2f29d54c18f','kosovada-vergi-sistemi-avantajlari','Kosova''da Vergi Sistemi ve Avantajları','Kosova''nın rekabetçi vergi oranları ve işletmelere sunduğu avantajlara genel bir bakış.','Kosova, bölgedeki en rekabetçi vergi sistemlerinden birine sahip. Bu da onu yabancı yatırımcılar için cazip kılan en önemli etkenlerden biri.

## Öne çıkan başlıklar

Kurumlar vergisi, gelir vergisi ve KDV oranları birçok Avrupa ülkesine kıyasla düşüktür. Ancak her işletmenin durumu farklı olduğundan, avantajlardan tam yararlanmak için doğru planlama şarttır.

## Nelere dikkat etmeli?

- Doğru vergi mükellefiyeti ve KDV kaydı

- Zamanında beyan ve ödeme

- Giderlerin doğru belgelenmesi

Muhasebe ekibimiz, işletmenize özel vergi planlamasını hazırlayarak yükümlülüklerinizi yasal sınırlar içinde optimize eder.','ProKosova Solutions','Vergi',1,1791931177878,1791931177878,1791931177878);
INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES ('64e04cb9-a51f-4c9b-9b6e-e137be0ddefd','neden-kosovada-yatirim','Neden Kosova''da Yatırım? Yabancı Girişimciler İçin Fırsatlar','Genç nüfus, düşük maliyetler ve stratejik konum: Kosova''yı yatırım için cazip kılan nedenler.','Kosova, son yıllarda yabancı girişimcilerin radarına giren, potansiyeli yüksek bir pazar. Peki bu ilgiyi haklı çıkaran nedenler neler?

## Genç ve dinamik nüfus

Avrupa''nın en genç nüfuslarından birine sahip olan Kosova, nitelikli ve uygun maliyetli iş gücü sunar.

## Düşük maliyetler ve rekabetçi vergiler

İşletme maliyetleri ve vergi oranları, birçok Avrupa ülkesine göre belirgin biçimde düşüktür.

## Stratejik konum

- Balkanlar''ın merkezinde, Avrupa pazarlarına yakın

- Büyüyen hizmet ve teknoloji sektörleri

Doğru rehberlikle Kosova''da yatırım, hızlı ve güvenli biçimde hayata geçirilebilir. Fırsatları değerlendirmek için bizimle görüşün.','ProKosova Solutions','Yatırım',1,1791931177878,1791931177878,1791931177878);
INSERT INTO "TeamMember" ("id","name","title","bio","order","email","createdAt") VALUES ('85fe75ea-8c71-47d7-9e81-f70c9d39dd0f','Bülent BOZKURT','Kurucu & Baş Danışman','6 yılı aşkın süredir Kosova''da yabancı girişimci ve yatırımcılara danışmanlık veriyor; 600+ şirket kuruluşu ve 820+ oturum başvurusuna liderlik etti.',1,'bulent@prokosovasolutions.com',1791931177878);
