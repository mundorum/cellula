# Cellula — design journal

Agent-based simulation app for kids 8–12. Phone-first, tablet planned.
Palette + type derived from the user's Symbio banner: Baloo 2 (display) + Nunito (UI),
deep teal/abyss ground with glow-teal `#79dcc4`, amber `#f0a63c`, lime `#a8cf4c`.

---

## v0.1 — first prototype (as "Symbio")
**File:** `Symbio.dc.html` (deleted at v0.3)

- Live continuous micro-world sim: algae → ciliates → amoebas, each sensing, steering,
  eating, dividing and starving in real time.
- Six tabs: Worlds · Stage · Rules · Species · Build · Data.
- **Rules** = node graph (chosen by the user over blocks/table/ladder): 9 sensors left,
  9 actuators right, tap-tap to wire, tap a wired pair to unhook. Wires drive real behaviour.
- **Species**: sprite picker (4 CSS blob shapes), size / speed / divide-threshold sliders.
- **Build**: 10×14 paint grid — rock, nutrient, light — colliding with the live agents.
- **Data**: population polyline from real sim history, births/deaths/alive KPIs, plain-language summary.
- Companion `Symbio Explorations.dc.html`: options 1a–1g (3 rule editors, 2 stage looks, 2 shells).

## v0.2 — ecosystem balance fix
- Divide threshold lowered to spawn-energy + 10; prey payoff up (mote +24, prey +42); drains down.
- Deterministic mote replenishment (accumulator, not per-frame RNG).
- **Population floor**: any species hitting zero is reseeded with 2–3 individuals, so a child
  never lands on an empty pond. Data screen explains the reseed in words.
- Clock and chart span switched from ticks to seconds.

## v0.3 — rename
- `Symbio` → **Cellula** everywhere; files renamed to `Cellula.dc.html`
  and `Cellula Explorations.dc.html`.
- Confirmed organism art is original: CSS radial-gradient blobs (glow + off-centre nucleus +
  clock-driven tail), not sprites from any existing product.

## v0.4 — skins, the Lab, and block-programmed actuators
**File:** `Cellula v2.dc.html` (v0.3 kept as `Cellula.dc.html`)

Three questions answered:

1. **Skins over a light switch.** A `SKINS` registry of token sets — `pond` (dark microscope),
   `lab` (LightBot light blue), `meadow` (light green). One tap in the header cycles them; every
   themed surface reads from tokens. A new subject = a new entry, not a refactor. Species colours
   stay constant across skins so the biology reads the same.
2. **Actuators are programs, not atoms.** Tapping an action node in the wiring graph *opens* it
   into a LightBot-style block editor: MAIN strip + PROC1 strip, palette of forward / turn-left /
   turn-right / act / jump / trail / wait / P1. Wiring nodes show a live block count.
3. **Sensors are mounted on the body.** Top-down agent with front/back/left/right slots in Basic
   mode; Advanced unlocks free angle, range and field-of-view per mount, drawn as LiveWorld-style
   cones — the same cones the agents render on the Stage.

Plus **Test**: a 7×7 sandbox arena where the open actuator's program runs step-by-step with the
current block highlighted, call stack included.

Navigation collapsed 6 tabs → 5: Worlds · Stage · **Lab** · Build · Data.
Lab holds Body · Wiring · Blocks · Test.

## v0.5 — fusion with the CA-centric sibling
**File:** `Cellula v3.dc.html` (v2 kept)

Fused with the sibling project *Cellula: Cellular Automata-Centric Design* (cell art from
harena-lab/dcc, bilingual PT+EN voice, rule-card editor) on this project's skin tokens.

- **One space, two engines.** Continuous coordinates with the cell grid as a *lens* over them:
  CA rules read the grid, the agent moves freely on top. `CÉLULAS ⇄ AGENTE` swaps only the
  fish's brain — the aquarium never changes, so chapter 1 and chapter 3 are literally the same
  problem twice. Switching converts state both ways (cell `>`/`<` ⇄ agent x/y/heading) and
  announces itself in a toast.
