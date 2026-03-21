import dotenv from "dotenv";
dotenv.config();
import express from "express"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config";
import { middleware } from "./middleware";

import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
import { prismaClient } from "@repo/database/client";
import bcrypt from "bcrypt";
import cors from "cors";

const app=express();
const port = Number(process.env.PORT ?? 3001);
app.use(express.json());
app.use(cors())

async function getRoomIdByPublicId(publicId: string): Promise<number | null> {
    const room = await prismaClient.room.findUnique({
        where: {
            publicId
        },
        select: {
            id: true
        }
    });
    return room?.id ?? null;
}

app.post("/signup",async (req,res)=>{
    //ZOD validation
    const parsed = CreateUserSchema.safeParse(req.body);
    if(!parsed.success){
        return res.json({
            message:"Incorrect inputs"
        })
        
    }
    const {email,password,name,photo}=parsed.data;
    const existingUser=await prismaClient.user.findFirst({
        where:{
            email:email
        }
    });
    if(existingUser){
        return res.status(400).json({
            message:"Email already exists"
        })
    }

    try{
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await prismaClient.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                photo 
            }
        })
        res.json({
            userId:user.id
        })
    }catch(err:any){
        // unique email error
        if (err.code === "P2002") {
            return res.status(409).json({
            message: "Email already exists",
        });}
        res.status(500).json({
            message:"Something went wrong"
        }) 
    }

})

app.post("/signin",async (req,res)=>{
    const parsed=SigninSchema.safeParse(req.body);
    if(!parsed.success){
        return res.json({
            message:"Incorrect Inputs"
        })
    }
    const {email,password}=parsed.data;
    const rememberMe = req.body?.rememberMe === true;
    try{
        const existingUser=await prismaClient.user.findUnique({
            where:{email}
        });

        if(!existingUser){
            return res.status(401).json({
                message:"Invalid email and password"
            });
        }

        if (!existingUser.password || existingUser.password === "") {
            return res.status(401).json({
                message: "This account uses Clerk sign-in. Please continue with Clerk."
            });
        }
        
        const passwordMatch=await bcrypt.compare(password,existingUser.password);
        if(!passwordMatch){
            return res.status(401).json({
                message:"Invalid email or password"
            });
        }

        const token=jwt.sign(
            {userId:existingUser.id.toString()},
            JWT_SECRET,{ expiresIn: rememberMe ? "30d" : "7d" }
        );

        res.json({
            token
        })
    }catch(err:any){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
})

import { Request, Response } from "express";

app.post("/auth/sync", middleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true
        }
    });

    res.json({
        user
    });
});

app.post("/room",middleware,async (req: Request,res: Response)=>{
    const parseddata = CreateRoomSchema.safeParse(req.body);
    if(!parseddata.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }
    // @ts-ignore
    const userId=req.userId;
    const {slug}=parseddata.data;
    try{
        const room=await prismaClient.room.create({
            data:{
                slug:slug,
                adminId:userId
            }
        })
        res.json({
            roomPublicId: room.publicId
        })
    }catch(e: any){
        console.log("Error creating room:", e);
        if (e?.code === "P2002") {
            return res.status(409).json({
                message:"Room already exists with this name"
            });
        }
        res.status(500).json({
            message:"Failed to create room"
        })
    }
});

app.get("/shapes/:roomPublicId",async(req,res)=>{
    const roomPublicId = req.params.roomPublicId;
    try{
        const roomId = await getRoomIdByPublicId(roomPublicId);
        if (!roomId) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        const shapes = await prismaClient.shape.findMany({
            where:{
              roomId:roomId
            },
            orderBy:{
              createdAt:"asc"
            }
        });
        res.json({
            shapes
        });
    }catch(err){
        res.status(411).json({
            message:"Invlaid RoomId"
        })
    }
    
});

app.delete("/shapes/:roomPublicId", async (req, res) => {
  const roomPublicId = req.params.roomPublicId;

  try {
    const roomId = await getRoomIdByPublicId(roomPublicId);
    if (!roomId) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    await prismaClient.shape.deleteMany({
      where: {
        roomId: roomId,
      },
    });

    res.json({
      success: true,
      message: "Chats deleted for room",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to reset room",
    });
  }
});

app.delete("/shapes/:roomPublicId/:shapeId", async (req, res) => {
  const roomPublicId = req.params.roomPublicId;
  const { shapeId } = req.params;

  if (!shapeId) {
    return res.status(400).json({
      message: "Invalid roomPublicId or shapeId",
    });
  }

  try {
    const roomId = await getRoomIdByPublicId(roomPublicId);
    if (!roomId) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    const result = await prismaClient.shape.deleteMany({
      where: {
        roomId: roomId,
        id: shapeId,
      },
    });

    res.json({
      success: true,
      deleted: result.count,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete shape",
    });
  }
});


app.get("/room/:slug",async(req,res)=>{
    const slug=req.params.slug;
    try{
        const room=await prismaClient.room.findFirst({
            where:{
                slug
            },
            select: {
                id: true,
                slug: true,
                publicId: true
            }
        });
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        res.json({
            room
        })
    }catch(e){
        res.status(404).json({
            message:"Slug does not exits"
        });
    } 
});
app.listen(port, () => {
    console.log(`HTTP backend listening on port ${port}`);
});
