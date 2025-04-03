# Astro.js Coolify Test Projesi

Bu proje, Astro.js kullanarak oluşturulmuş basit bir web sitesinin Coolify ile nasıl self-host edilebileceğini göstermek için oluşturulmuştur.

## Özellikler

- Astro.js ile SSR (Sunucu Tarafında Render)
- Coolify ile self-host deployment
- Basit ve anlaşılır tasarım
- Çoklu sayfa yapısı

## Gereksinimler

- Node.js 18 veya üzeri
- Coolify kurulu bir sunucu veya Coolify hesabı

## Yerel Geliştirme

Projeyi yerel ortamda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## Derleme

Projeyi derlemek için:

```bash
npm run build
```

Derlenen dosyalar `dist/` klasöründe oluşturulacaktır.

## Coolify ile Dağıtım

1. Coolify'da yeni bir servis oluşturun
2. GitHub repository'nizi bağlayın
3. Dockerfile kullanarak dağıtım yapılandırmasını seçin
4. Dağıtımı başlatın

## Docker ile Çalıştırma

```bash
# Docker imajını oluşturun
docker build -t astro-coolify-test .

# Docker konteynerini çalıştırın
docker run -p 3000:3000 astro-coolify-test
```

## Lisans

MIT

---

Bu proje Coolify kullanılarak self-host edilen uygulamaların bir test örneğidir.

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Ortam Değişkenleri

Projenin çalışması için aşağıdaki ortam değişkenlerinin tanımlanması gerekir:

- `SUPABASE_URL`: Supabase API URL
- `SUPABASE_KEY`: Supabase API Anahtarı
- `SITE_URL`: Sitenin tam URL'si (örn: https://example.com)

### Coolify Konfigürasyonu

Coolify'da dağıtım yaparken aşağıdaki ortam değişkenlerini ayarlayın:

```
SITE_URL=https://example.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

Önemli: Ortam değişkenleri doğrudan Coolify dashboard üzerinden ayarlanmalıdır. `.env.production` dosyası kullanılmamaktadır.

`SITE_URL` değişkeni SEO optimizasyonları, canonical URL'ler ve sitemap oluşturma için kullanılmaktadır.

## SEO Özellikleri

Proje, aşağıdaki SEO özelliklerini içerir:

- **Sitemap.xml**: Tüm kategorileri ve blog yazılarını içeren otomatik oluşturulan sitemap. `/sitemap.xml` adresinden erişilebilir.
- **Robots.txt**: Arama motorları için robots.txt dosyası. `/robots.txt` adresinden erişilebilir.
- **Canonical URL'ler**: Tüm sayfalarda canonical URL'ler otomatik olarak eklenir.
- **Open Graph Etiketleri**: Sosyal medya paylaşımları için Open Graph meta etiketleri.

Site URL'si dinamik olarak `SITE_URL` ortam değişkeninden alınır.
