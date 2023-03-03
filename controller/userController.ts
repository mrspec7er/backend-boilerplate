import { PrismaClient } from "@prisma/client";
import express from "express";
import { RolesType } from "../utils/dataInterface";
import sendEmail from "../utils/sendEmail";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { resetPasswordEmailTemplate } from "../utils/emailTemplate";

const ACCESS_TOKEN_SECRET = "mrc200";
const REFRESH_TOKEN_SECRET = "mrc201";
const RESET_PASSWORD_SECRET = "mrc202";
const BASE_URL = "http://localhost:3000";

const prisma = new PrismaClient();

const roles: RolesType = {
  author: 0,
  editor: 1,
  publisher: 2,
};

async function createAccesToken(email: string) {
  return jwt.sign({ email }, ACCESS_TOKEN_SECRET, { expiresIn: 7200 });
}

async function createRefreshToken(email: string) {
  return jwt.sign(
    {
      email,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

async function createResetToken(email: string) {
  return jwt.sign({ email }, RESET_PASSWORD_SECRET, { expiresIn: 7200 });
}

export const createUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { name, email, password, role } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 11);

  try {
    if (
      role === roles.author ||
      role === roles.editor ||
      role === roles.publisher
    ) {
      await prisma.user.create({
        data: {
          name,
          email,
          password: encryptedPassword,
          role,
        },
      });

      return res.status(201).send({
        status: true,
        message: "Register sccess!",
      });
    } else {
      return res.status(401).send({
        status: false,
        message: "User role undefile!",
      });
    }
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  try {
    const userData = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userData) {
      return res.status(401).send({
        status: false,
        message: "Email Undefine!",
      });
    }

    const checkPassword = await bcrypt.compare(password, userData.password);

    if (!checkPassword) {
      return res.status(401).send({
        status: false,
        message: "Invalid Password!",
      });
    }

    const accessToken = await createAccesToken(userData.email);
    const refreshToken = await createRefreshToken(userData.email);

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   sameSite: "none",
    //   secure: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.status(201).json({
      status: true,
      data: { accessToken, refreshToken },
    });
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const refresh = async (req: express.Request, res: express.Response) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(406).send({
        status: false,
        message: "Unauthorize!",
      });
    }

    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      async (err: any, decode: any) => {
        if (err) {
          return res.status(406).send({
            status: false,
            message: "Unauthorize!",
          });
        }

        const user = await prisma.user.findUnique({
          where: {
            email: decode.email,
          },
        });

        if (!user) {
          return res.status(406).send({
            status: false,
            message: "Unauthorize!",
          });
        }

        const accessToken = await createAccesToken(user.email);
        return res.status(201).json({
          status: true,
          data: { accessToken },
        });
      }
    );
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const sendResetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(402).send({
        status: false,
        message: "User does not exist",
      });
    }

    const resetPasswordURL =
      BASE_URL + "/reset-password/" + (await createResetToken(user.email));

    const tempate = resetPasswordEmailTemplate("Mirace Corp", resetPasswordURL);
    const mailOptions = {
      from: "testing@ittsuexpo.com",
      to: "miracle8oys@gmail.com",
      subject: "This email sent from server",
      html: tempate,
    };

    await sendEmail(mailOptions);

    res.end();
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const resetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;
  try {
    if (!newPassword) {
      return res.status(403).send({
        status: false,
        message: "New Password field required",
      });
    }

    jwt.verify(
      resetToken,
      RESET_PASSWORD_SECRET,
      async (err: any, decode: any) => {
        if (err) {
          return res.status(403).send({
            status: false,
            message: err.message,
          });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 11);

        const user = await prisma.user.update({
          where: {
            email: decode.email,
          },
          data: {
            password: encryptedPassword,
          },
        });

        return res.status(201).json({
          status: true,
          message: "Successfully update password for " + user.email,
        });
      }
    );
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};
