import express from "express";
import sendEmail from "../utils/sendEmail";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import crypto from "crypto";
const midtransClient = require("midtrans-client");

const prisma = new PrismaClient();
const SERVER_KEY = "SB-Mid-server-BLnzptd6JNNIcrOG2PY45GR8";
const CLIENT_KEY = "SB-Mid-client-rHzHHHflyG4fUZEZ";

export const index = async (req: express.Request, res: express.Response) => {
  return res.status(200).send({
    status: true,
    message: "Hello World!",
  });
};

export const sendEmaiil = async (
  req: express.Request,
  res: express.Response
) => {
  const { emailBody } = req.body;
  try {
    const mailOptions = {
      from: "testing@ittsuexpo.com",
      to: "miracle8oys@gmail.com",
      subject: "This is just for testing",
      html: emailBody,
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

export const uploadSingleFile = async (
  req: express.Request,
  res: express.Response
) => {
  const { email } = res.locals;
  try {
    if (req.file) {
      const updateProfile = await prisma.profile.create({
        data: {
          url: req.file.path,
          user: { connect: { email } },
        },
      });
      return res.status(201).send({
        status: true,
        data: {
          url: updateProfile,
        },
      });
    }

    return res.status(400).send({
      status: false,
      message: "Profile required",
    });
  } catch (err: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const uploadMultipleFile = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, content } = req.body;

  try {
    if (req.files?.length) {
      const urlList = req.files as Express.Multer.File[];

      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: { connect: { email: res.locals.email } },
        },
      });

      const uploadImageList: Array<{
        url: string;
        postId: number;
      }> = [];

      urlList.forEach((i) => {
        uploadImageList.push({
          url: i.path,
          postId: result.id,
        });
      });

      const imageList = await prisma.image.createMany({
        data: uploadImageList,
      });

      return res.status(201).send({
        status: true,
        data: {
          ...result,
          imageList,
        },
      });
    } else {
      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: { connect: { email: res.locals.email } },
        },
      });

      return res.status(201).send({
        status: true,
        data: {
          result,
        },
      });
    }
  } catch (err: any) {
    const urlList = req.files as Express.Multer.File[];

    urlList.forEach((i) => {
      fs.unlinkSync(i.path);
    });
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const payment = async (req: express.Request, res: express.Response) => {
  const { order_id, gross_amount, email } = req.body;
  try {
    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: SERVER_KEY,
      clientKey: CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      customer_details: {
        email: email,
        first_name: "Miracle",
        last_name: "Boy",
        phone: "+6281 1234 1234",
      },
      credit_card: {
        secure: true,
      },
    };

    snap.createTransaction(parameter).then((transaction: any) => {
      // transaction redirect_url
      const redirectUrl = transaction.redirect_url;
      console.log("redirectUrl:", redirectUrl);
      return res.status(201).send({
        status: true,
        message: redirectUrl,
      });
    });
  } catch (err: any) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

export const paymentNotification = async (
  req: express.Request,
  res: express.Response
) => {
  const { order_id, status_code, gross_amount, signature_key } = req.body;
  try {
    const createSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + SERVER_KEY)
      .digest("hex");

    if (createSignature === signature_key) {
      console.log(
        "NOTIFICATION WITH ORDER ID: " + order_id + " SUCCESS TO SENT"
      );
      res.end();
    }

    console.log("NOTIFICATION WITH ORDER ID: " + order_id + " UNAUTHORIZE");
    res.end();
  } catch (err: any) {
    console.log(err);
    res.end();
  }
};

export const paymentSuccess = async (
  req: express.Request,
  res: express.Response
) => {
  const { order_id, status_code, gross_amount, signature_key } = req.body;
  try {
    const createSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + SERVER_KEY)
      .digest("hex");

    if (createSignature === signature_key) {
      console.log("PAYMENT WITH ORDER ID: " + order_id + " SUCCESS");
      res.end();
    }

    console.log("ORDER ID: " + order_id + "UNAUTHORIZE");
    res.end();
  } catch (err: any) {
    console.log(err);
    res.end();
  }
};
