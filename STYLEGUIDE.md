# 🎨 Guia de Estilos (Styleguide) - Plataforma Prumo

Este documento define as diretrizes estéticas rigorosas do projeto. Qualquer nova tela, componente ou feature adicionada ao frontend DEVE obedecer estritamente a este padrão visual.

## 1. Tipografia
A identidade jovem e moderna da plataforma é dada pela tipografia.
- **Fonte Principal:** `Outfit` (importada do Google Fonts via `index.html`).
- **Configuração no Tailwind:** Configurada globalmente como `font-sans`.
- **Uso:** Não utilize outras fontes. Mantenha os títulos com pesos robustos (`font-bold`, `font-extrabold`) e textos auxiliares com pesos normais/médios (`font-medium`).

## 2. Paleta de Cores
Toda a plataforma suporta Light e Dark Mode nativamente através de variáveis CSS.
- **Cor Primária (Primary):** Vermelho vibrante (`hsl(0 72% 51%)`). Evita o padrão "azul corporativo" e traz dinamismo.
- **Backgrounds e Foregrounds (Base):** Utilizamos a paleta **Slate** do Tailwind.
  - No Light Mode: Fundos esbranquiçados (`Slate 50/100`) com texto escuro (`Slate 900`).
  - No Dark Mode: Fundos profundos e escuros, evitando o preto absoluto.
- **Atenção:** Nunca use cores fixas do Tailwind diretamente (como `bg-red-500` ou `text-gray-900`) em elementos da UI (a não ser em exceções muito específicas de badges). Sempre utilize as variáveis semânticas do shadcn (`bg-primary`, `text-foreground`, `bg-background`, `text-muted-foreground`), pois elas garantem a inversão automática no Dark Mode.

## 3. Identidade Visual (Glassmorphism & Depth)
A plataforma NÃO é flat. Ela possui profundidade e sobreposições de vidro (Glassmorphism). O arquivo `index.css` possui utilitários prontos para isso:
- **`glass`**: Aplica um leve fundo translúcido, desfoque (blur) e borda sutil. Ideal para headers ou pequenos componentes.
- **`glass-card`**: A versão premium para cards (ex: resumos de provas). Traz arredondamento forte (`rounded-2xl`), desfoque, borda e um efeito de hover obrigatório que faz o card flutuar e projetar sombra (`hover:-translate-y-1 hover:shadow-xl`).
- **`glass-panel`**: Para painéis maiores. Fundo mais opaco (`bg-white/80`) com desfoque máximo (`backdrop-blur-2xl`).

*Sempre que criar um novo container de conteúdo, priorize o uso de `glass-card` em vez de um fundo branco chapado com borda.*

## 4. Backgrounds Globais
O `<body />` da aplicação não possui uma cor sólida. Ele conta com um **Mesh Gradient Animado** sutil no fundo, criado diretamente no `index.css`. Esse gradiente reflete tons escuros e garante que os componentes "Glass" tenham algo orgânico para desfocar por trás deles.

## 5. Micro-animações e Interações
Nenhum elemento deve aparecer na tela de forma "seca".
- **Animações de Entrada:** Todas as telas devem usar as classes do `tailwindcss-animate` para entrar deslizando e aparecendo suavemente. 
  - *Padrão:* `animate-in fade-in slide-in-from-bottom-4 duration-700`.
- **Hover States:** Botões e cards devem responder ao mouse (`hover:scale-105`, `active:scale-95`, transições de cor).
- **Glows Decorativos:** Grandes painéis (como o do PIX) podem conter "glows" de fundo, construídos com divs absolutas desfocadas (`blur-3xl bg-primary/20 pointer-events-none`).

## 6. Padronização de Sombras e Arredondamento
- **Bordas (Radius):** O sistema utiliza bordas generosas. Cards geralmente usam `rounded-2xl` ou `rounded-3xl`. Botões usam `rounded-xl` ou `rounded-lg`. Cantos retos (`rounded-none` ou `rounded-sm`) devem ser evitados.
- **Sombras:** Sombras coloridas (ex: `shadow-primary/20`) são incentivadas para elementos primários, pois adicionam um "brilho" ao invés de uma sombra "suja" preta.
