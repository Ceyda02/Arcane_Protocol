# The Arcane Protocol

> *Every mystery leaves a trace. Every secret has a weakness.*

## Türkçe

**The Arcane Protocol**, siber güvenlik kavramlarını öğreten piksel sanatlı bir fantastik RPG'dir. Uygulama tarayıcıda çalışır; hesap, arka uç sunucusu veya gerçek hedeflere ağ erişimi gerektirmez. Yeni oyunlarda Türkçe varsayılan dildir; dil tercihi ana menüden ve ayarlardan değiştirilebilir.

### Hızlı başlangıç

Node.js **22.22 veya üzerini** kurduktan sonra proje klasöründe:

```bash
npm install
npm run dev
```

Terminalde gösterilen yerel adresi tarayıcıda açın (varsayılan: `http://localhost:5173`). Testler için `npm test`, üretim derlemesi için `npm run build` komutlarını kullanın. İlerleme yalnızca aynı tarayıcının yerel depolamasına kaydedilir. Oyun HTTPS üzerinden yayımlandığında Edge veya Chrome'daki **Yükle / Install** düğmesiyle Windows'a uygulama gibi eklenebilir. İlk açılıştan sonra oyun dosyaları çevrimdışı kullanım için önbelleğe alınır; kayıtlar yine o tarayıcı profilinde kalır.

### GitHub Pages ile yayımlama

`main` dalına gönderilen her değişiklik test edilip otomatik yayımlanır. İlk yayımlamadan önce GitHub deposunda **Settings → Pages → Build and deployment → Source → GitHub Actions** seçilmelidir. Dağıtım tamamlandığında oyun `https://ceyda02.github.io/Arcane_Protocol/` adresinde açılır. Windows'ta bu adresi Edge/Chrome ile açın ve tarayıcı menüsündeki **Install this site as an app / Bu siteyi uygulama olarak yükle** seçeneğini kullanın.

### Steam sürümü

Bu depo henüz Steam'e yüklenmeye hazır bir Windows kurulum paketi üretmiyor. Steam sürümü için ayrıca masaüstü paketleme ve temiz bir Windows test turu, Steamworks partner hesabı ve Steam Direct başvurusu/ücreti gerekir. Mevcut oyun da tamamlanmış ticari sürüm değil, oynanabilir bir dikey dilimdir; kapsam tablosundaki gelecek içerik ve yerelleştirme işleri tamamlanmadan “tam oyun” olarak sunulmamalıdır.

### Mevcut Türkçe desteği ve kapsam

Türkçe dil seçimi; ana menü, gezinme çubuğu, ayarlar, dünya haritası ve Büyü Kitabı arayüzünün yanı sıra ilk bölümün diyaloglarını, derslerini ve sınamalarını kapsar. Yaratık Kitabı arayüzü, yaratık adları ve kilitli ipuçları ile Hexaria yaratıklarının açıklamaları da Türkçedir. Zararlı yazılım kayıtlarının teknik açıklamaları ve diğer oyun bölümlerinin anlatı içerikleri ise çoğunlukla İngilizcedir; çeviri çalışması tamamlanmamıştır. Haritada görünen yeni bölgeler gelecek içerik için işaretlenmiştir ve henüz oynanabilir görevleri yoktur.

Harita, proje için kullanıcı tarafından sağlanan `public/hexaria-world-map.png` görselini kullanır; görseldeki bölge adları İngilizcedir, bölge seçimi ve ilerleme işaretleri ise Türkçe arayüz katmanında çalışır. Haritanın dışındaki varlıkların lisans bilgileri ayrıca belgelenmelidir.

