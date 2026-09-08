# Originály obrázků dekorů

Sem patří stažené skeny dekorů Egger (z myEGGER „Data pro CAD programy" nebo obrázek dekoru
ze stránky dekoru). Název souboru musí obsahovat kód dekoru, např. `H3157_ST12.jpg`.

K tomu `rozmery.json` s tím, kolik mm desky obrázek zabírá:

```json
{ "H3157": { "sirkaMm": 2800, "vyskaMm": 2070, "bezesvy": true, "zdroj": "myEGGER CAD data" } }
```

Pak spusť `python3 scripts/dekory_prepare.py` — vyrobí `app/public/dekory/*.jpg` a `manifest.json`.
Originály se do gitu necommitují (jsou velké), zpracované JPG ano.
