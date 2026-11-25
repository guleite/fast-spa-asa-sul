# Fast Spa Asa Sul · landing page

Proposta de layout (pitch) da Concept Agência para a unidade **Fast Spa Asa Sul** (franquia da rede Fast Spa, Brasília/DF).

**Publicado:** https://guleite.github.io/fast-spa-asa-sul/ (GitHub Pages, repositório [guleite/fast-spa-asa-sul](https://github.com/guleite/fast-spa-asa-sul), branch `main`; cada push na `main` atualiza o site).

Site estático: HTML/CSS/JS + GSAP, ScrollTrigger e Lenis via CDN. Página com `noindex` e `robots.txt` bloqueando buscadores.

Rodar local: `npx http-server fast-spa-asa-sul -p 5194 -c-1` (entrada "fast-spa-asa-sul" no `.claude/launch.json`). Depois de editar CSS/JS, subir o `?v=N` no `index.html`.

## Referências e identidade da rede

- https://fastspa.com.br (site da rede, Goiânia): fonte Inter, verde-água `#3AAAA7`, fundo `#F3F3F3`, rodapé preto, menu em pílula branca, hero escuro "Bem-estar real. / Sem hora marcada.", carrossel de experiências, "Sem agendamento. Sem complicação.", depoimentos, "Sua pausa começa aqui".
- https://fastspa.com.br/aguasclaras (página de unidade no DF): fonte Outfit, nude `#F1E2D3`, faixa verde-água em degradê com mapa, logo com "| Águas Claras", ícone de folha, banner "Cuidar de si não é luxo. É essencial."

Mantivemos tudo isso (Outfit nos títulos + Inter no texto, mesmas cores, mesmos textos institucionais) para preservar o padrão da franquia. Logo, favicon, ícone de folha, mapa do Brasil e todas as fotos são os arquivos oficiais da rede, baixados do site.

## Estrutura

Intro com as 4 pétalas da marca · topo com 3 fotos em transição + status "aberto agora" · faixa inclinada · Sobre · Como funciona (01–03) · Experiências (rolagem horizontal fixada no desktop, arraste no celular) · Sem hora marcada + números · Vídeo/manifesto (abre o vídeo institucional do YouTube `CJ_dOiSqz3M`) · Depoimentos + nota Google · A rede (mapa) · A unidade (endereço, horários com "hoje", TotalPass, mapa, como chegar) · Dúvidas · CTA final · rodapé · botão flutuante de WhatsApp.

O status "Aberto agora / Fecha às 20h / Abre amanhã às 8h" é calculado no horário de Brasília (`HORARIOS` no topo do `main.js`).

## Popup qualificador → WhatsApp

5 etapas: experiência → o que mais precisa → quando quer vir → já conhece o Fast Spa → nome, WhatsApp, observação opcional, "sou usuário TotalPass". Abre o WhatsApp com o resumo pronto. Os botões "Quero essa" dos cards já pré-selecionam a experiência (começa na etapa 2).

## Dados reais usados

- Endereço: **CLS 302, Bloco D, Loja 18, Asa Sul, Brasília/DF, CEP 70338-540** (Google Maps: "Fast Spa Asa Sul - Massagem e Bem-estar sem hora marcada").
- Horário: seg. a sáb. 8h–20h, dom. 10h–16h (cadastro TotalPass da unidade).
- Parceira TotalPass (cadastro TotalPass).
- Nota 5,0 no Google (vista no mapa em 24/11/2026).
- Experiências, descrições e depoimentos: copiados do site da rede (os depoimentos são de clientes da rede, não necessariamente da Asa Sul).

## Antes de publicar para o cliente

- `assets/js/main.js` (topo): `FASTSPA_WHATSAPP` está como `5561000000000` (trocar pelo número da unidade); `FASTSPA_LEAD_ENDPOINT` vazio = só registra no console.
- Link do Instagram no rodapé está com `#`.
- `[e-mail de contato]` em `privacidade.html`.
- **A confirmar com a unidade:** se todas as 9 experiências da rede são oferecidas na Asa Sul; quais estão no TotalPass; a frase "Valor combinado antes, sem surpresa no fim" (passo 02); se querem manter os depoimentos da rede ou trocar por avaliações do Google da própria unidade; "7 dias por semana" e "12h por dia" (derivados do horário).
- Fotos são do site da rede (provavelmente da unidade de Goiânia). Ideal: fotos da recepção e salas da Asa Sul.
