# Как получить Connection string из Supabase

## 📍 Точное местоположение

1. **Откройте Supabase Dashboard:**
   https://supabase.com/dashboard/project/your-project-ref

2. **В левом меню нажмите на иконку ⚙️ (Settings)** в самом верху страницы

3. **В разделе "PROJECT SETTINGS" нажмите "Database"** (НЕ "Data API")

4. **На странице Database Settings прокрутите вниз**

5. **Найдите один из разделов:**
   - **"Connection string"** - обычно внизу страницы
   - **"Connection pooling"** - может содержать строки подключения
   - **"Connection info"** - альтернативное название

6. **Скопируйте строку подключения:**
   - Обычно есть вкладки: "URI", "Connection string", "JDBC"
   - Выберите вкладку **"URI"** или **"Connection string"**
   - Скопируйте полную строку (она начинается с `postgresql://`)

## 📋 Формат строки

Строка должна выглядеть примерно так:

```
postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

Или через пулер:

```
postgresql://postgres.your-project-ref:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**ВАЖНО:** Замените `[YOUR-PASSWORD]` на ваш пароль проекта.

## ✅ После получения строки

1. **Добавьте в Netlify Dashboard:**
   - Production → вставьте строку
   - Local development → вставьте то же значение
   - Save

2. **Выполните миграцию:**
   ```bash
   export DATABASE_URL="полная_строка_подключения"
   export ENCRYPTION_KEY="[YOUR-ENCRYPTION-KEY]"
   npm run migrate
   ```

## 🆘 Если Connection string не найден

- Проект может еще развертываться (подождите 10-15 минут)
- Попробуйте обновить страницу
- Проверьте, что проект в статусе "Active" или "Ready"
