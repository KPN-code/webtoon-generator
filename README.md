# Webtoon Generator — AWS + Bedrock

React-sovellus joka generoi webtoon-paneeleja Amazon Bedrock (Nova Lite) -mallilla AWS Lambdan kautta.

---

## Korjatut ongelmat

### 1. Lambda palautti väärän datan (KRIITTINEN)
**Ennen:** Lambda palautti koko Bedrock-vastausobjektin sellaisenaan, mutta frontend odotti `data.text`-kenttää.
**Korjaus:** `index.js` parsii nyt oikein Amazon Nova Lite -vastauksen rakenteen:
`responseBody.output.message.content[0].text`

### 2. splitStoryToPanels-funktio ei toiminut oikein
**Ennen:** Funktio splittas lauseiden perusteella (`.!?`), mutta AI:n vastaukset ovat kappaleita.
**Korjaus:** Splitataan ensin `\n\n`-kappaleilla, sitten lauseilla varasuunnitelmana.

### 3. Style, World ja Characters -tabit eivät toimineet
**Ennen:** Napit oli disabloitu "Lambda not implemented".
**Korjaus:** Kaikki kutsuvat nyt Lambdaa `type`-parametrilla. Lambda käyttää eri system promptia jokaiselle tyypille.

### 4. CORS preflight puuttui
**Ennen:** Lambda ei vastannut OPTIONS-pyyntöihin.
**Korjaus:** Lambda palauttaa 200 OPTIONS-pyynöille oikeilla CORS-headereilla.

### 5. Kovakoodattu region
**Ennen:** `region: "eu-north-1"` kovakoodattu.
**Korjaus:** Käyttää `process.env.MY_AWS_REGION`-ympäristömuuttujaa.

---

## Arkkitehtuuri

```
React (Amplify / CloudFront + S3)
    ↓ POST /items
API Gateway (eu-north-1)
    ↓
Lambda (webtoongeneratora0208b26)
    ↓ { type: "story"|"style"|"world"|"character" }
Amazon Bedrock (amazon.nova-lite-v1:0)
```

---

## Käyttöönotto

### Vaatimukset
- Node.js 18+
- AWS CLI konfiguroitu (`aws configure`)
- Amplify CLI: `npm install -g @aws-amplify/cli`

### 1. Asenna riippuvuudet
```bash
npm install
cd amplify/backend/function/webtoongeneratora0208b26/src && npm install && cd ../../../../..
```

### 2. Deploy Amplify
```bash
amplify push    # Deploy Lambda + API Gateway
amplify publish # Deploy frontend S3/CloudFront
```

### 3. Bedrock Model Access
Varmista AWS-konsolista että `amazon.nova-lite-v1:0` on aktivoitu:
**Bedrock → Model access → Manage model access → Amazon Nova Lite**

### 4. Lambda IAM-oikeudet
Tarkista `amplify/backend/function/webtoongeneratora0208b26/custom-policies.json`:
```json
[{"Action": ["bedrock:InvokeModel"], "Resource": "*"}]
```

---

## API

POST /items

Request:
```json
{"prompt": "A samurai walks into a burning village", "type": "story"}
```

Tyypit: story | style | world | character

Response:
```json
{"text": "...", "type": "story"}
```

---

## Vianetsintä

- **403 Forbidden** → Tarkista API Gateway CORS + OPTIONS-metodi
- **"Could not extract text"** → Tarkista CloudWatch Logs, varmista Nova Lite -malli aktivoitu
- **AccessDeniedException** → Lambda tarvitsee `bedrock:InvokeModel` IAM-oikeuden
- **Paneelit eivät näy** → Avaa DevTools Console, tarkista API-vastaus