Yankıların Kroniği, geçerli bölüm için altı sekme sunar: görevler, ipuçları, çözülmemiş gizemler, öğrenilen dersler, karşılaşılan kişiler ve yolculuk. Görevler sınama ilerlemesini, bölgesini ve ödüllerini gösterir; okunma işaretleri ve sabitlenen hedef yerel kayıtta saklanır. Sabit hedef oyun ekranında gizlenebilir küçük bir takipçi olarak görünür. İpuçları ve kişiler yalnızca mevcut ilerlemenin ortaya çıkardığı bilgilere göre gösterilir; soruşturma sonucu saldırı kanıtı gibi sunulmaz. Nöbet Kulesi soruşturması, kanıtları ilgili/ilgisiz/çözümlenmemiş olarak sınıflandırmayı, seçilen kanıtları panoya eklemeyi, olayları klavyeyle sıralamayı ve kanıtların desteklediği ölçülü bir sonuç çıkarmayı içerir. Soruşturma taslağı bu cihazda kaydedilir; puan ve XP kanıt incelemesinin doğruluğuna göre verilir. Arcane Disciplines, değerlendirme sonucunu yalnızca başlangıç önerisi olarak sunan beş Türkçe/İngilizce dala ayrılır. Ustalık, kayıtlı sınama başarılarından türetilir; henüz sınaması olmayan konular açıkça gelecek içerik olarak belirtilir ve başka dallara geçmek mevcut ilerlemeyi kilitlemez.

### Güvenlik sınırları

Tüm senaryolar kurgusaldır. Oyuncu girdisi kod olarak çalıştırılmaz; gerçek sistem taraması, zararlı yazılım veya gerçek hedeflere bağlantı yoktur. Oyun puanları mesleki sertifika veya gerçek dünyadaki yetkinliğin garantisi değildir.

### Yol haritası

- Tüm oyun metinlerinin doğal Türkçe ve İngilizce çevirileri.
- Dünya bölgeleri için yeni oynanabilir bölümler.
- Diğer bölümlere ait oynanabilir dersler, gizemler, karakter kayıtları ve keşiflerle Chronicle of Echoes günlüğünün genişletilmesi.
- Arcane Disciplines içindeki henüz sınaması olmayan konulara oynanabilir dersler ve uygulamalar eklenmesi.
- Nöbet Kulesi vakasının ötesinde yeni soruşturma vakaları.
- Daha fazla erişilebilirlik ve mobil/tablet ekran testi.

---

A pixel-art medieval fantasy RPG that teaches real cybersecurity. You investigate a haunted border village, learn to read logs and timelines, and then face the **Malware Bestiary**: fantasy creatures that each stand for a real kind of malware, with accurate definitions, indicators, and defenses.

The game runs in the browser with no account, backend, analytics, or paid runtime service. After the first visit over HTTPS, its installable web-app build caches the game files for offline play. Saves stay in that browser profile on that device.

### Install on Windows

After GitHub Pages has been enabled and its first deployment succeeds, open `https://ceyda02.github.io/Arcane_Protocol/` in Microsoft Edge or Chrome. Choose **Install this site as an app** from the browser menu. The game can then be launched from the Windows Start menu and played offline after its first load. Do not clear the browser's site data if you want to keep that local save.

This repository does not yet produce a Windows `.exe` or Steam depot. A Steam release would need a tested desktop package, Steamworks onboarding and Steam Direct submission; the current project is still a vertical slice, not a complete commercial release.

![Title screen](docs/screenshots/01-title.png)

## Status: what is and is not built

This is a **vertical slice**, not the full game. Be sure of what you are getting.

