import express from "express"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
import dotenv from "dotenv";
dotenv.config();
import {prismaClient} from "@repo/database/client"
import bcrypt from "bcrypt";

const app=express();
app.use(express.json());


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
        res.status(400).json({
            message:"Email already exits"
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
    try{
        const existingUser=await prismaClient.user.findUnique({
            where:{email}
        });

        if(!existingUser){
            return res.status(401).json({
                message:"Invalid email and password"
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
            JWT_SECRET,{ expiresIn: "7d" }
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

app.post("/room",middleware,async (req,res)=>{
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
            roomId:room.id
        })
    }catch(e){
        res.status(411).json({
            message:"Room already exits with this name"
        })
    }
});

app.get("/chats/:roomId",async(req,res)=>{
    const roomId=Number(req.params.roomId);
    try{
        const messages = await prismaClient.chat.findMany({
                where:{
                roomId:roomId
                },
                 orderBy:{
                 id:"desc"
                },
                take:50
        });
        res.json({
            message:messages
        });
    }catch(err){
        res.status(411).json({
            message:"Invlaid RoomId"
        })
    }
    
});

app.get("/room/:slug",async(req,res)=>{
    const slug=req.params.slug;
    try{
        const room=await prismaClient.room.findFirst({
        where:{
            slug
        }
        });
        res.json({
            room
        })
    }catch(e){
        res.status(404).json({
            message:"Slug does not exits"
        });
    } 
});
app.listen(3001);
