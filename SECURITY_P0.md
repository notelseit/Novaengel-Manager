# P0 — Bonifica delle credenziali NovaEngel

## Stato
La password API pubblicata in passato è stata **ruotata dal proprietario** il 23 ottobre 2026. La rotazione non rimuove i contenuti dai commit già pubblicati.

## Bonifica della cronologia (operazione separata, non eseguibile con una PR)
1. Congelare temporaneamente merge e push e coordinare chi ha clonato il repository.
2. Creare un backup offline del repository e verificare tutti i branch e tag, inclusi i riferimenti delle PR.
3. Su clone mirror isolato, utilizzare `git-filter-repo` con un file di sostituzione segreti **locale e mai committato** per sostituire il valore compromesso in tutta la storia. Evitare di mettere la password nelle righe di comando, nei log o negli artifact CI.
4. Verificare con uno scanner di segreti l'intero nuovo grafo Git, branch e tag inclusi.
5. Effettuare un push forzato controllato con protezioni e collaborazione dei manutentori.
6. Chiedere a GitHub Support l'eliminazione dei riferimenti delle PR non raggiungibili e della cache che trattiene i vecchi oggetti sensibili, seguendo la procedura GitHub per la rimozione di sensitive data.
7. Fare riclonare i repository ai collaboratori, impedendo il ripristino accidentale dei commit precedenti.

La riscrittura della storia non garantisce la cancellazione delle copie già clonate o archiviate. La revoca delle credenziali resta la misura essenziale.

## Prevenzione
Il workflow `secret-scanning.yml` scansiona solo i commit nuovi delle PR, evitando di bloccare il lavoro per la storia già contaminata. Usare anche GitHub Secret Scanning / Push Protection quando disponibile e un hook locale per Gitleaks.