| Area | Status |
|---|---|
| Title, new/continue game, character creation, settings | Complete |
| Trial of Three Runes (14 questions, deterministic scoring, retake, choose another path) | Complete |
| World map with data-driven unlocks (9 visible regions) | Existing regions plus two future-region markers. Only the **Crownlands** has playable content |
| Turkish / English selector | Turkish default for new saves; menu, navigation, settings, map-region labels/descriptions, Bestiary interface and Realm Beast entries, and Chapter 1 dialogue, lessons, and challenges translated. Malware technical descriptions and most other narrative content remain English |
| Field Journal | Tracks completed quests, passed-challenge findings, and the review queue |
| Investigator’s Table | Classify and pin case evidence, order a keyboard-accessible timeline, correlate records, and choose a cautious conclusion. Drafts save locally; deterministic scoring grants partial XP |
| Arcane Disciplines | Five selectable, localized branches show structured learning nodes and prerequisite states; mastery is derived from existing passed challenges. Some branches and later lessons still need playable challenges |
| Image-backed world map | Uses the supplied Hexaria map with interactive region selection and progress states |
| Chapter 1: *The Bells of the Silent Watch* (5 challenges, dialogue, lessons) | Complete and playable |
| Cyber Grimoire (search, filter, bookmarks, review later) | Complete |
| Bestiary: Realm Beasts | 1 of 6 unlockable (the Shapeshifter). The rest are visible but sealed until future chapters |
| **Malware Bestiary: 12 creatures with full structured entries** | Complete |
| Malware encounters: **Worm, Trojan, Ransomware** (beginner + intermediate + boss) | Complete and playable |
| Malware encounters: the other 9 creatures | **Field study only** (one beginner challenge each). Intermediate and boss are planned |
| Regions other than Crownlands, other orders' starter quests | Sealed. Not implemented |
| Ambient audio | Not built. Optional synthesized UI sounds only |

![World map](docs/screenshots/03-world-map.png)

The in-game map uses the supplied `public/hexaria-world-map.png` illustration with interactive region controls layered on top. Region labels baked into the illustration are English; the selected-region panel follows the chosen language. The Chronicle of Echoes records current-chapter quests, discovered clues, unresolved questions, lessons, known characters, and milestones. Its read state and pinned objective are saved locally; entries are derived from existing gameplay progress, not mock data. Future chapters still need their own quests, discoveries, and spoiler-gated journal content. The Investigator’s Table opens after its three chapter prerequisites and teaches evidence classification, timeline reconstruction, event correlation, careful attribution, and corroboration. Draft answers save locally and its score is validated deterministically. Arcane Disciplines now presents five selectable, Turkish/English learning branches; assessment results only suggest a starting branch, and skill states derive from saved challenge records rather than XP. Current playable evidence supports selected Watcher, Veilkeeper, and Memory Keeper nodes. Several Shadow Seeker and Rune Architect objectives, along with later nodes in every branch, still need dedicated lessons and challenges before they can be mastered.

## Game concept

You carry a book that fills with real security knowledge as you solve things. Chapters follow a fixed shape: story, dialogue, a plain-language lesson (with a "technical detail" you can open), an interactive challenge, a decision or investigation, a final trial, and a new Grimoire page.

Design rules that the code enforces:

