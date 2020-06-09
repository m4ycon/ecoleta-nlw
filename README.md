<h1 align="center">
  <img height="450px" src="https://github.com/m4ycon/ecoleta-nlw/blob/master/readme-src/Capa.png" />
</h1>

<h1 align="center">
  <img height="400px" src="https://github.com/m4ycon/ecoleta-nlw/blob/master/readme-src/Inicio.png" />
  <img height="400px" src="https://github.com/m4ycon/ecoleta-nlw/blob/master/readme-src/Home.png" />
  <img height="400px" src="https://github.com/m4ycon/ecoleta-nlw/blob/master/readme-src/Detalhes.png" />
</h1>

---

# 📄About

The **ecoleta** project is an application aimed at recycling materials and makes it easier for users to get to know the collection points close to where they are, helping the environment. It was developed during Next Level Week #01, by **RocketSeat**.

---

# 🧰Technologies used
- **Typescript** back/front/mobile
- **Backend (NodeJS)**
  - express
  - sqlite3 with knex
  - celebrate
  - multer
  - [IBGE API](https://servicodados.ibge.gov.br/api/docs/localidades?versao=1)
- **Frontend (ReactJS)**
  - axios
  - leaflet 
  - react-dropzone
  - react-router-dom
  - react-hook-form
  - react-icons
- **Mobile (React Native)**
  - expo
  - axios
  - expo-mail-composer
  - react-native-maps

---

# 🏭How to install/use
- #### BACKEND (Obrigatory for both, frontend/mobile)
Open cmd
```bash
$ git clone https://github.com/m4ycon/ecoleta-nlw.git
$ cd ecoleta-nlw/server
$ npm install
```
##### Setting the database for your machine
Open server/src/controllers on your editor
```js
// Search for this lines on both files "ItemsController" and "PointsController"
// You can use ctrl + F to search
image_url: `http://192.168.25.4:3333/tmp/${...
// and change it to your IP (if you want to use the mobile app)
// if you don't, just use localhost:3333
image_url: `http://yourIP:3333/tmp/${...
```
Back to the cmd
```bash
# Initializing database
$ npm run knex:migrate
$ npm run knex:seed

# Running the server
$ npm run dev
```
- #### FRONTEND
```bash
# Running frontend:
$ cd web
$ npm install

# Run frontend
$ npm start
```
- #### MOBILE
For this you will need, an emulator ios or android, or having expo in your own smartphone.
Now on the project directory, execute:
```bash
# Running mobile:
$ cd mobile
$ npm install

# Run mobile
$ npm start
```
If you have expo, just scan the qrcode and be happy!
But if you are getting an error about "font" or something like that, try runnning this:
```bash
$ expo install @expo-google-fonts/dev expo-font
$ npm start
```

---

Made by Maycon Fabio 🚀