- **Canonical demo** (user's ask): the fish crossing an aquarium and bouncing off the glass.
  CA: 4 rules (`>_`→`_>`, `>g`→`<g`, mirrored). Agent: `parede à frente → dar meia-volta`
  wired to a two-block program.
- **Preset ladder** (7 levels) gates every surface: cells-only · steps-only · fixed sensors ·
  free sensors · blocks+P1 · mixed · sandbox. The header level chip opens the picker; the
  Mundo tab and Corpo/Ligações/P1 only appear when the level includes them.
- **Home = challenge shelf** (7 chapters, goals: reach, bounce, collect, efficiency, survive)
  plus a CRIAR corner button that drops into the free sandbox.
- Art: `art/*.svg` — fish-left/right, plant, rock, sand, glass, waves, cyanobacteria.

### Open / next
- Tablet split-view shell (exploration `1g`) not built yet.
- Block programs currently drive the sandbox; the continuous Stage sim still runs its
  built-in primitives — unifying the two is the next substantive step.
- Comic-strip rule editor (`1b`) and priority ladder (`1c`) remain unbuilt alternatives.

## v0.6 — as regras de transição entram no app
**File:** `Cellula v4.dc.html` (v3 kept)

A superfície de regras de `Cellula Rules Explorations` foi incorporada à Oficina, no modo
CÉLULAS, como duas abas em vez de um editor novo — tudo desenhado com os tokens de `SKINS`,
então pond / lab / meadow / slide continuam valendo sem exceção.

1. **Gravar (era 1a).** O cartão "ensinar uma regra" virou gravador: quatro gestos
   (arrastar · arrastar cópia · pintar · apagar) e o *depois* é **calculado** do antes pelo gesto
   escolhido — duplicar mantém a mãe na casa de origem, apagar esvazia, pintar usa o pincel atual.
   A seta de direção e o salvar continuam os mesmos, então a regra colhida entra na mesma lista
   ordenada com a mesma chance %.
2. **Fita (era 1b).** Nova: `this.frames` guarda uma fotografia da grade inteira por passo
   (máx. 6). O botão **Pronto — próximo passo** é a mesa do motor: a criança aciona o tempo à mão,
   cada toque fotografa o mundo e acrescenta um quadro. Tocar num quadro escolhe o par t_n → t_n+1.
   A **colheita** difere as duas fotos em regras candidatas de par, conta repetições e marca
   contradição (mesmo antes + mesma direção, dois depois diferentes) com as respostas
   "sempre assim" / "com chance 50%". Aceitar grava na lista; jogar fora esconde o candidato.
3. **Gating pela escada de presets.** `f.strip` só existe em *misto* e *bancada livre*: no
   capítulo 1 a Oficina mostra apenas Gravar, sem abas. A criança ganha a fita quando já tem
   motivo para ela.

O diff da colheita foi o trabalho real: dois passos (movimento lido só da casa de origem, para
não reportar o mesmo evento espelhado; depois mudanças no lugar, emparelhadas com um vizinho que
*não* mudou) para que dois eventos simultâneos não se misturem numa regra confusa.

Dois consertos depois da revisão: os quadros da fita passaram de 46px (células de 2,5px,
instantes indistinguíveis) para 96px com rolagem horizontal e **contorno lima nas casas que
mudaram** em relação ao quadro anterior — é o contorno da Mesa do motor, que faltava; e a colheita
não aceita mais um antes com as duas casas vazias: esse candidato casaria em qualquer lugar do
aquário, então vira a terceira resposta honesta ("falta algo na foto") em vez de um Aceitar.

Terceira rodada, depois de o usuário notar que só os gestos tinham atravessado: o editor ganhou
**mundo** nas duas abas. Em **Gravar**, o aquário inteiro aparece dentro do cartão de regra —
tocar numa casa escolhe o par (ela e a vizinha na direção da seta, ambas com o anel âmbar) e o
gesto calcula o depois; abaixo, os dois recortes **3×3 antes/depois** com ✳ nas casas que não
importam. Em **Fita**, a mesa do motor virou o aquário editável de verdade: pincéis, contorno lima
nas casas tocadas desde a última foto, e a foto anterior aparecendo esmaecida por baixo do que
mudou. A fita também foi destravada no preset `ca` — o capítulo 1, que é puro células, era
justamente onde colher do tempo jogado faz mais sentido. Navegação mantida como estava, a pedido.

### Open / next
- **Tipos de regra (1c)** ficou fora: contar (B/S), quantidade, fita 1D e turmite exigem um
  segundo caminho no motor, que hoje só sabe trocar pares. É o próximo passo substantivo.
- A gravação em 1a ainda acontece num par de células, não arrastando o peixe no aquário da tela
  Mundo — o gesto é escolhido por botão. Ligar o gesto ao arraste real é a melhoria óbvia.
- `Cellula Rules Timeline` e `Cellula Rules Versions` registram de onde essas decisões vieram.

## v0.7 — forças: a fundação antes do modelo
**File:** `Cellula Forces Explorations.dc.html` (v4 intocado)

Revisão da v4: o motor está fechado em seis pontos (célula = um caractere, uma só forma de regra,
uma só política de atualização, dois motores escolhidos por `mode`, objetivos dentro do motor,
grade fixa). Fundação combinada, no mesmo gesto que `SKINS` fez para os temas:

- **Tipos com propriedades** (`{kind, heading, charge, mass, vx, vy}`) no lugar de caracteres.
- **Camadas**: a de símbolos de hoje mais camadas de números (o campo). O mundo é dono do tamanho e da borda.
- **Modelos como entradas de registro**: cada um declara o que precisa, seus botões, política de
  atualização, rostos (células / agentes), cartão, lentes, medidas e eventos. O motor só percorre a lista.
- **Medidas e eventos**: objetivos e gráficos leem deles, não de bandeiras no motor.

Decisões do usuário: lei como cartão de três botões (força, alcance, sinal); opção direta 1/r² no
rosto AGENTE para elipses de verdade; 2D com grade maior nas cenas de força; explorações primeiro.

A página de explorações traz três peças vivas, todas obedecendo ao mesmo cartão:
**F1 cartão de lei** (na lista de leis, com o rosto CÉLULAS agindo), **F2 lente de campo**
(calor, setas, passos de campo por ciclo) e **F3 gesto de lançar** (tocar, puxar, soltar; caminho
previsto pontilhado; pelo campo ⇄ direto 1/r²; contadores de órbita, fuga e captura).

Achado ao construir: um corpo não pode sentir o próprio campo. Com o campo atrasado, o rastro do
corpo o freava e a órbita caía. Cada fonte guarda o seu campo e o motor desconta — entra no
contrato do modelo.

### Open / next
- Atrito: hoje fixo (a água freia). Quarto botão do cartão ou propriedade do mundo?
- Portar a v4 para o registro (regras de par e cérebro como as duas primeiras entradas) e só então
  acrescentar o capítulo de forças.
- Os tipos de regra (1c) da v0.6 entram pela mesma porta: são modelos novos, não um segundo motor.

## v0.8 — camadas: concentração que busca o equilíbrio
**File:** `Cellula Layers Explorations.dc.html`

Segundo conceito, combinado com as forças por camadas. Decisões do usuário: o equilíbrio vem do
**movimento ao acaso** (versão principal), com a camada lisa de quantidade como opção; osmose
propriamente dita (água atravessando, célula inchando) fica para depois.

Três regras de contrato que fazem os modelos se combinarem:
1. **Modelos empurram, um só modelo move.** Força, peso e agitação somam no mesmo empurrão.
2. **O terreno media tudo.** A membrana é terreno com uma lista de quem passa.
3. **Qualquer camada pode ser lida por qualquer um**: lente, sensor, objetivo.

Peças vivas: **L1 o meio** (agitação e arrasto como propriedades do mundo; gota se espalhando,
partículas ⇄ quantidade; medida de mistura), **L2 membrana** (quem passa, poros; duas câmaras com
barras esquerda/direita) e **L3 camadas juntas** (cenas Sedimento, Nuvem e Voltagem; olhos por
camada; força contra agitação).

Achados: a camada lisa usa a mesma regra do campo de forças (trocar com as vizinhas), só que sem
fonte e sem perda — uma regra de espalhar com dois ajustes, não dois modelos. O atrito da v0.7
ficou resolvido: arrasto e agitação moram juntos no meio.

Quarta cena em L3, **Grupos**: todas as partículas se atraem e a agitação espalha. Há uma virada
brusca: com agitação alta e força fraca tudo fica por igual; passando de um ponto, quase tudo se
junta. Força muito alta dá vários grupos pequenos, porque travam antes de se fundir. O motor da
página ganhou o sinal “tudo se atrai” (`all`), o mesmo do cartão de lei.

### Open / next
- O peso (puxão uniforme do chão) é um segundo cartão de lei ou propriedade do meio?
- Com poucas partículas o “igual” fica irregular; cenas de equilíbrio pedem grade maior.

## v0.9 — contagem: a vizinhança é da criança
**File:** `Cellula Counting Explorations.dc.html`

Terceiro tipo de cartão na lista de leis (fecha o “tipos de regra (1c)” da v0.6). Decisões do
usuário: vizinhança até 5×5, começando em 3×3; “quantos” como números tocados (qualquer conjunto).

O cartão é uma frase com cinco lugares: *uma casa que é [isto], com [tantos] de [aquilo] na
[vizinhança], vira [isto]*, mais a chance. A contagem é uma **camada medida** (a mesma da v0.8,
com a máscara da criança) e a regra lê essa camada. Atualiza todas de uma vez, como o campo.

Peças vivas: **N1 cartão de contagem** (lista de regras, editor de vizinhança, faixa de números,
mundo 31×21; conjuntos prontos Vida, Labirinto, Em cruz), **N2 lente de contagem** (o número que
cada casa vê, quem vai mudar no próximo passo, olhar uma casa) e **N3 com forças** (partículas que
se atraem e viram cristal quando cercadas; ordem no ciclo: mover, depois contar).

Achados: o Jogo da Vida são dois cartões (nascer, morrer); sobreviver não precisa de regra.
Em N3, com “5 ou mais vizinhas”, sem força formam-se uns 12 cristais de 60; com força, uns 54.

### Open / next
- Ordem no ciclo: pela lista de leis (a criança arrasta) ou por fases fixas por tipo de cartão?
- A colheita da fita ainda só propõe regras de par; propor regras de contagem fica para depois.

## v1.0 — um núcleo, dois níveis
**File:** `Cellula v5.dc.html` (v4 intocado)

Primeiro corte da v5, escrito sobre um núcleo genérico em vez de editar o motor da v4. O arquivo
tem três faixas marcadas: **KERNEL** (não conhece nenhum cenário), **CONTENT** (cenários como
dados) e **SHELL** (skins, desenho, interface).

- **Núcleo.** Tipos com propriedades (`KINDS`), terreno + corpos por cima, camadas de números,
  uma lista de cartões de lei e um meio. Cinco modelos: regras de par, regras de contagem, forças,
  cérebro do peixe e movimento; o meio (agitação, arrasto, peso) é propriedade do mundo.
- **Ordem fixa por fase**, e dentro da fase a ordem da lista: 1 empurrar · 2 cérebro · 3 mover ·
  4 pares · 5 contagem. O peso ficou no meio. (Fecha as duas decisões abertas de v0.8 e v0.9.)
- **Dois níveis.** *Introdutório*: prateleira de 8 mundos prontos, só Início e Simular, com os
  poucos botões que cada cenário declara. *Avançado*: abre Mundo (pintar, tamanho, casa em casa ⇄
  livre) e Oficina (lista de leis, editor por tipo de cartão, o meio, poros) sobre o mesmo mundo.
- **Mundos prontos**: peixe que vai e volta, aquário vivo, órbitas, poeira de estrelas, cargas,
  duas câmaras, Jogo da Vida, cristal. Cada um é uma lista de dados; “ver como foi montado” leva
  à Oficina com as leis dele abertas.
- Medidas (`PROBES`) alimentam os contadores e os objetivos; nenhum modelo liga bandeira de objetivo.

## v1.1 — gravar vale para todos os modelos
**File:** `Cellula v5.dc.html`, Oficina › aba **Gravar**

A mesa do motor, a fita e a colheita da v0.6 entraram na v5, e a colheita deixou de ser só de
pares: cada modelo contribui com a sua leitura de duas fotos (`HARVEST` no núcleo).

- **Mesa**: três ferramentas (mover, copiar, pintar/apagar) cobrem os quatro gestos da v0.6. O
  contorno verde marca o que mudou desde a última foto. “Foto do que eu fiz” grava sem rodar o
  mundo; “+1 passo do mundo” roda as leis ligadas e grava.
- **Par**: o diff de dois passos da v4, com contradição (sempre / 50%) e “falta algo na foto”.
- **Contagem**: propõe a regra quando todas as casas que mudaram viam um número que as iguais
  que não mudaram nunca viam. Um passo do Jogo da Vida devolve “vazio com 3 vira alga” e a regra
  de morte só com os números que apareceram na foto.
- **Força**: lê só o sentido (corpos indo para o vizinho mais próximo, ou iguais fugindo e
  diferentes chegando). Força e alcance ficam para o cartão.
- **Meio**: tudo desceu vira peso; cada um para um lado, sem padrão, vira agitação.
- Quando uma regra de contagem explica uma mudança, a leitura de par da mesma mudança some.

## v1.2 — o corpo do agente
**File:** `Cellula v5.dc.html`, Oficina › Leis › cartão **cérebro**

O cartão do cérebro ganhou três abas, como o Lab da v0.4:

- **Corpo**: sensores montados no peixe, com alcance e abertura; quatro lados ou ângulo livre.
  Sensores na mesma direção empilham para fora, para nenhum ficar escondido.
- **Ligações**: o grafo sensor → ação (toque, toque), mais a lista de prioridade com ▲: a
  primeira que for verdade vence.
- **Blocos**: faixa PRINCIPAL por ação, faixa **P1** (um atalho que todas as ações podem chamar) e
  a arena de teste 7×7, um bloco de cada vez, com o bloco que acabou de rodar em destaque.

Dois sensores novos leem as outras camadas: **vê vizinhos** (corpos dentro do cone) e **sente
puxão** (a camada de campo sobe naquela direção). No teste, um peixe com “sente puxão → nadar”
foi até a estrela. Nova lente **sensores** desenha os cones no mundo.

Mudança de padrão: o sensor de alga agora olha só 1 casa à frente. Com alcance 3, o peixe
tentava comer algas que ainda não alcançava e ficava parado.

### Ainda não portado da v4
- O gravador de uma regra só (escolher o par no aquário, recortes 3×3 antes/depois com ✳).
- P1 aqui é um só para todas as ações (na v4 cada ação tinha o seu).
- A escada de 7 níveis (virou dois) e os capítulos c2, c4, c5 com seus objetivos.
- Gráfico de população; rótulo PT+EN ao mesmo tempo (aqui é um idioma por vez).
