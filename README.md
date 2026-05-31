# SyncDesk Mobile

Aplicativo mobile da plataforma SyncDesk, desenvolvido com Expo, React Native e TypeScript.

O SyncDesk Mobile é a interface mobile voltada principalmente para usuários/clientes da plataforma. O aplicativo inclui autenticação, recuperação de senha, perfil do usuário, abertura e acompanhamento de chamados, chat, triagem e atendimento em tempo real.

## Repositório

```text
https://github.com/Titus-System/syncdesk-mobile
```

## Tecnologias

| Tecnologia                | Uso                                                          |
| ------------------------- | ------------------------------------------------------------ |
| Expo                      | Ambiente de desenvolvimento e execução do app React Native   |
| React Native              | Camada de interface mobile                                   |
| Expo Router               | Roteamento baseado na estrutura da pasta `app/`              |
| TypeScript                | Linguagem principal da aplicação                             |
| NativeWind                | Estilização com classes no padrão Tailwind para React Native |
| TanStack React Query      | Requisições assíncronas, cache e estado de carregamento      |
| Expo Secure Store         | Armazenamento seguro de tokens e dados sensíveis             |
| WebSocket                 | Comunicação em tempo real para chat                          |
| Axios / fetch customizado | Comunicação HTTP com a SyncDesk API                          |
| Android Studio Emulator   | Execução local no emulador Android                           |
| Jest                      | Testes automatizados                                         |
| ESLint e Prettier         | Padronização e qualidade de código                           |

## Estrutura do projeto

```text
app/
|-- chat/
|-- _layout.tsx
|-- edit-profile.tsx
|-- forgot-password.tsx
|-- index.tsx
|-- login.tsx
|-- password-success.tsx
|-- profile.tsx
|-- reset-password.tsx
`-- tickets.tsx

components/
|-- BottomAppBar.tsx
`-- Toolbar.tsx

contexts/
`-- AuthContext.tsx

hooks/
|-- useAttendanceQuery.ts
|-- useClientConversations.ts
|-- useCreateTriageMutation.ts
|-- useLiveChatSocket.ts
|-- usePaginatedMessages.ts
|-- useSendTriageMessageMutation.ts
`-- useStartSupportMutation.ts

lib/
|-- api.ts
|-- auth-storage.ts
|-- env.ts
`-- errors.ts

services/
|-- chatbot.ts
`-- live-chat.ts

assets/
`-- images/
```

| Pasta         | Responsabilidade                                                          |
| ------------- | ------------------------------------------------------------------------- |
| `app/`        | Telas e rotas do aplicativo, seguindo o padrão do Expo Router             |
| `components/` | Componentes visuais reutilizáveis                                         |
| `contexts/`   | Contextos globais da aplicação, como autenticação                         |
| `hooks/`      | Hooks de consultas, mutações, paginação e WebSocket                       |
| `lib/`        | Configuração de API, variáveis de ambiente, storage e tratamento de erros |
| `services/`   | Serviços específicos de comunicação com recursos da API                   |
| `assets/`     | Imagens, ícones e recursos visuais do aplicativo                          |
| `android/`    | Projeto Android nativo gerado pelo Expo                                   |

## Pré-requisitos

- Node.js
- npm
- Expo via `npx`
- Android Studio
- Android Emulator configurado
- Android SDK
- Backend SyncDesk disponível

No desenvolvimento local em Windows, o fluxo mais comum é executar o app no emulador Android pelo Android Studio.

## Instalação e execução local

Clone o repositório:

```bash
git clone https://github.com/Titus-System/syncdesk-mobile.git
cd syncdesk-mobile
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure a URL da API no arquivo `.env`.

Inicie o Expo:

```bash
npm run start
```

Ou inicie limpando o cache:

```bash
npx expo start -c
```

Com o emulador Android aberto, pressione:

```text
a
```

Isso executa o aplicativo no Android Emulator.

## Variáveis de ambiente

O projeto utiliza variáveis de ambiente para definir a URL da API.

Antes de iniciar o app, configure a variável `EXPO_PUBLIC_API_BASE_URL` no arquivo `.env`.

Exemplo de `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://api.syncdesk.pro/api
```

| Variável                   | Descrição                                             |
| -------------------------- | ----------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | URL base da SyncDesk API usada pelo aplicativo mobile |

Por padrão, o projeto pode apontar para a API publicada:

```env
EXPO_PUBLIC_API_BASE_URL=http://api.syncdesk.pro/api
```

