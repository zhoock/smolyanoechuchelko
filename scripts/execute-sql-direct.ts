#!/usr/bin/env tsx
/**
 * Выполняет SQL напрямую через Supabase используя service role key
 * (подсказки по применению миграции в Dashboard).
 *
 * Ожидает переменные окружения: SUPABASE_URL или VITE_SUPABASE_URL
 * (например из `export` после правки .env или из Netlify CLI).
 */

function projectRefFromSupabaseUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.split('.')[0] || 'your-project-ref';
  } catch {
    return 'your-project-ref';
  }
}

const SQL_COMMANDS = [
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;`,
  `CREATE INDEX IF NOT EXISTS idx_articles_is_draft ON articles(is_draft);`,
  `COMMENT ON COLUMN articles.is_draft IS 'Черновик статьи (true) или опубликованная статья (false)';`,
  `UPDATE articles SET is_draft = false WHERE is_draft IS NULL;`,
];

async function executeSQL(sql: string, supabaseUrl: string) {
  const projectRef = projectRefFromSupabaseUrl(supabaseUrl);

  console.log('📝 SQL команда для выполнения:');
  console.log(sql);
  console.log('');

  try {
    console.log('💡 Выполните SQL в Supabase Dashboard:');
    console.log('   1. Откройте https://supabase.com/dashboard');
    console.log(`   2. Выберите проект: ${projectRef}`);
    console.log('   3. Перейдите в SQL Editor');
    console.log('   4. Вставьте и выполните SQL команду выше\n');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';

  console.log('🚀 Применение миграции 017_add_is_draft_to_articles.sql\n');
  console.log('⚠️  Supabase REST API не поддерживает прямой SQL execution');
  console.log('    Используйте один из способов ниже:\n');

  if (!supabaseUrl) {
    console.error(
      '❌ Задайте SUPABASE_URL или VITE_SUPABASE_URL (например из файла .env через export).'
    );
    process.exit(1);
  }

  const projectRef = projectRefFromSupabaseUrl(supabaseUrl);
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  console.log('📋 Способ 1: Supabase Dashboard (рекомендуется)');
  console.log(`   1. Откройте: ${sqlEditorUrl}`);
  console.log('   2. Выполните следующие SQL команды:\n');

  for (const sql of SQL_COMMANDS) {
    await executeSQL(sql, supabaseUrl);
  }

  console.log('\n📋 Способ 2: Через psql (если установлен)');
  console.log('   Получите DATABASE_URL из Netlify Dashboard и выполните:');
  console.log('   psql "$DATABASE_URL" -f database/migrations/017_add_is_draft_to_articles.sql\n');

  console.log('✅ Миграция готова к применению!');
}

main().catch(console.error);