- **No skipping the learning.** Challenge scenes only advance after a pass. Failing never costs progress; you get feedback, hints, and retries.
- **XP only for first passes.** Replays are review. There is nothing to farm. Each hint costs a little XP, never all of it.
- **Archetypes and genders are story flavor only.** They never gate lessons, quests, or abilities.
- **The fantasy never replaces the definition.** Every creature has a *Real-World Knowledge* panel with the actual technical content, and says how it differs from other malware (a worm is not a virus).
- **Safe by construction.** All scenarios are fictional. Logs use documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`). Player input is never executed. There is no scanning, no malware, no network access.

## The Malware Bestiary

Twelve original creatures in six threat categories, each with: lore and personality, a plain-language definition, behavior and propagation, symptoms, a fictional scenario, synthetic evidence, defense, prevention/containment/recovery, a note on how it differs from similar malware, references, and a perspective for each order.

| Category | Creatures |
|---|---|
| Infection | Worm, Virus, Downloader/Dropper |
| Deception | Trojan, Adware |
| Surveillance | Spyware, Keylogger |
| Persistence | Rootkit, Logic Bomb |
| Destruction | Ransomware, Wiper |
| Coordinated Threats | Botnet |

Locked entries appear as silhouettes with a teaser. They open when you meet the creature.

**Each playable encounter uses a different mechanic:**

- **The Worm: spreading infection on a network graph.** Find patient zero from logs, then spend one action per turn (isolate, patch, wait) while the infection spreads hop by hop to vulnerable, connected, unpatched hosts. Patching does not cure an infected host; isolating the archive "wins" but is penalized for taking your key service offline. The simulation is a pure deterministic function.
- **The Trojan: trust and permissions.** Four tools, each with provenance and requested permissions. Grant least privilege and choose Approve, Sandbox, or Reject. One legitimate tool *should* be approved (broad access can be justified); one plausible-but-unverified tool calls for a sandbox. It teaches judgment rather than blanket refusal.
- **The Ransomware: incident-response decisions.** Six decisions over synthetic evidence: containment, evidence, source vs. symptom, which backup is actually clean ("newest is not cleanest"), restore priority, and reporting. Paying as a first move is a critical failure.

![Worm encounter](docs/screenshots/07-worm-boss-sim.png)

## Quick start

Requires Node.js 22.22+ for the current test toolchain (Vite itself requires Node.js 20.19+).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 100+ tests
npm run build      # production build in dist/
npm run preview
```

Progress is saved to `localStorage` in the current browser only. Clearing browser data erases it. Settings has a confirmed reset.

## Architecture

Content, engine logic, state, and presentation are separate, so the content and rules can be reused by a future React Native app.

```mermaid
flowchart LR
  subgraph Content["content/ (pure data)"]
    C1[world, paths, archetypes]
    C2[assessment]
    C3[quests + scenes + lessons]
    C4[challenges]
    C5[malware creatures]
    C6[grimoire pages]
  end
  subgraph Engine["engine/ (pure functions)"]
    E1[assessmentEngine]
    E2[challengeEngine]
    E3[spreadEngine]
    E4[progressionEngine]
    E5[unlockEngine]
    E6[questEngine]
  end
  subgraph State["state/ + storage/"]
    S1[gameReducer]
    S2[GameContext]
    S3[saveSchema: validate, migrate]
    S4[saveStorage: localStorage]
  end
  subgraph UI["React (web only)"]
    P[pages]
    CP[components: dialogue, challenges, map, bestiary]
  end
  Content --> Engine
  Engine --> S1
  Content --> S1
  S1 --> S2 --> UI
  S2 --> S4
  S3 --> S4
  UI --> Engine
```

```
src/
  content/      world, paths, archetypes, assessment, quests/, lessons/, challenges/, malware/, bestiary
  engine/       assessment, challenge, spread, progression, unlock, quest (all pure and unit-tested)
  state/        gameReducer (real game logic) + GameContext (autosave)
  storage/      versioned save schema, sanitizer, migrations, storage wrapper
  components/   common, dialogue, challenges, map, bestiary, character, game
  pages/        one per screen
  tests/        Vitest + React Testing Library
```

**Adding a challenge** is a data change: add an object with `type`, `data`, `hints`, `explanation`, `xp`, and it renders through `ChallengeRunner`. Supported types: `multiple_choice`, `multi_select`, `match_pairs`, `sort_order`, `decision_tree`, `fill_in`, `network_spread`, `permission_review`. A lint test checks every definition and that each is solvable.

**Adding a creature** is a data change in `content/malware/creatures.js`. A field-study creature needs one challenge; its Grimoire page is generated from the entry.

**Save schema** is versioned (`SAVE_VERSION = 1`). Loading migrates older versions, rejects newer ones without overwriting them, and sanitizes every field (types, ranges, lengths, known values). Corrupt, unavailable, or full storage degrades to a message, never a crash.

## Educational design

