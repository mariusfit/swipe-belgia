# Swipe Belgia

Prototip vizual (HTML static, un singur fișier, fără cereri externe) pentru o experiență de tip „swipe” (în stilul Tinder) prin care utilizatorii parcurg informații practice despre Belgia, în română. Exemplul din prototip: garanția locativă și plafoanele pe regiuni (Flandra, Bruxelles, Valonia, Comunitatea germanofonă).

**Atenție:** este doar un prototip vizual. Cifrele provin din pagina pilot și nu sunt informații oficiale noi.

## Versiuni

| Versiune | Fișier |
|---|---|
| v1 | `versions/index.v1.html` |
| v2 | `versions/index.v2.html` |
| v3 | `versions/index.v3.html` |
| v4 | `versions/index.v4.html` |
| v5 | `versions/index.v5.html` |
| v6 | `versions/index.v6.html` |
| **v7 (curentă)** | `index.html` |

## Cum se vede

- Local: deschide `index.html` (sau oricare fișier din `versions/`) direct în browser.
- Versiunea v7 este publicată într-un mediu privat, accesibil doar cu **Tailscale** conectat.

## Structură

- `index.html` – v7, generat din `src/` cu `build.sh`
- `versions/` – v1–v6
- `src/` – surse (CSS, HTML, JS) pentru v7
- `data/` – date JSON folosite de prototip
- `capturi/` – capturi de ecran ale prototipului
