# Originály obrázků dekorů

Sem patří stažené obrázky dekorů Egger. Stačí obrázek dekoru ze stránky dekoru
(`https://www.egger.com/cs/vyroba-nabytku-a-interierovy-design/dekory/<KOD>_12`) v plném rozlišení.
Registrace do myEGGER není nutná; „Data pro CAD programy" jsou jen lepší varianta (sken celé tabule
se známým měřítkem, někdy bezešvý).

Název souboru musí obsahovat kód dekoru, např. `H3157_ST12.jpg` nebo `H3157.jpg`.

Volitelně `rozmery.json` s tím, kolik mm desky obrázek zabírá. Když chybí, měřítko se odhadne
podle kresby (šířka let, velikost suků) a zapíše se do manifestu:

```json
{ "H3157": { "sirkaMm": 2800, "vyskaMm": 2070, "bezesvy": true, "zdroj": "myEGGER CAD data" } }
```

Pak spusť `python3 scripts/dekory_prepare.py` — vyrobí `app/public/dekory/*.jpg` a `manifest.json`.
Originály se do gitu necommitují (jsou velké), zpracované JPG ano.
