# Diário de Obra Pro

Um sistema completo para documentação e gestão de Relatórios Diários de Obra (RDOs) para equipes de construção e montagem metálica.

## Recursos Principais

- Cadastro e gestão de projetos
- Criação de RDOs com informações detalhadas:
  - Condições climáticas
  - Mão de obra
  - Equipamentos
  - Atividades realizadas
  - Ocorrências
  - Comentários
  - Fotos com legendas
- Galeria de fotos organizada por data
- Geração de relatórios em PDF
- Gestão de equipe por projeto
- Painel administrativo com estatísticas

## Tecnologias Utilizadas

- Frontend: React com TypeScript, Tailwind CSS
- Backend: Node.js com Express
- Banco de dados: PostgreSQL
- Autenticação: Sistema próprio com criptografia segura
- PDF: Geração dinâmica de relatórios profissionais

## Implantação com Docker

O sistema pode ser facilmente implantado usando Docker e Docker Compose:

```bash
# Clonar o repositório
git clone <repositório>
cd diario-obra-pro

# Configurar variáveis de ambiente (opcional)
# Por padrão, as configurações no docker-compose.yml já funcionam

# Iniciar os containers
docker-compose up -d
```

O aplicativo estará disponível em http://localhost:5000

### Configuração do Backup

O sistema inclui um script de backup automático do banco de dados:

1. O script está localizado em `scripts/backup.sh`
2. Para configurar um backup programado, adicione uma tarefa cron:

```bash
# Editar o crontab
crontab -e

# Adicionar a linha para backup diário às 2 da manhã
0 2 * * * /caminho/para/scripts/backup.sh
```

Os backups são armazenados no diretório `/backup` (montado como volume) e são mantidos por 7 dias.

## Usuário Padrão

O sistema cria automaticamente um usuário administrador:

- Username: admin
- Senha: admin123

Recomenda-se alterar esta senha após o primeiro login.

## Manutenção

Para atualizar o sistema:

```bash
# Parar os containers
docker-compose down

# Puxar as últimas alterações
git pull

# Reconstruir e iniciar os containers
docker-compose up -d --build
```

## Licença

Este software é proprietário. Todos os direitos reservados.