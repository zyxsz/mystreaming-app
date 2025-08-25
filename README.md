# MyStreaming

Uma plataforma de streaming completa, desde um catálogo bonito até o *encode/transcode* de vídeos.

Esse repositório contém:

1. [server](server) a api completa.
2. [clients/web-app](clients/web-app) uma aplicação react com todo o front-end.
3. [packages/encoder](packages/encoder) um pacote responsável por *encode/transcode* dos vídeos.
4. [infra/pulumi](infra/pulumi) toda a infraestrutura necessária para rodar o projeto.

## Conteúdo

- [Sobre](#sobre)
- [Imagens](#imagens)
- [Instalação](#instalação)
- [Usar](#usar)
- [Infraestrutura](#infraestrutura)
- [Pacotes](#api)
  - [API](#api)
  - [Front end](#front-end)
- [Progresso](#progresso)
- [Mantedores](#mantedores)
- [License](#license)

## Sobre

Gosto muito de assistir filmes e séries desde que me entendo por gente. Com todas essas diferentes plataformas de streaming disponíveis, muitas deixam a desejar. Logo, me veio a brilhante ideia de criar a minha própria, assim surgindo a **MyStreaming**!

Um dos principais problemas que eu vejo é a experiência do usuário, por isso a **MyStreaming** foi criada com o principal foco nesse ponto, oferecendo uma experiência fluida, funcional e elegante.

No meio do caminho, me deparei com um problema, streaming de vídeo é bem mais complicado do que aparenta. Procurei soluções em cloud, mas todas acabam sendo muito caras, sendo assim decidi criar minha própria solução, uma [aplicação](packages/endcoder) feita para rodar em qualquer VPS totalmente personalizada com as configurações ideais visando qualidade e custo.

## Imagens

![Home 01](https://i.imgur.com/SUFersh.png)

![Home 02](https://i.imgur.com/CPnnGMR.png)

![Dashboard](https://i.imgur.com/VNZQn6S.png)

## Instalação

Esse projeto utiliza [bun](https://bun.com/) para a **API** e [node](http://nodejs.org) para o front-end

Para rodar o projeto na sua máquina primeiramente clone esse repositorio e em seguida execute o comando abaixo no diretorio principal.

```sh
$ bun install
```

## Usar

Para finalmente iniciá-lo, primeiro acesse a pasta do servidor, em seguida configure todas as variáveis de ambiente seguindo o [.env.example](server/.env.example). Após isso, será necessário rodar todas as _migrations_ para o banco de dados, utilize o comando abaixo:

```sh
$ bunx drizzle-kit migrate
```

Após isso, você pode iniciar o servidor utilizando normalmente o comando:

```sh
$ bun run dev
```

Agora vamos iniciar o front-end, basta acessar a pasta [clients/web-app](clients/web-app) e iniciar o projeto utilizando o comando:

```sh
$ npm run dev
```

Pronto, a aplicação estará rodando na sua máquina em seu ambiente de desenvolvimento. Caso queira rodar a aplicação completa em um ambiente de produção, veja [Infraestrutura](#infraestrutura).

## Infraestrutura

Para seguir adiante, é necessário ter o [pulumi](https://www.pulumi.com/docs/iac/download-install/) instalado.

Caso queira rodar a aplicação completa com apenas um comando, siga os passos de [instalação](#instalação), logo após isso entre na pasta [infra/pulumi](infra/pulumi) e digite o seguinte comando:

```sh
$ pulumi up
```

**O código IAC ainda não está finalizado.**

## API

A API da aplicação está disponível em [server](server), ela foi projetada inicialmente em duas partes: [app](server/src/app) e [infra](server/src/infra). A pasta app contém toda a lógica da aplicação, a pasta Infra conecta essa lógica com serviços externos, sendo eles S3, SQS, EC2, Postgres e, por fim, [ElysiaJS](https://elysiajs.com) como sua interface HTTP.

Ela foi projetada para rodar como uma aplicação serverless, tendo assim seus custos reduzidos.

Principais bibliotecas utilizadas:

- [AWS SDK](https://aws.amazon.com/pt/sdk-for-javascript/)
- [Casl](https://casl.js.org/v6/en/) (Gerenciamento de cargos, RABC)
- [Drizzle](https://orm.drizzle.team/) (Integração com banco de dados)
- [ElysiaJS](https://elysiajs.com)
- [zod](https://zod.dev/) (Criação de schemas)

## Front end

O front-end está disponível em Webapp, uma aplicação feita utilizando React e React Router v7, contendo toda a interface da plataforma e também um painel administrador no qual é responsável por todas as informações e ações disponíveis.

A aplicação é dividida em 3 layouts, sendo eles: Public, Private, Internal.

- Public: É responsável por todas as páginas para usuários não autenticados.
- Private: É responsável por todas as páginas nas quais é necessário estar autenticado.
- Internal: É responsável por páginas que requerem um cargo específico.

Todas as páginas que utilizam os layouts: Public e Private, são renderizadas pelo lado do servidor. As páginas que utilizam o layout Internal são renderizadas pelo cliente.

Principais bibliotecas utilizadas:

- [React Route V7](https://reactrouter.com/home)
- [TailwindCSS](https://tailwindcss.com/) (Estilização)
- [Motion](https://motion.dev/docs/react) (Animações)
- [DashJS](https://dashjs.org/) (Reprodução de videos em dash)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction) (Gerenciamento de estado)
- [React Query](https://tanstack.com/query/v5/docs/framework/react/overview) (Gerenciar queries)
- [Recharts & Shadcn](https://ui.shadcn.com/docs/components/chart) (Graficos)

## Progresso

Lista das principais funcionalidades pendentes:

- [ ] Finalizar a criação de instancia EC2 para cada encode.
  - Ao realizar o upload de um arquivo de video um encode é criado com o status **PENDENTE**, após isso devemos iniciar uma instancia EC2 rodando nossa aplicação [packages/encoder](#encoder) assim processando o video por completo.
- [ ] Finalizar painel de administrador (catalog, populate, encodes)
  - Finalizar sessão de catalogo, e centro de media.
- [ ] Integração social
  - Sistema de amigos, watch party, e recomendações.

## Conceitos e lógica

Em breve.

## Mantedores

[@zyxsz](https://github.com/zyxsz)

## License

[MIT](LICENSE) © zyxsz
