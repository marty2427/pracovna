# Prompt pro Cowork: stáhnout skeny 15 dekorů Egger ST12

Zkopíruj do Cowork (s přístupem k prohlížeči a ke složce, kam má ukládat).

---

Potřebuji stáhnout obrázky dekorů z webu Egger pro 3D konfigurátor stolu. Jde o těchto 15 dubových dekorů, všechny ve struktuře ST12 Omnipore Matt:

H193, H305, H309, H1199, H1303, H1362, H3131, H3133, H3156, H3157, H3165, H3170, H3171, H3395, H3398

Stránka každého dekoru je `https://www.egger.com/cs/vyroba-nabytku-a-interierovy-design/dekory/<KOD>_12` (např. `…/dekory/H3157_12`). Pokud adresa nefunguje, vyhledej kód přes vyhledávání dekorů na egger.com a vyber variantu ST12.

Pro každý dekor udělej toto, v tomto pořadí priorit:

1. **Nejlepší zdroj: myEGGER „Data pro CAD programy“.** Jsem přihlášený v myEGGER (nebo mě požádej o přihlášení, registrace je zdarma). Na stránce dekoru v sekci ke stažení stáhni „Data pro CAD programy“ (ZIP, cca 12 MB). Rozbal ho a vyber největší obrázek textury (JPG/PNG/TIF), přednostně soubor označený jako bezešvý/seamless/tileable, jinak sken celé tabule. Z názvu souboru nebo přiloženého readme zjisti, kolik mm desky obrázek zabírá (typicky celá tabule 2800 × 2070 mm).
2. **Náhradní zdroj:** když CAD data nejdou stáhnout, ulož obrázek dekoru přímo ze stránky v nejvyšším dostupném rozlišení (otevři obrázek samostatně, ať to není zmenšený náhled). Zapiš si rozměr v pixelech.
3. Nezmenšuj, nepřevádej ani jinak neupravuj obrázky.

Ulož soubory do jedné složky `dekory-raw` s názvem `<KOD>_ST12.jpg` (nebo `.png`/`.tif` podle originálu), např. `H3157_ST12.jpg`.

Do stejné složky zapiš `rozmery.json` v tomto tvaru (jeden záznam na dekor):

```json
{
  "H3157": { "sirkaMm": 2800, "vyskaMm": 2070, "bezesvy": true, "zdroj": "myEGGER CAD data, soubor H3157_ST12_seamless.jpg" },
  "H3170": { "sirkaMm": 0, "vyskaMm": 0, "bezesvy": false, "zdroj": "obrázek ze stránky dekoru, 1600x1200 px, výřez desky" }
}
```

`sirkaMm`/`vyskaMm` = kolik milimetrů skutečné desky obrázek zobrazuje (u celé tabule 2800 × 2070). Když to nejde zjistit, dej 0 a do `zdroj` napiš, co obrázek je, velikost v pixelech a jestli vypadá jako celá tabule, nebo jen výřez.

`bezesvy` = true jen když je soubor od Eggeru výslovně označený jako seamless/tileable.

Na konci celou složku zabal do `dekory-raw.zip` a napiš mi, které dekory se povedlo stáhnout z CAD dat, které jen ze stránky a které chybí.

---

## Co následuje

ZIP nahraj do Claude Code (do rozhovoru s konfigurátorem). Tam se spustí
`python3 scripts/dekory_prepare.py`, zkontroluje se měřítko a orientace kresby na stole
a nová verze se zveřejní. Nebo, když je repozitář naklonovaný lokálně, může Cowork
soubory uložit rovnou do `research/dekory-raw/`, spustit skript a commitnout `app/public/dekory/`
do větve `claude/desk-configurator-living-room-a9vnnp`.
