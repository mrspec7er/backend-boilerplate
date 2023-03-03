import { PrismaClient } from "@prisma/client";
import express from "express";
import { RolesType } from "../utils/dataInterface";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = "mrc200";

const prisma = new PrismaClient();

const roles: RolesType = {
  author: 0,
  editor: 1,
  publisher: 2,
};

export const verifyUserToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  await handleVerifyUserToken(accessToken, res, next);
};

export const verifyAuthorToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  await handleVerifyUserRole(accessToken, res, next, roles.author);
};

export const verifyEditorToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  await handleVerifyUserRole(accessToken, res, next, roles.editor);
};

export const verifyPublisherToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  await handleVerifyUserRole(accessToken, res, next, roles.publisher);
};

async function handleVerifyUserToken(
  accessToken: string | undefined,
  res: express.Response,
  next: express.NextFunction
) {
  if (!accessToken) {
    return res.status(401).send({
      status: false,
      message: "Unauthorize!",
    });
  }

  jwt.verify(
    accessToken,
    ACCESS_TOKEN_SECRET,
    async (err: any, decode: any) => {
      if (err) {
        return res.status(401).send({
          status: false,
          message: err,
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          email: decode.email,
        },
      });

      if (!user) {
        return res.status(401).send({
          status: false,
          message: "Unauthorize!",
        });
      }

      res.locals.email = user.email;
      res.locals.role = user.role;

      next();
    }
  );
}

async function handleVerifyUserRole(
  accessToken: string | undefined,
  res: express.Response,
  next: express.NextFunction,
  roleID: number
) {
  if (!accessToken) {
    return res.status(401).send({
      status: false,
      message: "Unauthorize!",
    });
  }

  jwt.verify(
    accessToken,
    ACCESS_TOKEN_SECRET,
    async (err: any, decode: any) => {
      if (err) {
        return res.status(401).send({
          status: false,
          message: err,
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          email: decode.email,
        },
      });

      if (!user) {
        return res.status(401).send({
          status: false,
          message: "Unauthorize!",
        });
      }

      if (user.role !== roleID) {
        return res.status(401).send({
          status: false,
          message: "Access Denied!",
        });
      }

      res.locals.email = user.email;
      res.locals.role = user.role;

      next();
    }
  );
}
