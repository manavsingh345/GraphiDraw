import express from "express"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
import {prismaClient} from "@repo/database/client"
import bcrypt from "bcrypt";

const app=express();


app.post("/signup",async (req,res)=>{
    //ZOD validation
    const parsed = CreateUserSchema.safeParse(req.body);
    if(!parsed.success){
        return res.json({
            message:"Incorrect inputs"
        })
        
    }

    const {email,password,name,photo}=parsed.data;
    try{
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await prismaClient.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                //@ts-ignore
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

app.post("/room",middleware,(req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }
    //db call
    res.json({
        roomId:123
    })
})
app.listen(3001);
