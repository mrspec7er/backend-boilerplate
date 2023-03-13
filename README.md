# Backend Boilerplate

Boilerplate for setup backend in node.js.

## Description

This boilerplate cover basic function for backend service like CRUD, Send Email, Storig Files, Authentication and Payment.

## Getting Started

### Dependencies

* express multer bcrypt nodemailer cors crypto midtrans-client dotenv jsonwebtoken morgan node-schedule

### Development Dependencies

* typescript prisma @types/express @types/node @types/jsonwebtoken @types/bcrypt @types/cors @types/morgan @types/multer @types/node-schedule @types/nodemailer nodemon ts-node

## Setup

### Setup Base Project: 
``` 
npm init -y 
```
``` 
npm i express bcrypt cors dotenv jsonwebtoken morgan node-schedule `
``
``` 
npm i -D typescript @types/express @types/node @types/jsonwebtoken @types/bcrypt @types/cors @types/morgan @types/multer @types/node-schedule @types/nodemailer nodemon ts-node 
```
``` 
npx tsc --init
```
* create file nodemon.json and automation script in package.json
* create and setup file index.ts

### Setup Database:
``` 
npm install prisma --save-dev 
```
``` 
npx prisma init --datasource-provider postgresql 
```
* create database model
``` 
npx prisma migrate dev --name init
```
```
npx prisma generate
```

### Setup file input:
``` 
npm i multer 
```
* create input handler middleware
* apply middleware in endpoint routes

### Setup email services
``` 
npm i nodemailer 
```
* create smtp server
* create email service function

### Setup payment services
``` 
npm i crypto midtrans-client 
```
* create midtrans account
* get server and client key
* create endpoint for create new transaction
* create endpoint that handle both notification and payment status
* create endpoint for redirect success and failed payment

## Authors
  
[@miracle8oys](https://twitter.com/miracle8oys)

## Version History

* 0.1
    * Initial Release

