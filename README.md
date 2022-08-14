# TacoAuth
The authentication site to connect Discord accounts to Trello accounts.

# Prerequisites
* [PostgreSQL](https://www.postgresql.org/) ([download & install](https://www.postgresql.org/download/))
* [Redis](https://redis.io/) ([quickstart](https://redis.io/topics/quickstart))
* A running [Taco](https://github.com/trello-talk/TacoInteractions) instance

# Installation
* Clone the repo
* Copy and paste `.env.example` to `.env` and fill in variables.
  * `PORT` needs to be an open port that can recieve incoming requests.
* `npm i -g yarn`
* `yarn install`

# Usage
In a development environment: Run `yarn dev`
In a production environment: Run `yarn build`, then `NODE_ENV=production yarn start`
