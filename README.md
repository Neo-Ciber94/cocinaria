# 🍰🧁 CocinarIA 🍔🍕

CocinarIA is an AI recipe generator that uses the `Vercel AI SDK` to generate the recipes, and uses
OpenAI `DALLE-3` for generating the recipe images.

By default it uses an `OpenAI` API Key but you can configure it to use `Gemini` or `Claude`.

> Currently OpenAI is configured for image generation.

## ✨ Proyect for: https://github.com/midudev/hackaton-vercel-2024

## 🌎 Web Page: https://cocinaria.vercel.app

## 🌈 Features

- Auth
  - [x] Google
  - [x] Github
  - [x] Discord
- [x] Home page with latest created recipes
- [x] Generate recipe page for user to generate recipes
- [x] My recipes page to show the user recipes

## 💻 Running locally

For running locally you need to setup some environment variables, checkout the `.env.example` file.

### Database
- `DATABASE_URL` a postgres database URL, you can use the `docker-compose.yml` file to easily set it up.

### Auth
You can configure any of those: Google, Discord or Github, checkout the `.env.example` file.

### Storage
 - `S3_BUCKET_NAME` The name of the S3 bucket
 - `S3_API_ENDPOINT` The name of the endpoint (optional)
 - `S3_ACCESS_KEY` Your AWS access key
 - `S3_ACCESS_SECRET_KEY` Your AWS secret key
 - `ASSETS_URL` The url where the images will be served from

I haven't tested without storage, but the app should generate recipes without problem but fail to upload the image,
you may want to disable storage in the code.

### AI
- `OPENAI_API_KEY` This is used to generate the recipes using the `AI SDK`.
