# Checklist para Deploy no EasyPanel

Siga estes passos para garantir um deploy bem-sucedido no EasyPanel:

## Preparação

1. Certifique-se de que todas as alterações estão commitadas no repositório Git
2. Verifique se arquivos importantes estão configurados corretamente:
   - `Dockerfile` - configuração do container
   - `docker-compose.yml` - configuração para desenvolvimento local
   - `easypanel-build.sh` - script de build para EasyPanel

## Configuração do Deploy

1. No EasyPanel, crie um projeto novo baseado em Docker
2. Configure as variáveis de ambiente:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=postgres://username:password@hostname:5432/database?sslmode=disable` (substitua com seus valores reais)
   - `SESSION_SECRET=valor-secreto-unico-para-sessao` (substitua com um valor único e seguro)

3. Configure o diretório persistente:
   - Adicione um volume em `/app/uploads` para armazenar os uploads de arquivo

## Solução de Problemas Comuns

### Erro "Cannot find package 'vite'"

Esse erro ocorre porque o Vite é uma dependência de desenvolvimento e o EasyPanel por padrão não instala dependências de desenvolvimento.

**Solução**: Utilize o script `easypanel-build.sh` para customizar o processo de build.

### Erro de conexão com banco de dados

Se o aplicativo não conseguir se conectar ao banco de dados, verifique:

1. A string de conexão `DATABASE_URL` está correta? 
2. O banco de dados PostgreSQL está acessível a partir do container?
3. As tabelas foram criadas? Execute manualmente o comando de migração se necessário.

### Arquivos estáticos não são carregados

Se os arquivos CSS, JS ou imagens não estiverem sendo carregados:

1. Verifique se o build está copiando corretamente os assets para a pasta `dist/assets`
2. Certifique-se de que o servidor está servindo os arquivos estáticos corretamente

## Passos Finais

Após o deploy, acesse a aplicação e verifique:

1. Login funciona corretamente
2. Navegação entre as páginas
3. Upload e visualização de fotos
4. Criação e edição de RDOs
5. Geração de PDFs

Se encontrar problemas, consulte os logs do container no EasyPanel.