- Plain language first, technical detail one click deeper.
- Evidence over guessing: bosses are solved by reading logs and reasoning, not by clicking.
- Context over thresholds: Chapter 1 teaches that no fixed number of failed logins proves an attack.
- Time zones are introduced only after basic timelines.
- Feedback explains the *specific* wrong answer, not just "incorrect".
- Understanding malware never requires writing it. Nothing here is functional malware.

Topics covered so far: events vs alerts vs incidents, log reading, timelines and UTC normalization, correlation and false positives; worms (propagation, patching, segmentation, isolation); Trojans (provenance, least privilege, social engineering, sandboxing); ransomware (containment, evidence preservation, backup integrity, recovery priority, reporting); plus beginner coverage of virus, spyware, keylogger, rootkit, botnet, logic bomb, wiper, dropper, and adware. **This is an introduction to those topics, not complete coverage of cybersecurity.**

## Accessibility

Keyboard-operable everywhere (sorting uses move buttons, matching uses native selects, the worm graph has an equivalent table); visible focus; skip link; status always has text and a glyph, never color alone; adjustable text speed and size; reduced-motion setting (also follows the OS); sound optional and **muted by default**; no horizontal overflow from 360 px to desktop; bottom tab bar on mobile.

![Mobile](docs/screenshots/10-mobile-map.png)

## Testing

`npm test` runs the suite: assessment scoring and path selection, every challenge validator (and that every challenge is solvable), the spread simulation, XP and hint rules, achievements, quest dependencies and map unlocks, evidence-board prerequisites/scoring/one-time rewards, skill-tree recommendations, malware content integrity, save migration and recovery, and React Testing Library flows (new game, reset confirmation, keyboard dialogue and sorting, encounter play, persistence, and the new progression screens).

The chapter and encounters are completed in tests through the real reducer and validators using answers derived from the data, with no fabricated state.

## Asset licensing

- **Pixel art** (creatures, characters, village scene) was supplied by the project owner and converted/cropped for the game. **Confirm its provenance and license before publishing the repository.** The code does not depend on any specific image; replace files in `src/assets/` (keys are filenames).
- **Mimic and Memory Eater** have no art and use a labeled placeholder glyph.
- **Map illustration** was supplied by the project owner. Confirm its provenance and license before redistribution.
- **Sound** is synthesized at runtime. No audio files, no third-party audio.
- **Fonts**: Pixelify Sans and Crimson Pro via `@fontsource` (SIL Open Font License), bundled locally.
- **Icons**: Lucide (ISC).

## Known limitations

- One chapter and three malware encounters are fully playable; most of the world is sealed.
- Nine malware creatures have beginner field studies only.
- The assessment has no matching-type questions (multiple choice, log, code, scenario, interest).
- Some listed challenge types (inspect an HTTP request, compare snippets, pick a code fix) can be authored as multiple choice but have no dedicated renderer.
- Reference links (MITRE ATT&CK, NIST, CISA) point to stable pages but **were not verified live** during development. Check them before release.
- Tested with automated role-based queries and browser screenshots; **not tested with a screen reader**, and no automated color-contrast audit was run.
- Character portraits are cropped from a scene lineup, so portraits include some background.
- Progress lives in one browser's `localStorage`; there is no sync or backup export.

## Roadmap

Next Night Watch chapter; the intermediate and boss encounters for the nine field-study creatures; Rune Gates (networking) and Shattered Web (web security, with the Shapeshifter and Vampire); locked-region quests; other orders' starter quests; backup/export of saves; dedicated renderers for the remaining challenge types; a screen-reader and contrast audit. Further out: isolated, authorized live labs (never arbitrary code on an app server), accounts and cloud saves, classroom mode, translations, and a React Native app reusing `content/` and `engine/`.

## Contributing

Add content as data first, add a test, keep scenarios fictional, and keep fantasy metaphor separate from the technical definition. Run `npm test` and `npm run build` before opening a PR. Do not add functional malware, real targets, or code that executes player input.

## License

Code: MIT (add a `LICENSE` file before publishing). Art: see *Asset licensing* above.
