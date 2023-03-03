import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import fs from "fs";

const prisma = new PrismaClient();

export const createPost = async (
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

export const updateViewCount = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json(post);
    return res.status(201).send({
      status: true,
      data: {
        post,
      },
    });
  } catch (error: any) {
    return res.status(400).send({
      status: true,
      message: error.message,
    });
  }
};

export const updatePublishPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;

  try {
    const postData = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
    res.json(updatedPost);
  } catch (error: any) {
    return res.status(400).send({
      status: true,
      message: error.message,
    });
  }
};

export const getDrafPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;

  const drafts = await prisma.user
    .findUnique({
      where: {
        id: Number(id),
      },
    })
    .posts({
      where: { published: false },
    });

  return res.status(201).send({
    status: true,
    data: {
      drafts,
    },
  });
};

export const deletePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;

  try {
    const postImages = await prisma.image.findMany({
      where: {
        postId: Number(id),
      },
    });

    postImages.forEach((i) => {
      fs.unlinkSync(i.url);
    });

    const deleteImages = await prisma.image.deleteMany({
      where: {
        postId: Number(id),
      },
    });

    const post = await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });
    return res.status(201).send({
      status: true,
      data: {
        post,
        ...deleteImages,
        postImages,
      },
    });
  } catch (err: any) {
    return res.status(400).send({
      status: true,
      message: err.message,
    });
  }
};

export const getSinglePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { id }: { id?: string } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: true, images: true },
  });
  res.json(post);
};

export const searchPosts = async (
  req: express.Request,
  res: express.Response
) => {
  const { searchString, skip, take, orderBy } = req.query;

  const or: Prisma.PostWhereInput = searchString
    ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...or,
    },
    include: { author: true },
    take: Number(take) || undefined,
    skip: Number(skip) || undefined,
    orderBy: {
      updatedAt: orderBy as Prisma.SortOrder,
    },
  });

  res.json(posts);
};
