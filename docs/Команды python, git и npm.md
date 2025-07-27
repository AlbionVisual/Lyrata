# Команды запуска кодов

## Первая инициализация:

#### Для бэкенда команды из папки `lyrata-python-app`:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Для фронтенда из `lyrata-electron-app`:

```powershell
npm install
```

## Для запуска:

#### Бэкенд:

```powershell
venv\Scripts\activate
python app.py
```

#### Фронтэнд

```powershell
npm start
```

## Экспорт проекта

1. Экспортировать python-приложение в .exe, занести его в папку с фронтендом
2. После проверки работы запустить `npm run electron-pack`. Для windows необходимо запускать с правами администратора, т. е. не в стандартном терминале VSCode.

# Команды использования Git

Простые правила совместного пользования Git репозиторием:

1. **Не коммитить в ветку main, только мёржить** (для этого нужно создать свою ветку и запушить сразу её, либо смёржить с main веткой и запушить main ветку)
2. **Не коммитить неработающий код или баги**

#### Проверка состояния репозитория:

```powershell
git status
```

#### Создать ветку на текущей позиции:

```powershell
git switch -c BranchName
```

#### Закоммитить изменения:

```powershell
git add .
git commit -m "My commit message, I describe here what I did"
```

#### Запушить коммиты:

```powershell
git push origin BranchName
```

#### Получить изменения с GitHub:

```powershell
git pull origin BranchName
```

#### Перемещение по веткам

Сначала необходимо закоммитить изменения, чтобы они не переместились в другую ветку. Затем для изменения ветки выполнить:

```powershell
git switch BranchName2
```

#### Смёржить две ветки

Нужно определиться кого куда, например BranchName -> main, для этого нужно переместится в main и выполнить:

```powershell
git merge BranchName
```