Para rodar com backend local no emulador Android, use:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
```

No Android Emulator, `localhost` aponta para o próprio emulador. Por isso, para acessar a API local da máquina host, use `10.0.2.2`.

Para rodar em um celular físico na mesma rede, use o IP local da máquina:

```env
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:8000/api
```

Exemplo:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8000/api
```

No Windows, o IP local pode ser consultado com:

```powershell
ipconfig
```

## Scripts disponíveis

| Comando              | Descrição                                                |
| -------------------- | -------------------------------------------------------- |
| `npm run start`      | Inicia o Expo/Metro                                      |
| `npx expo start -c`  | Inicia o Expo limpando o cache                           |
| `npm run android`    | Executa o app no Android                                 |
| `npm run ios`        | Executa o app no iOS, apenas em macOS                    |
| `npm run web`        | Executa a versão web, se aplicável                       |
| `npm run lint`       | Executa o ESLint                                         |
| `npm run test`       | Executa os testes                                        |
| `npm run type-check` | Executa a checagem de tipos TypeScript                   |
| `npm run check`      | Executa validações combinadas, se configurado no projeto |

## Execução no Windows

Fluxo recomendado para desenvolvimento:

```bash
cd syncdesk-mobile
npm install
npx expo start -c
```

Depois:

1. Abra o Android Studio
2. Inicie o emulador Android
3. Pressione `a` no terminal do Expo

Se for usar a API publicada, mantenha:

```env
EXPO_PUBLIC_API_BASE_URL=http://api.syncdesk.pro/api
```

Se for usar a API local no emulador Android, use:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
```

## Integração com o backend

O aplicativo depende da SyncDesk API para autenticação, chamados, chat, triagem, perfil e demais fluxos protegidos.

A URL da API é centralizada na variável:

```env
EXPO_PUBLIC_API_BASE_URL=
```

O backend precisa estar acessível pelo dispositivo em que o app está rodando.

Para testar se a API local está disponível, acesse no navegador da máquina:

```text
http://localhost:8000/docs
```

Para o emulador Android, a URL equivalente é:

```text
http://10.0.2.2:8000/docs
```

## Android Emulator

O ambiente de desenvolvimento principal usa o emulador Android pelo Android Studio.

Configuração comum:

| Item                  | Valor recomendado             |
| --------------------- | ----------------------------- |
| Device                | Pixel 9                       |
| Sistema               | Android recente e estável     |
| Execução              | Android Studio Device Manager |
| API local no emulador | `http://10.0.2.2:8000/api`    |

## Build Android

Quando for necessário gerar novamente o projeto nativo Android:

```bash
npx expo prebuild --clean
```

Para gerar o APK release:

```bash
cd android
./gradlew assembleRelease
```

No Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleRelease
```

O APK será gerado em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Para geração de APK release assinado, é necessário configurar a assinatura Android conforme o ambiente de distribuição do projeto.

## Solução de problemas

### O app não conecta na API local

Verifique se a API está rodando:

```text
http://localhost:8000/docs
```

Se estiver usando Android Emulator, configure:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
```

Se estiver usando celular físico, use o IP local da máquina:

```env
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:8000/api
```

Também verifique se o firewall do Windows permite conexões na porta `8000`.

### Alterei o `.env`, mas o app continua usando a URL antiga

Reinicie o Expo limpando o cache:

```bash
npx expo start -c
```

### O emulador não aparece

Verifique se o Android Emulator está aberto e se o `adb` reconhece o dispositivo:

```bash
adb devices
```

Se não aparecer nenhum dispositivo, reinicie o emulador pelo Android Studio.

### Erros de cache

Execute:

```bash
npx expo start -c
```

Se necessário, reinstale as dependências:

```bash
rm -rf node_modules
npm install
npx expo start -c
```

No Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npx expo start -c
```

### Porta do Expo ocupada

Finalize processos antigos do Node ou reinicie o terminal.

Depois rode novamente:

```bash
npx expo start -c
```

## Observações de desenvolvimento

- O aplicativo usa Expo Router, então as rotas são definidas pela estrutura da pasta `app/`.
- O arquivo `.env` define qual API o app irá consumir.
- No emulador Android, use `10.0.2.2` para acessar serviços locais da máquina.
- A API publicada padrão é `http://api.syncdesk.pro/api`.
- Para desenvolvimento com backend local, a API deve estar rodando com host `0.0.0.0` e porta liberada no firewall.
