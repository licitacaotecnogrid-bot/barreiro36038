import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não foi definida. Configure a variável de ambiente.');
  process.exit(1);
}

async function setupDatabase() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('🔄 Conectando ao banco de dados Supabase...');
    
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'database', 'init-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('📋 Criando tabelas...');
    await pool.query(schema);
    console.log('✅ Tabelas criadas com sucesso!');

    // Create a test user for login testing
    console.log('👤 Criando usuário de teste...');
    const testEmail = 'teste@pucminas.br';
    const testPassword = 'senha123';
    const testName = 'Usuário Teste';
    const testCargo = 'Coordenador';

    const result = await pool.query(
      'INSERT INTO "Usuario" (nome, email, senha, cargo) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET senha = $3 RETURNING id',
      [testName, testEmail, testPassword, testCargo]
    );

    console.log('✅ Usuário de teste criado!');
    console.log('\n📝 Credenciais de teste:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   Cargo: ${testCargo}`);
    console.log('\n✨ Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
